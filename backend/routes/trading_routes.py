from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List
import logging
from datetime import datetime
import asyncio
import json

from models.trading_models import TradingConfig, Trade, Position
from services.binance_service import BinanceService
from services.trading_bot import TradingBot
import sys
from pathlib import Path

# Add parent directory to path for config import
sys.path.append(str(Path(__file__).parent.parent))
from config.trading_config import trading_config as global_trading_config

logger = logging.getLogger(__name__)

def create_trading_router(db, trading_bot: TradingBot):
    router = APIRouter(prefix="/api", tags=["trading"])
    binance_service = BinanceService()
    
    # WebSocket connections
    active_connections: List[WebSocket] = []
    
    # ============ CONTA E SALDO ============
    
    @router.get("/account/balance")
    async def get_balance():
        """Retorna saldo da conta Binance"""
        try:
            balance = binance_service.get_account_balance()
            return balance
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/account/test")
    async def test_connection():
        """Testa conexão com Binance"""
        try:
            is_connected = binance_service.test_connection()
            return {
                'connected': is_connected,
                'message': 'Conexão com Binance OK' if is_connected else 'Falha na conexão'
            }
        except Exception as e:
            return {'connected': False, 'error': str(e)}
    
    # ============ MERCADO E DADOS ============
    
    @router.get("/market/assets")
    async def get_market_assets():
        """Retorna lista de ativos disponíveis"""
        try:
            assets = binance_service.get_top_symbols(limit=20)
            return assets
        except Exception as e:
            logger.error(f"Error getting market assets: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/market/candles/{symbol}")
    async def get_candles(symbol: str, interval: str = '1m', limit: int = 100):
        """Retorna dados de candlestick"""
        try:
            candles = binance_service.get_klines(symbol, interval, limit)
            return candles
        except Exception as e:
            logger.error(f"Error getting candles: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/market/price/{symbol}")
    async def get_price(symbol: str):
        """Retorna preço atual"""
        try:
            price = binance_service.get_symbol_price(symbol)
            return {'symbol': symbol, 'price': price}
        except Exception as e:
            logger.error(f"Error getting price: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============ TRADING AUTOMÁTICO ============
    
    @router.post("/trading/start")
    async def start_trading(config: TradingConfig):
        """Inicia trading automático"""
        try:
            result = await trading_bot.start(config.dict())
            
            if 'error' in result:
                raise HTTPException(status_code=400, detail=result['error'])
            
            return result
        except Exception as e:
            logger.error(f"Error starting trading: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/trading/stop")
    async def stop_trading():
        """Para trading automático"""
        try:
            result = await trading_bot.stop()
            
            if 'error' in result:
                raise HTTPException(status_code=400, detail=result['error'])
            
            return result
        except Exception as e:
            logger.error(f"Error stopping trading: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/trading/status")
    async def get_trading_status():
        """Retorna status do bot"""
        bot_status = trading_bot.get_status()
        mode_status = global_trading_config.get_status()
        
        return {
            **bot_status,
            'trading_mode': mode_status
        }
    
    @router.get("/trading/mode")
    async def get_trading_mode():
        """Retorna modo de trading atual"""
        return global_trading_config.get_status()
    
    @router.post("/trading/mode/{mode}")
    async def set_trading_mode(mode: str):
        """Define modo de trading (demo ou real)"""
        try:
            if mode not in ['demo', 'real']:
                raise HTTPException(
                    status_code=400, 
                    detail="Mode must be 'demo' or 'real'"
                )
            
            global_trading_config.set_mode(mode)
            
            return {
                'status': 'success',
                'message': f'Modo alterado para {mode.upper()}',
                'config': global_trading_config.get_status()
            }
        except Exception as e:
            logger.error(f"Error setting mode: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============ TRADES E HISTÓRICO ============
    
    @router.get("/trades/history")
    async def get_trade_history(limit: int = 50):
        """Retorna histórico de trades"""
        try:
            # Criar índice se não existir
            await db.trades.create_index([('timestamp', -1)])
            
            # Query otimizada com projeção
            trades = await db.trades.find(
                {},
                {
                    'id': 1,
                    'session_id': 1,
                    'symbol': 1,
                    'side': 1,
                    'type': 1,
                    'amount': 1,
                    'price': 1,
                    'total': 1,
                    'timestamp': 1,
                    'status': 1,
                    'binance_order_id': 1
                }
            ).sort('timestamp', -1).limit(limit).to_list(limit)
            return trades
        except Exception as e:
            logger.error(f"Error getting trade history: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============ POSIÇÕES ============
    
    @router.get("/positions/active")
    async def get_active_positions():
        """Retorna posições ativas"""
        try:
            # Criar índice se não existir
            await db.positions.create_index([('status', 1), ('session_id', 1)])
            
            # Query otimizada com projeção
            positions = await db.positions.find(
                {'status': 'open'},
                {
                    'id': 1,
                    'session_id': 1,
                    'symbol': 1,
                    'type': 1,
                    'amount': 1,
                    'entry_price': 1,
                    'current_price': 1,
                    'pnl': 1,
                    'pnl_percent': 1,
                    'leverage': 1,
                    'stop_loss': 1,
                    'take_profit': 1,
                    'liquidation_price': 1,
                    'opened_at': 1,
                    'status': 1
                }
            ).limit(100).to_list(100)
            return positions
        except Exception as e:
            logger.error(f"Error getting positions: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/positions/close/{position_id}")
    async def close_position(position_id: str):
        """Fecha uma posição"""
        try:
            # TODO: Implementar fechamento de posição
            result = await db.positions.update_one(
                {'id': position_id},
                {'$set': {'status': 'closed', 'closed_at': datetime.utcnow()}}
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Position not found")
            
            return {'status': 'success', 'message': 'Posição fechada'}
        except Exception as e:
            logger.error(f"Error closing position: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============ WEBSOCKET ============
    
    @router.websocket("/ws/market")
    async def websocket_market(websocket: WebSocket):
        """WebSocket para dados de mercado em tempo real"""
        await websocket.accept()
        active_connections.append(websocket)
        
        try:
            while True:
                # Enviar dados de mercado a cada 2 segundos
                try:
                    assets = binance_service.get_top_symbols(limit=10)
                    await websocket.send_json({
                        'type': 'market_update',
                        'data': assets,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    logger.error(f"Error sending market data: {e}")
                
                await asyncio.sleep(2)
        
        except WebSocketDisconnect:
            active_connections.remove(websocket)
            logger.info("WebSocket client disconnected")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            if websocket in active_connections:
                active_connections.remove(websocket)
    
    @router.websocket("/ws/trading")
    async def websocket_trading(websocket: WebSocket):
        """WebSocket para status de trading"""
        await websocket.accept()
        
        try:
            while True:
                # Enviar status do bot
                status = trading_bot.get_status()
                await websocket.send_json({
                    'type': 'trading_status',
                    'data': status,
                    'timestamp': datetime.utcnow().isoformat()
                })
                
                await asyncio.sleep(5)
        
        except WebSocketDisconnect:
            logger.info("Trading WebSocket disconnected")
        except Exception as e:
            logger.error(f"Trading WebSocket error: {e}")
    
    return router