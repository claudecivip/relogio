import React from 'react';
import { Card } from './ui/card';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TradeHistory = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <Card className="bg-[#0B0E11] border-[#1A1D23] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Histórico de Trades</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">Nenhum trade realizado ainda</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0B0E11] border-[#1A1D23] p-6">
      <h3 className="text-lg font-bold text-white mb-4">Histórico de Trades</h3>
      
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {trades.map((trade) => {
          const isBuy = trade.type === 'BUY';
          
          return (
            <div
              key={trade.id}
              className="bg-[#1A1D23] rounded-lg p-4 border border-[#2B2F36] hover:border-[#3B3F46] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isBuy ? 'bg-[#26a69a]/20' : 'bg-[#ef5350]/20'
                  }`}>
                    {isBuy ? (
                      <ArrowUpRight className="text-[#26a69a]" size={16} />
                    ) : (
                      <ArrowDownRight className="text-[#ef5350]" size={16} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{trade.symbol}</span>
                      <span className={`text-xs font-semibold ${
                        isBuy ? 'text-[#26a69a]' : 'text-[#ef5350]'
                      }`}>
                        {trade.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>
                        {format(new Date(trade.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="px-2 py-1 bg-[#26a69a]/20 text-[#26a69a] rounded text-xs font-semibold">
                  {trade.status}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#2B2F36] text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Quantidade</p>
                  <p className="text-white font-semibold">{trade.amount}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Preço</p>
                  <p className="text-white font-semibold">${trade.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Total</p>
                  <p className="text-white font-semibold">${trade.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TradeHistory;