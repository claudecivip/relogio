from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class TradingSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invest_amount: float
    target_amount: float
    current_pnl: float = 0.0
    status: str = "active"  # active, stopped, completed
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    trades_count: int = 0

class Trade(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: Optional[str] = None
    symbol: str
    side: str  # BUY, SELL
    type: str  # MARKET, LIMIT
    amount: float
    price: float
    total: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str  # FILLED, PARTIAL, CANCELLED
    binance_order_id: Optional[str] = None

class Position(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: Optional[str] = None
    symbol: str
    type: str  # LONG, SHORT
    amount: float
    entry_price: float
    current_price: float
    pnl: float
    pnl_percent: float
    leverage: int = 1
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    liquidation_price: Optional[float] = None
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    status: str = "open"  # open, closed

class MarketData(BaseModel):
    symbol: str
    price: float
    change_24h: float
    change_percent_24h: float
    volume_24h: float
    high_24h: float
    low_24h: float

class CandleData(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: float

class TradingConfig(BaseModel):
    invest_amount: float
    target_amount: float