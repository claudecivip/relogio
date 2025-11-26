import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

const PositionsList = ({ positions, onClosePosition }) => {
  if (positions.length === 0) {
    return (
      <Card className="bg-[#0B0E11] border-[#1A1D23] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Posições Abertas</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">Nenhuma posição aberta no momento</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0B0E11] border-[#1A1D23] p-6">
      <h3 className="text-lg font-bold text-white mb-4">Posições Abertas</h3>
      
      <div className="space-y-3">
        {positions.map((position) => {
          const isProfit = position.pnl >= 0;
          const isLong = position.type === 'LONG';
          
          return (
            <div
              key={position.id}
              className="bg-[#1A1D23] rounded-lg p-4 border border-[#2B2F36] hover:border-[#3B3F46] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    isLong ? 'bg-[#26a69a]/20 text-[#26a69a]' : 'bg-[#ef5350]/20 text-[#ef5350]'
                  }`}>
                    {position.type}
                  </div>
                  <span className="text-white font-semibold">{position.symbol}</span>
                  <span className="text-gray-400 text-sm">x{position.leverage}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onClosePosition(position.id)}
                  className="text-gray-400 hover:text-white hover:bg-[#2B2F36] h-6 w-6 p-0"
                >
                  <X size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Quantidade</p>
                  <p className="text-white font-semibold">{position.amount}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Entrada</p>
                  <p className="text-white font-semibold">${position.entryPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Atual</p>
                  <p className="text-white font-semibold">${position.currentPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Liquidação</p>
                  <p className="text-white font-semibold">${position.liquidationPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className={`mt-3 pt-3 border-t border-[#2B2F36] flex items-center justify-between`}>
                <div className="flex items-center space-x-2">
                  {isProfit ? (
                    <TrendingUp className="text-[#26a69a]" size={18} />
                  ) : (
                    <TrendingDown className="text-[#ef5350]" size={18} />
                  )}
                  <span className={`font-bold ${
                    isProfit ? 'text-[#26a69a]' : 'text-[#ef5350]'
                  }`}>
                    {isProfit ? '+' : ''}${position.pnl.toFixed(2)}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  isProfit ? 'text-[#26a69a]' : 'text-[#ef5350]'
                }`}>
                  {isProfit ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PositionsList;