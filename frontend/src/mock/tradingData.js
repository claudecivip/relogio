// Mock data para simular trading em tempo real

export const mockAssets = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 43250.50, change: 2.34, changePercent: 2.34, volume: 15234567890 },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 2285.75, change: -1.25, changePercent: -1.25, volume: 8456789012 },
  { symbol: 'BNBUSDT', name: 'Binance Coin', price: 305.40, change: 3.12, changePercent: 3.12, volume: 4567890123 },
  { symbol: 'SOLUSDT', name: 'Solana', price: 98.65, change: 5.67, changePercent: 5.67, volume: 3456789012 },
  { symbol: 'ADAUSDT', name: 'Cardano', price: 0.45, change: -0.89, changePercent: -0.89, volume: 2345678901 },
  { symbol: 'XRPUSDT', name: 'Ripple', price: 0.52, change: 1.23, changePercent: 1.23, volume: 5678901234 }
];

export const generateMockCandleData = (count = 100) => {
  const data = [];
  let basePrice = 43000;
  const now = Date.now();
  
  for (let i = count; i >= 0; i--) {
    const timestamp = now - (i * 60 * 1000); // 1 minuto por candle
    const open = basePrice + (Math.random() - 0.5) * 100;
    const close = open + (Math.random() - 0.5) * 200;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;
    
    data.push({
      time: timestamp / 1000,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2))
    });
    
    basePrice = close;
  }
  
  return data;
};

export const mockPositions = [
  {
    id: 1,
    symbol: 'BTCUSDT',
    type: 'LONG',
    amount: 0.5,
    entryPrice: 42800,
    currentPrice: 43250.50,
    pnl: 225.25,
    pnlPercent: 1.05,
    leverage: 5,
    liquidationPrice: 41200
  },
  {
    id: 2,
    symbol: 'ETHUSDT',
    type: 'SHORT',
    amount: 2.0,
    entryPrice: 2310,
    currentPrice: 2285.75,
    pnl: 48.50,
    pnlPercent: 1.05,
    leverage: 3,
    liquidationPrice: 2450
  }
];

export const mockTradeHistory = [
  {
    id: 1,
    symbol: 'BTCUSDT',
    type: 'BUY',
    amount: 0.1,
    price: 42500,
    total: 4250,
    time: new Date(Date.now() - 3600000).toISOString(),
    status: 'FILLED'
  },
  {
    id: 2,
    symbol: 'ETHUSDT',
    type: 'SELL',
    amount: 1.0,
    price: 2300,
    total: 2300,
    time: new Date(Date.now() - 7200000).toISOString(),
    status: 'FILLED'
  },
  {
    id: 3,
    symbol: 'BNBUSDT',
    type: 'BUY',
    amount: 5.0,
    price: 298,
    total: 1490,
    time: new Date(Date.now() - 10800000).toISOString(),
    status: 'FILLED'
  }
];

export const mockAccountBalance = {
  totalBalance: 50000.00,
  availableBalance: 45225.25,
  inPositions: 4774.75,
  totalPnL: 273.75,
  todayPnL: 125.50
};