import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Play, Square } from 'lucide-react';
import { toast } from 'sonner';

const ControlPanel = ({ onStart, onStop, isRunning }) => {
  const [investAmount, setInvestAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleStart = () => {
    if (!investAmount || !targetAmount) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (parseFloat(investAmount) <= 0 || parseFloat(targetAmount) <= 0) {
      toast.error('Os valores devem ser maiores que zero');
      return;
    }

    if (parseFloat(targetAmount) <= parseFloat(investAmount)) {
      toast.error('A meta deve ser maior que o valor investido');
      return;
    }

    onStart({
      investAmount: parseFloat(investAmount),
      targetAmount: parseFloat(targetAmount)
    });
    
    toast.success('Trading automático iniciado!');
  };

  const handleStop = () => {
    onStop();
    toast.info('Trading automático pausado');
  };

  return (
    <Card className="bg-[#0B0E11] border-[#1A1D23] p-6">
      <h3 className="text-lg font-bold text-white mb-6">Painel de Controle</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="invest" className="text-gray-300 mb-2 block">
            Valor a Investir (R$)
          </Label>
          <Input
            id="invest"
            type="number"
            placeholder="Ex: 1000.00"
            value={investAmount}
            onChange={(e) => setInvestAmount(e.target.value)}
            disabled={isRunning}
            className="bg-[#1A1D23] border-[#2B2F36] text-white placeholder:text-gray-500"
          />
        </div>

        <div>
          <Label htmlFor="target" className="text-gray-300 mb-2 block">
            Meta a Ser Batida (R$)
          </Label>
          <Input
            id="target"
            type="number"
            placeholder="Ex: 1500.00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            disabled={isRunning}
            className="bg-[#1A1D23] border-[#2B2F36] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="pt-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="w-full bg-[#26a69a] hover:bg-[#1f8f82] text-white font-bold py-6 text-lg transition-all"
            >
              <Play className="mr-2" size={20} />
              Iniciar Trading Automático
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              className="w-full bg-[#ef5350] hover:bg-[#d43f3c] text-white font-bold py-6 text-lg transition-all"
            >
              <Square className="mr-2" size={20} />
              Parar Trading
            </Button>
          )}
        </div>

        {isRunning && (
          <div className="mt-4 p-4 bg-[#1A1D23] rounded-lg border border-[#26a69a]">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#26a69a] rounded-full animate-pulse"></div>
              <span className="text-[#26a69a] font-semibold">Trading Ativo</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              A IA está analisando o mercado e executando trades automaticamente
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ControlPanel;