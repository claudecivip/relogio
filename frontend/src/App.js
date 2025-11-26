import React, { useState, useEffect } from 'react';
import './App.css';
import { Toaster, toast } from './components/ui/sonner';
import TradingChart from './components/TradingChart';
import ControlPanel from './components/ControlPanel';
import AssetList from './components/AssetList';
import PositionsList from './components/PositionsList';
import TradeHistory from './components/TradeHistory';
import AccountBalance from './components/AccountBalance';
import { Bot } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');
  const [candleData, setCandleData] = useState([]);
  const [isTrading, setIsTrading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [balance, setBalance] = useState({ totalBalance: 0, availableBalance: 0, inPositions: 0, totalPnL: 0, todayPnL: 0 });
  const [tradingConfig, setTradingConfig] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar ativos do mercado
      const assetsResponse = await axios.get(`${API}/market/assets`);
      setAssets(assetsResponse.data);
      
      // Carregar saldo
      const balanceResponse = await axios.get(`${API}/account/balance`);
      const balanceData = balanceResponse.data;
      setBalance({
        totalBalance: balanceData.total_brl || 0,
        availableBalance: balanceData.total_brl || 0,
        inPositions: 0,
        totalPnL: 0,
        todayPnL: 0
      });
      
      // Carregar histórico de trades
      try {
        const tradesResponse = await axios.get(`${API}/trades/history`);
        setTradeHistory(tradesResponse.data);
      } catch (e) {
        console.log('No trades history yet');
      }
      
      // Carregar posições
      try {
        const positionsResponse = await axios.get(`${API}/positions/active`);
        setPositions(positionsResponse.data);
      } catch (e) {
        console.log('No active positions');
      }
      
      toast.success('Dados carregados da Binance!');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados. Usando modo demonstração.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados do gráfico quando mudar o ativo
  useEffect(() => {
    if (selectedAsset) {
      loadCandleData(selectedAsset);
    }
  }, [selectedAsset]);

  const loadCandleData = async (symbol) => {
    try {
      const response = await axios.get(`${API}/market/candles/${symbol}`, {
        params: { interval: '1m', limit: 100 }
      });
      setCandleData(response.data);
    } catch (error) {
      console.error('Error loading candles:', error);
    }
  };

  // Atualizar dados em tempo real
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Atualizar último candle
        if (selectedAsset) {
          const response = await axios.get(`${API}/market/candles/${selectedAsset}`, {
            params: { interval: '1m', limit: 1 }
          });
          
          if (response.data && response.data.length > 0) {
            setCandleData(prev => {
              const newData = [...prev];
              newData[newData.length - 1] = response.data[0];
              return newData;
            });
          }
        }
        
        // Atualizar lista de ativos
        const assetsResponse = await axios.get(`${API}/market/assets`);
        setAssets(assetsResponse.data);
        
      } catch (error) {
        console.error('Error updating data:', error);
      }
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [selectedAsset]);

  const handleStartTrading = async (config) => {
    try {
      const response = await axios.post(`${API}/trading/start`, config);
      
      if (response.data.status === 'started') {
        setTradingConfig(config);
        setIsTrading(true);
        toast.success('Trading automático iniciado!');
      }
    } catch (error) {
      console.error('Error starting trading:', error);
      toast.error('Erro ao iniciar trading automático');
    }
  };

  const handleStopTrading = async () => {
    try {
      await axios.post(`${API}/trading/stop`);
      setIsTrading(false);
      toast.info('Trading automático pausado');
    } catch (error) {
      console.error('Error stopping trading:', error);
      toast.error('Erro ao parar trading');
    }
  };

  const handleSelectAsset = (symbol) => {
    setSelectedAsset(symbol);
  };

  const handleClosePosition = async (positionId) => {
    try {
      await axios.post(`${API}/positions/close/${positionId}`);
      setPositions(prev => prev.filter(p => p.id !== positionId));
      toast.success('Posição fechada com sucesso');
    } catch (error) {
      console.error('Error closing position:', error);
      toast.error('Erro ao fechar posição');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050709] flex items-center justify-center">
        <div className="text-center">
          <Bot className="text-[#26a69a] mx-auto mb-4 animate-pulse" size={48} />
          <p className="text-white text-xl">Carregando dados da Binance...</p>
        </div>
      </div>
    );
  }

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