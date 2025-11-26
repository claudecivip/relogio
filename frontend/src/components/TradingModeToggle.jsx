import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TradingModeToggle = () => {
  const [mode, setMode] = useState('demo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentMode();
  }, []);

  const loadCurrentMode = async () => {
    try {
      const response = await axios.get(`${API}/trading/mode`);
      setMode(response.data.mode);
    } catch (error) {
      console.error('Error loading mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (checked) => {
    const newMode = checked ? 'real' : 'demo';
    
    // Confirmação para modo REAL
    if (newMode === 'real') {
      const confirmed = window.confirm(
        '⚠️ ATENÇÃO!\n\n' +
        'Você está prestes a ativar o MODO REAL.\n\n' +
        'Neste modo, o bot executará trades REAIS com seu dinheiro REAL na Binance.\n\n' +
        'Tem certeza que deseja continuar?'
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${API}/trading/mode/${newMode}`);
      
      setMode(newMode);
      
      if (newMode === 'real') {
        toast.error('🔴 MODO REAL ATIVADO! Trades serão executados com dinheiro real.', {
          duration: 5000
        });
      } else {
        toast.success('🟢 Modo DEMO ativado. Trades serão simulados.', {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error changing mode:', error);
      toast.error('Erro ao alterar modo');
    } finally {
      setLoading(false);
    }
  };

  const isRealMode = mode === 'real';

  if (loading) {
    return (
      <Card className="bg-[#0B0E11] border-[#1A1D23] p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-[#1A1D23] rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-[#1A1D23] rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border-2 transition-all ${
      isRealMode 
        ? 'bg-gradient-to-br from-[#ef5350]/10 to-[#0B0E11] border-[#ef5350]/30' 
        : 'bg-[#0B0E11] border-[#26a69a]/30'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isRealMode ? (
              <AlertTriangle className="text-[#ef5350]" size={20} />
            ) : (
              <Shield className="text-[#26a69a]" size={20} />
            )}
            <Label className="text-white font-semibold">
              Modo de Trading
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              isRealMode ? 'text-gray-400' : 'text-[#26a69a]'
            }`}>
              DEMO
            </span>
            <Switch
              checked={isRealMode}
              onCheckedChange={handleModeChange}
              disabled={loading}
              className={isRealMode ? 'bg-[#ef5350]' : 'bg-[#26a69a]'}
            />
            <span className={`text-sm font-medium ${
              isRealMode ? 'text-[#ef5350]' : 'text-gray-400'
            }`}>
              REAL
            </span>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${
          isRealMode 
            ? 'bg-[#ef5350]/10 border-[#ef5350]/30' 
            : 'bg-[#26a69a]/10 border-[#26a69a]/30'
        }`}>
          {isRealMode ? (
            <div>
              <p className="text-[#ef5350] font-bold text-sm mb-1">
                🔴 MODO REAL ATIVADO
              </p>
              <p className="text-gray-300 text-xs">
                Trades serão executados com dinheiro REAL na sua conta Binance. 
                Tenha cuidado e monitore constantemente!
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[#26a69a] font-bold text-sm mb-1">
                🟢 MODO DEMO ATIVO
              </p>
              <p className="text-gray-300 text-xs">
                Todos os trades são simulados. Seu dinheiro está seguro.
                Ative o modo REAL quando estiver pronto.
              </p>
            </div>
          )}
        </div>

        {isRealMode && (
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-500 text-xs font-medium">
              ⚠️ Sempre comece com valores pequenos no modo REAL!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TradingModeToggle;
