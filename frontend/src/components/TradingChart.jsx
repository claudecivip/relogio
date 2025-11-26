import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';

const TradingChart = ({ symbol, candleData }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candleSeriesRef = useRef();
  const [interval, setInterval] = useState('1m');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Criar o gráfico
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#0B0E11' },
        textColor: '#D1D4DC',
      },
      grid: {
        vertLines: { color: '#1A1D23' },
        horzLines: { color: '#1A1D23' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2B2F36',
      },
      timeScale: {
        borderColor: '#2B2F36',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Adicionar série de candlesticks
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Adicionar dados
    if (candleData && candleData.length > 0) {
      candleSeries.setData(candleData);
    }

    // Redimensionamento responsivo
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Atualizar dados quando mudarem
  useEffect(() => {
    if (candleSeriesRef.current && candleData && candleData.length > 0) {
      candleSeriesRef.current.setData(candleData);
    }
  }, [candleData]);

  return (
    <Card className="bg-[#0B0E11] border-[#1A1D23] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">{symbol}</h2>
          <div className="flex space-x-2">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((int) => (
              <button
                key={int}
                onClick={() => setInterval(int)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  interval === int
                    ? 'bg-[#26a69a] text-white'
                    : 'bg-[#1A1D23] text-gray-400 hover:bg-[#2B2F36]'
                }`}
              >
                {int}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </Card>
  );
};

export default TradingChart;