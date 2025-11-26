# Contratos da API - Plataforma de Trading Automatizada

## Visão Geral
Sistema de trading automatizado que integra Binance API e IA para análise e execução de trades 24/7.

## Dados Mockados (Frontend Atual)
- `/app/frontend/src/mock/tradingData.js` - Todos os dados mockados
  - mockAssets: Lista de criptomoedas
  - generateMockCandleData: Dados de candlestick
  - mockPositions: Posições abertas
  - mockTradeHistory: Histórico de trades
  - mockAccountBalance: Saldo da conta

## API Endpoints (Backend)

### 1. Conta e Saldo
**GET /api/account/balance**
- Retorna saldo real da Binance
- Substitui: mockAccountBalance

**GET /api/account/positions**
- Retorna posições abertas reais
- Substitui: mockPositions

### 2. Mercado e Dados
**GET /api/market/assets**
- Retorna lista de ativos disponíveis da Binance
- Substitui: mockAssets

**GET /api/market/candles/:symbol**
- Parâmetros: symbol, interval (1m, 5m, 15m, 1h, 4h, 1d)
- Retorna dados históricos de candlestick
- Substitui: generateMockCandleData

**GET /api/market/price/:symbol**
- Retorna preço atual de um ativo

### 3. Trading Automático
**POST /api/trading/start**
- Body: { investAmount: number, targetAmount: number }
- Inicia o bot de trading automático
- IA analisa mercado e executa trades

**POST /api/trading/stop**
- Para o bot de trading automático

**GET /api/trading/status**
- Retorna status do bot (running/stopped)

### 4. Trades e Histórico
**GET /api/trades/history**
- Retorna histórico de trades realizados
- Substitui: mockTradeHistory

**POST /api/trades/manual**
- Body: { symbol, side, amount, type }
- Executa trade manual (opcional)

### 5. Posições
**POST /api/positions/close/:id**
- Fecha uma posição específica

**GET /api/positions/active**
- Retorna todas as posições ativas

### 6. WebSocket (Tempo Real)
**WS /ws/market**
- Envia atualizações de preços em tempo real
- Envia novos candlesticks
- Substitui a simulação do frontend

**WS /ws/trading**
- Envia atualizações de posições
- Envia novos trades executados
- Envia status do bot

## Integração Backend

### Serviços

1. **BinanceService** (`services/binance_service.py`)
   - Conecta com Binance API
   - Obtém dados de mercado
   - Executa ordens (market, limit, stop-loss)
   - Gerencia posições

2. **AITradingService** (`services/ai_trading_service.py`)
   - Usa Emergent LLM (GPT-4o-mini) para análise
   - Analisa indicadores técnicos
   - Toma decisões de compra/venda
   - Gerencia risco e stop-loss

3. **TradingBot** (`services/trading_bot.py`)
   - Executa continuamente (24/7)
   - Monitora mercado em tempo real
   - Executa estratégias da IA
   - Gerencia meta de lucro

### Models MongoDB

1. **TradingSession**
   - investAmount
   - targetAmount
   - currentPnL
   - status (active/stopped/completed)
   - startTime
   - endTime

2. **Trade**
   - symbol
   - side (BUY/SELL)
   - amount
   - price
   - total
   - timestamp
   - status (FILLED/PARTIAL/CANCELLED)

3. **Position**
   - symbol
   - type (LONG/SHORT)
   - amount
   - entryPrice
   - currentPrice
   - pnl
   - leverage
   - stopLoss
   - liquidationPrice

## Integração Frontend → Backend

### Substituições no Frontend:

1. **App.js** - Remover mock data e usar APIs:
   ```javascript
   // Antes (mock):
   import { mockAssets } from './mock/tradingData';
   
   // Depois (real):
   const { data: assets } = await axios.get(`${API}/market/assets`);
   ```

2. **TradingChart.jsx** - WebSocket para candlesticks:
   ```javascript
   // Conectar ao WebSocket
   const ws = new WebSocket('ws://backend/ws/market');
   ws.onmessage = (event) => {
     const newCandle = JSON.parse(event.data);
     updateChart(newCandle);
   };
   ```

3. **ControlPanel.jsx** - Iniciar/parar bot:
   ```javascript
   const handleStart = async (config) => {
     await axios.post(`${API}/trading/start`, config);
   };
   ```

4. **PositionsList.jsx** - Dados reais de posições:
   ```javascript
   const { data: positions } = await axios.get(`${API}/positions/active`);
   ```

5. **TradeHistory.jsx** - Histórico real:
   ```javascript
   const { data: trades } = await axios.get(`${API}/trades/history`);
   ```

6. **AccountBalance.jsx** - Saldo real:
   ```javascript
   const { data: balance } = await axios.get(`${API/account/balance`);
   ```

## Segurança

- API Keys da Binance armazenadas em .env
- EMERGENT_LLM_KEY em .env
- Todas as rotas de trading protegidas
- Rate limiting implementado
- Validação de entrada em todas as rotas

## Fluxo do Trading Bot

1. Usuário inicia bot com valor e meta
2. Bot conecta na Binance
3. IA analisa mercado constantemente
4. IA escolhe ativos e estratégias
5. Bot executa trades automaticamente
6. Stop-loss automático protege posições
7. WebSocket atualiza frontend em tempo real
8. Bot para quando atinge meta ou quando solicitado

## Conversão de Moeda

- Binance trabalha em USDT
- Frontend mostra em R$ (BRL)
- Usar taxa de câmbio atual: 1 USDT ≈ R$ 5.00 (aproximado)
- Atualizar taxa periodicamente
