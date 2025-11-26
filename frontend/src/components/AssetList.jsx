import React from 'react';
import { Card } from './ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const AssetList = ({ assets, onSelectAsset, selectedAsset }) => {
  return (
    <Card className="bg-[#0B0E11] border-[#1A1D23] p-4">
      <h3 className="text-lg font-bold text-white mb-4">Ativos Disponíveis</h3>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {assets.map((asset) => {
          const isPositive = asset.change >= 0;
          const isSelected = selectedAsset === asset.symbol;
          
          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset.symbol)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#2B2F36] border border-[#26a69a]'
                  : 'bg-[#1A1D23] hover:bg-[#2B2F36]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{asset.symbol}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{asset.name}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center justify-end space-x-1 text-sm ${
                    isPositive ? 'text-[#26a69a]' : 'text-[#ef5350]'
                  }`}>
                    {isPositive ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                    <span>{Math.abs(asset.changePercent).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AssetList;