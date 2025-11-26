import asyncio
import logging
from typing import Dict, Optional
from datetime import datetime
from .binance_service import BinanceService
from .ai_trading_service import AITradingService
import sys
from pathlib import Path

# Add parent directory to path for config import
sys.path.append(str(Path(__file__).parent.parent))
from config.trading_config import trading_config

logger = logging.getLogger(__name__)

class TradingBot:
    def __init__(self, db):
        self.db = db
        self.binance = BinanceService()
        self.ai = AITradingService()
        self.is_running = False
        self.session_id = None
        self.config = None
        self.task = None
    
    async def start(self, config: Dict) -> Dict:
        """Inicia o bot de trading"""
        if self.is_running:
            return {'error': 'Bot already running'}
        
        try:
            # Testar conexão Binance
            if not self.binance.test_connection():
                return {'error': 'Failed to connect to Binance'}
            
            # Criar sessão
            session = {
                'invest_amount': config['invest_amount'],
                'target_amount': config['target_amount'],
                'current_pnl': 0.0,
                'status': 'active',
                'start_time': datetime.utcnow(),
                'trades_count': 0
            }
            
            result = await self.db.trading_sessions.insert_one(session)
            self.session_id = str(result.inserted_id)
            self.config = config
            self.is_running = True
            
            # Iniciar task em background
            self.task = asyncio.create_task(self._trading_loop())
            
            logger.info(f"Trading bot started. Session ID: {self.session_id}")
            
            return {
                'status': 'started',
                'session_id': self.session_id,
                'message': 'Bot de trading iniciado com sucesso'
            }
        
        except Exception as e:
            logger.error(f"Error starting trading bot: {e}")
            return {'error': str(e)}
    
    async def stop(self) -> Dict:
        """Para o bot de trading"""
        if not self.is_running:
            return {'error': 'Bot is not running'}
        
        self.is_running = False
        
        if self.task:
            self.task.cancel()
        
        # Atualizar sessão
        if self.session_id:
            await self.db.trading_sessions.update_one(
                {'_id': self.session_id},
                {'$set': {'status': 'stopped', 'end_time': datetime.utcnow()}}
            )
        
        logger.info("Trading bot stopped")
        
        return {
            'status': 'stopped',
            'message': 'Bot de trading parado'
        }
    
    def get_status(self) -> Dict:
        """Retorna status do bot"""
        return {
            'is_running': self.is_running,
            'session_id': self.session_id,
            'config': self.config
        }
    
    async def _trading_loop(self):
        """Loop principal de trading"""
        logger.info("Trading loop started")
        
        try:
            while self.is_running:
                try:
                    # 1. Obter dados do mercado
                    market_data = self.binance.get_top_symbols(limit=10)
                    
                    # 2. Obter saldo atual
                    account = self.binance.get_account_balance()
                    current_balance = account['total_usdt']
                    
                    # 3. Verificar se atingiu meta
                    if current_balance >= self.config['target_amount'] / self.binance.usdt_to_brl:
                        logger.info(f"Target reached! Current: ${current_balance:.2f}, Target: ${self.config['target_amount'] / self.binance.usdt_to_brl:.2f}")
                        await self.stop()
                        break
                    
                    # 4. Pedir decisão da IA
                    decision = await self.ai.analyze_market(
                        market_data,
                        current_balance,
                        self.config['target_amount'] / self.binance.usdt_to_brl
                    )
                    
                    logger.info(f"AI Decision: {decision}")
                    
                    # 5. Executar decisão
                    if decision['action'] == 'BUY' and decision.get('confidence', 0) > 0.7:
                        await self._execute_buy(decision, current_balance)
                    elif decision['action'] == 'SELL' and decision.get('confidence', 0) > 0.7:
                        await self._execute_sell(decision)
                    
                    # 6. Verificar posições abertas
                    await self._check_open_positions()
                    
                    # Aguardar antes da próxima iteração (30 segundos)
                    await asyncio.sleep(30)
                
                except asyncio.CancelledError:
                    logger.info("Trading loop cancelled")
                    break
                except Exception as e:
                    logger.error(f"Error in trading loop: {e}")
                    await asyncio.sleep(10)  # Aguardar um pouco antes de tentar novamente
        
        finally:
            logger.info("Trading loop ended")
    
    async def _execute_buy(self, decision: Dict, current_balance: float):
        """Executa ordem de compra"""
        try:
            symbol = decision['symbol']
            amount_percent = decision.get('amount_percent', 3.0)
            amount_usdt = (current_balance * amount_percent) / 100
            
            # Obter preço atual
            current_price = self.binance.get_symbol_price(symbol)
            
            # Calcular quantidade
            quantity = amount_usdt / current_price
            
            # Arredondar para 6 casas decimais (comum em cripto)
            quantity = round(quantity, 6)
            
            logger.info(f"Attempting to buy {quantity} of {symbol} at ${current_price:.2f}")
            
            # Verificar modo de trading
            if trading_config.is_real_mode():
                # MODO REAL - Executar ordem real na Binance
                logger.warning(f"🔴 REAL MODE: Executing REAL order on Binance")
                try:
                    order = self.binance.place_market_order(symbol, 'BUY', quantity)
                    logger.info(f"✅ Real order executed: {order}")
                except Exception as e:
                    logger.error(f"❌ Failed to execute real order: {e}")
                    # Fallback para simulação em caso de erro
                    order = {
                        'order_id': f'FAILED_{symbol}',
                        'symbol': symbol,
                        'side': 'BUY',
                        'quantity': quantity,
                        'price': current_price,
                        'error': str(e)
                    }
            else:
                # MODO DEMO - Apenas simular
                logger.info(f"🟢 DEMO MODE: Simulating order (no real money)")
                order = {
                    'order_id': f'DEMO_{int(datetime.utcnow().timestamp())}',
                    'symbol': symbol,
                    'side': 'BUY',
                    'quantity': quantity,
                    'price': current_price,
                    'status': 'SIMULATED'
                }
            
            # Salvar trade no banco
            trade = {
                'session_id': self.session_id,
                'symbol': symbol,
                'side': 'BUY',
                'type': 'MARKET',
                'amount': quantity,
                'price': current_price,
                'total': quantity * current_price,
                'timestamp': datetime.utcnow(),
                'status': 'FILLED',
                'binance_order_id': order['order_id']
            }
            
            await self.db.trades.insert_one(trade)
            logger.info(f"Buy order executed: {symbol}")
        
        except Exception as e:
            logger.error(f"Error executing buy order: {e}")
    
    async def _execute_sell(self, decision: Dict):
        """Executa ordem de venda"""
        try:
            # Implementar lógica de venda
            logger.info(f"Sell decision received for {decision.get('symbol')}")
            # TODO: Implementar
        except Exception as e:
            logger.error(f"Error executing sell order: {e}")
    
    async def _check_open_positions(self):
        """Verifica e gerencia posições abertas"""
        try:
            # Criar índice se não existir
            await self.db.positions.create_index([('status', 1), ('session_id', 1)])
            
            # Buscar posições abertas no banco com projeção
            positions = await self.db.positions.find(
                {'status': 'open', 'session_id': self.session_id},
                {
                    'id': 1,
                    'symbol': 1,
                    'entry_price': 1,
                    'type': 1,
                    'opened_at': 1
                }
            ).to_list(100)
            
            for position in positions:
                # Obter preço atual
                current_price = self.binance.get_symbol_price(position['symbol'])
                
                # Avaliar posição com IA
                decision = await self.ai.evaluate_position(position, current_price)
                
                if decision['action'] == 'CLOSE':
                    logger.info(f"Closing position: {position['symbol']} - {decision['reason']}")
                    # TODO: Implementar fechamento de posição
        
        except Exception as e:
            logger.error(f"Error checking positions: {e}")