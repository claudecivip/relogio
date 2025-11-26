import React, { useState, useEffect } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import TradingChart from './components/TradingChart';
import ControlPanel from './components/ControlPanel';
import AssetList from './components/AssetList';
import PositionsList from './components/PositionsList';
import TradeHistory from './components/TradeHistory';
import AccountBalance from './components/AccountBalance';
import { 
  mockAssets, 
  generateMockCandleData,
  mockPositions,
  mockTradeHistory,
  mockAccountBalance 
} from './mock/tradingData';
import { Bot } from 'lucide-react';

function App() {
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');
  const [candleData, setCandleData] = useState([]);
  const [isTrading, setIsTrading] = useState(false);
  const [positions, setPositions] = useState(mockPositions);
  const [tradeHistory, setTradeHistory] = useState(mockTradeHistory);
  const [balance, setBalance] = useState(mockAccountBalance);
  const [tradingConfig, setTradingConfig] = useState(null);

  useEffect(() => {
    // Gerar dados iniciais do gráfico
    setCandleData(generateMockCandleData(100));

    // Simular atualização em tempo real do gráfico
    const interval = setInterval(() => {
      setCandleData(prev => {
        const lastCandle = prev[prev.length - 1];
        const newPrice = lastCandle.close + (Math.random() - 0.5) * 50;
        
        const newCandle = {
          time: Date.now() / 1000,
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newPrice) + Math.random() * 20,
          low: Math.min(lastCandle.close, newPrice) - Math.random() * 20,
          close: newPrice
        };

        return [...prev.slice(1), newCandle];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simular trading automático
  useEffect(() => {
    if (!isTrading) return;

    const tradingInterval = setInterval(() => {
      // Simular atualização de posições
      setPositions(prev => 
        prev.map(pos => ({
          ...pos,
          currentPrice: pos.currentPrice + (Math.random() - 0.5) * 100,
          pnl: pos.pnl + (Math.random() - 0.5) * 50
        }))
      );

      // Simular atualização do saldo
      setBalance(prev => ({
        ...prev,
        totalPnL: prev.totalPnL + (Math.random() - 0.4) * 20,
        todayPnL: prev.todayPnL + (Math.random() - 0.4) * 10
      }));
    }, 5000);

    return () => clearInterval(tradingInterval);
  }, [isTrading]);

  const handleStartTrading = (config) => {
    setTradingConfig(config);
    setIsTrading(true);
  };

  const handleStopTrading = () => {
    setIsTrading(false);
  };

  const handleSelectAsset = (symbol) => {
    setSelectedAsset(symbol);
    setCandleData(generateMockCandleData(100));
  };

  const handleClosePosition = (positionId) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  return (
    <div className="min-h-screen bg-[#050709]">
      <Toaster position="top-right" theme="dark" />
      
      {/* Header */}
      <header className="bg-[#0B0E11] border-b border-[#1A1D23] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-[#26a69a] to-[#1f8f82] p-2 rounded-lg">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Trading Pro</h1>
                <p className="text-xs text-gray-400">Plataforma de Trading Automatizada</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Saldo Total</p>
                <p className="text-lg font-bold text-white">
                  R$ {balance.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda - Lista de Ativos */}
          <div className="lg:col-span-3">
            <AssetList 
              assets={mockAssets}
              onSelectAsset={handleSelectAsset}
              selectedAsset={selectedAsset}
            />
          </div>

          {/* Coluna Central - Gráfico e Histórico */}
          <div className="lg:col-span-6 space-y-6">
            <TradingChart 
              symbol={selectedAsset}
              candleData={candleData}
            />
            
            <TradeHistory trades={tradeHistory} />
          </div>

          {/* Coluna Direita - Controle e Posições */}
          <div className="lg:col-span-3 space-y-6">
            <AccountBalance balance={balance} />
            
            <ControlPanel
              onStart={handleStartTrading}
              onStop={handleStopTrading}
              isRunning={isTrading}
            />
            
            <PositionsList 
              positions={positions}
              onClosePosition={handleClosePosition}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0E11] border-t border-[#1A1D23] mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 AI Trading Pro - Plataforma de Trading Automatizada com IA</p>
            <p className="mt-2 text-xs">
              <span className="text-yellow-500">⚠️</span> Aviso: Trading de criptomoedas envolve riscos. Negocie com responsabilidade.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;