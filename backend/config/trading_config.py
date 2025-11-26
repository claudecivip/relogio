"""
Configuração do modo de trading (DEMO vs REAL)
"""
import os
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class TradingConfig:
    CONFIG_FILE = Path(__file__).parent / 'trading_mode.json'
    
    def __init__(self):
        self.load_config()
    
    def load_config(self):
        """Carrega configuração do arquivo"""
        try:
            if self.CONFIG_FILE.exists():
                with open(self.CONFIG_FILE, 'r') as f:
                    config = json.load(f)
                    self.mode = config.get('mode', 'demo')
            else:
                self.mode = os.getenv('TRADING_MODE', 'demo')
                self.save_config()
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            self.mode = 'demo'
    
    def save_config(self):
        """Salva configuração no arquivo"""
        try:
            self.CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(self.CONFIG_FILE, 'w') as f:
                json.dump({'mode': self.mode}, f)
        except Exception as e:
            logger.error(f"Error saving config: {e}")
    
    def is_demo_mode(self) -> bool:
        """Retorna True se estiver em modo demo"""
        return self.mode == 'demo'
    
    def is_real_mode(self) -> bool:
        """Retorna True se estiver em modo real"""
        return self.mode == 'real'
    
    def set_mode(self, mode: str):
        """Define o modo (demo ou real)"""
        if mode not in ['demo', 'real']:
            raise ValueError("Mode must be 'demo' or 'real'")
        
        self.mode = mode
        self.save_config()
        logger.info(f"Trading mode set to: {mode.upper()}")
    
    def get_mode(self) -> str:
        """Retorna o modo atual"""
        return self.mode
    
    def get_status(self) -> dict:
        """Retorna status completo"""
        return {
            'mode': self.mode,
            'is_demo': self.is_demo_mode(),
            'is_real': self.is_real_mode(),
            'description': 'Modo DEMO - Trades simulados' if self.is_demo_mode() else 'Modo REAL - Trades executados com dinheiro real',
            'warning': '⚠️ ATENÇÃO: Modo REAL ativado! Trades serão executados com dinheiro real.' if self.is_real_mode() else None
        }

# Instância global
trading_config = TradingConfig()
