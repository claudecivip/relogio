import React from 'react';
import { Card } from './ui/card';
import { Wallet, TrendingUp, DollarSign, PieChart } from 'lucide-react';

const AccountBalance = ({ balance }) => {
  const profitPercent = ((balance.totalPnL / balance.totalBalance) * 100).toFixed(2);
  const isProfitable = balance.totalPnL >= 0;

  return (
    <Card className="bg-[#0B0E11] border-[#1A1D23] p-6">
      <h3 className="text-lg font-bold text-white mb-6">Saldo da Conta</h3>
      
      <div className="space-y-4">
        {/* Saldo Total */}
        <div className="bg-gradient-to-br from-[#26a69a]/20 to-[#26a69a]/5 rounded-lg p-4 border border-[#26a69a]/30">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="text-[#26a69a]" size={18} />
            <span className="text-gray-300 text-sm">Saldo Total</span>
          </div>
          <p className="text-3xl font-bold text-white">
            R$ {balance.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A1D23] rounded-lg p-3 border border-[#2B2F36]">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="text-gray-400" size={16} />
              <span className="text-gray-400 text-xs">Disponível</span>
            </div>
            <p className="text-lg font-bold text-white">
              R$ {balance.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-[#1A1D23] rounded-lg p-3 border border-[#2B2F36]">
            <div className="flex items-center space-x-2 mb-2">
              <PieChart className="text-gray-400" size={16} />
              <span className="text-gray-400 text-xs">Em Posições</span>
            </div>
            <p className="text-lg font-bold text-white">
              R$ {balance.inPositions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* P&L */}
        <div className={`rounded-lg p-4 border ${
          isProfitable 
            ? 'bg-[#26a69a]/10 border-[#26a69a]/30' 
            : 'bg-[#ef5350]/10 border-[#ef5350]/30'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className={isProfitable ? 'text-[#26a69a]' : 'text-[#ef5350]'} size={18} />
            <span className="text-gray-300 text-sm">Lucro/Prejuízo Total</span>
          </div>
          <div className="flex items-baseline space-x-3">
            <p className={`text-2xl font-bold ${
              isProfitable ? 'text-[#26a69a]' : 'text-[#ef5350]'
            }`}>
              {isProfitable ? '+' : ''}R$ {balance.totalPnL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className={`text-sm font-semibold ${
              isProfitable ? 'text-[#26a69a]' : 'text-[#ef5350]'
            }`}>
              ({isProfitable ? '+' : ''}{profitPercent}%)
            </span>
          </div>
        </div>

        {/* P&L Hoje */}
        <div className="bg-[#1A1D23] rounded-lg p-3 border border-[#2B2F36]">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Lucro Hoje</span>
            <span className={`font-bold ${
              balance.todayPnL >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'
            }`}>
              {balance.todayPnL >= 0 ? '+' : ''}R$ {balance.todayPnL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountBalance;