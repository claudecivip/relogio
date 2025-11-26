from binance.client import Client
from binance.exceptions import BinanceAPIException
import os
from typing import List, Dict, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class BinanceService:
    def __init__(self):
        self.api_key = os.getenv('BINANCE_API_KEY')
        self.api_secret = os.getenv('BINANCE_API_SECRET')
        
        if not self.api_key or not self.api_secret:
            logger.warning("Binance API keys not found in environment")
        
        self.client = None
        self.usdt_to_brl = float(os.getenv('USDT_TO_BRL', 5.0))
        self.use_testnet = os.getenv('BINANCE_TESTNET', 'true').lower() == 'true'
        
        logger.info(f"Binance service initialized (testnet: {self.use_testnet})")
    
    def _get_client(self):
        """Lazy initialization of Binance client"""
        if self.client is None:
            try:
                # Usar testnet por padrão para desenvolvimento seguro
                self.client = Client(
                    self.api_key, 
                    self.api_secret,
                    testnet=self.use_testnet,
                    tld='us' if not self.use_testnet else 'com'
                )
                logger.info("Binance client connected successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Binance client: {e}")
                raise
        return self.client
    
    def test_connection(self) -> bool:
        """Testa conexão com Binance"""
        try:
            client = self._get_client()
            client.ping()
            return True
        except Exception as e:
            logger.error(f"Binance connection test failed: {e}")
            return False
    
    def get_account_balance(self) -> Dict:
        """Retorna saldo da conta"""
        try:
            client = self._get_client()
            account = client.get_account()
            
            balances = {}
            total_usdt = 0.0
            
            for balance in account['balances']:
                free = float(balance['free'])
                locked = float(balance['locked'])
                total = free + locked
                
                if total > 0:
                    balances[balance['asset']] = {
                        'free': free,
                        'locked': locked,
                        'total': total
                    }
                    
                    # Converter para USDT (simplificado)
                    if balance['asset'] == 'USDT':
                        total_usdt += total
                    elif balance['asset'] in ['BTC', 'ETH', 'BNB']:
                        # Pegar preço atual e converter
                        try:
                            price = self.get_symbol_price(f"{balance['asset']}USDT")
                            total_usdt += total * price
                        except:
                            pass
            
            return {
                'balances': balances,
                'total_usdt': total_usdt,
                'total_brl': total_usdt * self.usdt_to_brl,
                'maker_commission': account.get('makerCommission', 0),
                'taker_commission': account.get('takerCommission', 0)
            }
        except BinanceAPIException as e:
            logger.error(f"Error getting account balance: {e}")
            raise
    
    def get_symbol_price(self, symbol: str) -> float:
        """Retorna preço atual de um símbolo"""
        try:
            client = self._get_client()
            ticker = client.get_symbol_ticker(symbol=symbol)
            return float(ticker['price'])
        except BinanceAPIException as e:
            logger.error(f"Error getting price for {symbol}: {e}")
            raise
    
    def get_top_symbols(self, limit: int = 10) -> List[Dict]:
        """Retorna os principais pares de trading"""
        try:
            # Pegar tickers de 24h
            tickers = self.client.get_ticker()
            
            # Filtrar apenas USDT pairs
            usdt_pairs = [t for t in tickers if t['symbol'].endswith('USDT')]
            
            # Ordenar por volume
            usdt_pairs.sort(key=lambda x: float(x['quoteVolume']), reverse=True)
            
            result = []
            for ticker in usdt_pairs[:limit]:
                result.append({
                    'symbol': ticker['symbol'],
                    'name': ticker['symbol'].replace('USDT', ''),
                    'price': float(ticker['lastPrice']),
                    'change': float(ticker['priceChange']),
                    'change_percent': float(ticker['priceChangePercent']),
                    'volume': float(ticker['quoteVolume']),
                    'high': float(ticker['highPrice']),
                    'low': float(ticker['lowPrice'])
                })
            
            return result
        except BinanceAPIException as e:
            logger.error(f"Error getting top symbols: {e}")
            raise
    
    def get_klines(self, symbol: str, interval: str = '1m', limit: int = 100) -> List[Dict]:
        """Retorna dados de candlestick"""
        try:
            klines = self.client.get_klines(
                symbol=symbol,
                interval=interval,
                limit=limit
            )
            
            result = []
            for k in klines:
                result.append({
                    'time': int(k[0] / 1000),  # Converter para segundos
                    'open': float(k[1]),
                    'high': float(k[2]),
                    'low': float(k[3]),
                    'close': float(k[4]),
                    'volume': float(k[5])
                })
            
            return result
        except BinanceAPIException as e:
            logger.error(f"Error getting klines for {symbol}: {e}")
            raise
    
    def place_market_order(self, symbol: str, side: str, quantity: float) -> Dict:
        """Executa ordem de mercado"""
        try:
            order = self.client.order_market(
                symbol=symbol,
                side=side,
                quantity=quantity
            )
            
            return {
                'order_id': order['orderId'],
                'symbol': order['symbol'],
                'side': order['side'],
                'type': order['type'],
                'status': order['status'],
                'quantity': float(order['origQty']),
                'executed_qty': float(order.get('executedQty', 0)),
                'price': float(order.get('price', 0)) if order.get('price') else 0
            }
        except BinanceAPIException as e:
            logger.error(f"Error placing market order: {e}")
            raise
    
    def place_limit_order(self, symbol: str, side: str, quantity: float, price: float) -> Dict:
        """Executa ordem limitada"""
        try:
            order = self.client.order_limit(
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=str(price),
                timeInForce='GTC'
            )
            
            return {
                'order_id': order['orderId'],
                'symbol': order['symbol'],
                'side': order['side'],
                'type': order['type'],
                'status': order['status'],
                'quantity': float(order['origQty']),
                'price': float(order['price'])
            }
        except BinanceAPIException as e:
            logger.error(f"Error placing limit order: {e}")
            raise
    
    def get_order_status(self, symbol: str, order_id: int) -> Dict:
        """Verifica status de uma ordem"""
        try:
            order = self.client.get_order(symbol=symbol, orderId=order_id)
            return {
                'order_id': order['orderId'],
                'status': order['status'],
                'executed_qty': float(order['executedQty']),
                'price': float(order.get('price', 0))
            }
        except BinanceAPIException as e:
            logger.error(f"Error getting order status: {e}")
            raise
    
    def cancel_order(self, symbol: str, order_id: int) -> bool:
        """Cancela uma ordem"""
        try:
            self.client.cancel_order(symbol=symbol, orderId=order_id)
            return True
        except BinanceAPIException as e:
            logger.error(f"Error canceling order: {e}")
            return False