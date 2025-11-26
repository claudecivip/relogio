"""
Serviço de fallback para quando Binance não está acessível.
Fornece dados simulados realistas para demonstração.
"""
import random
import time
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class FallbackDataService:
    """Fornece dados simulados quando Binance não está disponível"""
    
    def __init__(self):
        self.base_prices = {
            'BTCUSDT': 43250.50,
            'ETHUSDT': 2285.75,
            'BNBUSDT': 305.40,
            'SOLUSDT': 98.65,
            'ADAUSDT': 0.45,
            'XRPUSDT': 0.52,
            'DOGEUSDT': 0.08,
            'MATICUSDT': 0.75,
            'DOTUSDT': 6.85,
            'LINKUSDT': 14.25
        }
        logger.info("Fallback data service initialized")
    
    def get_account_balance(self) -> Dict:
        """Retorna saldo simulado"""
        return {
            'balances': {
                'USDT': {'free': 10000.0, 'locked': 0.0, 'total': 10000.0},
                'BTC': {'free': 0.1, 'locked': 0.0, 'total': 0.1},
                'ETH': {'free': 1.0, 'locked': 0.0, 'total': 1.0}
            },
            'total_usdt': 15000.0,
            'total_brl': 75000.0,
            'maker_commission': 10,
            'taker_commission': 10
        }
    
    def get_symbol_price(self, symbol: str) -> float:
        """Retorna preço simulado com variação"""
        base = self.base_prices.get(symbol, 100.0)
        variation = random.uniform(-0.02, 0.02)  # ±2% de variação
        return base * (1 + variation)
    
    def get_top_symbols(self, limit: int = 10) -> List[Dict]:
        """Retorna símbolos simulados"""
        symbols = list(self.base_prices.keys())[:limit]
        result = []
        
        for symbol in symbols:
            base_price = self.base_prices[symbol]
            variation = random.uniform(-5, 5)
            
            result.append({
                'symbol': symbol,
                'name': symbol.replace('USDT', ''),
                'price': base_price,
                'change': base_price * (variation / 100),
                'change_percent': variation,
                'volume': random.uniform(1000000, 10000000),
                'high': base_price * 1.05,
                'low': base_price * 0.95
            })
        
        return result
    
    def get_klines(self, symbol: str, interval: str = '1m', limit: int = 100) -> List[Dict]:
        """Retorna candlesticks simulados"""
        base_price = self.base_prices.get(symbol, 100.0)
        current_time = int(time.time())
        result = []
        
        # Intervalo em segundos
        interval_seconds = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '1h': 3600,
            '4h': 14400,
            '1d': 86400
        }.get(interval, 60)
        
        price = base_price
        
        for i in range(limit, 0, -1):
            timestamp = current_time - (i * interval_seconds)
            
            # Variação realista
            open_price = price
            close_price = price + random.uniform(-price * 0.01, price * 0.01)
            high_price = max(open_price, close_price) * random.uniform(1.001, 1.01)
            low_price = min(open_price, close_price) * random.uniform(0.99, 0.999)
            
            result.append({
                'time': timestamp,
                'open': round(open_price, 2),
                'high': round(high_price, 2),
                'low': round(low_price, 2),
                'close': round(close_price, 2),
                'volume': random.uniform(1000, 10000)
            })
            
            price = close_price
        
        return result
    
    def place_market_order(self, symbol: str, side: str, quantity: float) -> Dict:
        """Simula ordem de mercado"""
        price = self.get_symbol_price(symbol)
        
        return {
            'order_id': f'SIM{int(time.time())}',
            'symbol': symbol,
            'side': side,
            'type': 'MARKET',
            'status': 'FILLED',
            'quantity': quantity,
            'executed_qty': quantity,
            'price': price
        }

fallback_service = FallbackDataService()
