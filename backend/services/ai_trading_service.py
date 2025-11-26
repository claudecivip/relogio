from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class AITradingService:
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        
        self.chat = LlmChat(
            api_key=self.api_key,
            session_id="ai_trading_session",
            system_message="""
Você é um analista profissional de trading de criptomoedas com mais de 15 anos de experiência.
Sua especialidade é análise técnica e execução de trades automatizados.

Regras importantes:
1. Sempre analise os dados do mercado cuidadosamente
2. Considere volume, tendência e volatilidade
3. Gerencie risco de forma conservadora
4. Nunca invista mais de 5% do capital em um único trade
5. Sempre defina stop-loss para proteger o capital
6. Priorize preservação de capital sobre lucros altos
7. Responda SEMPRE em formato JSON válido

Formato de resposta esperado:
{
  "action": "BUY" ou "SELL" ou "HOLD",
  "symbol": "BTCUSDT",
  "confidence": 0.85,
  "amount_percent": 3.5,
  "reason": "Explicação da decisão",
  "stop_loss_percent": 2.0,
  "take_profit_percent": 5.0
}
"""
        ).with_model("openai", "gpt-4o-mini")
        
        logger.info("AI Trading Service initialized with GPT-4o-mini")
    
    async def analyze_market(self, market_data: List[Dict], current_balance: float, target: float) -> Dict:
        """Analisa o mercado e retorna decisão de trading"""
        try:
            # Preparar dados para análise
            prompt = f"""
Analise os dados do mercado e tome uma decisão de trading:

Saldo atual: ${current_balance:.2f} USDT
Meta de lucro: ${target:.2f} USDT
Lucro necessário: ${target - current_balance:.2f} USDT ({((target - current_balance) / current_balance * 100):.2f}%)

Dados do mercado (top ativos por volume):
{json.dumps(market_data[:5], indent=2)}

Baseado nesses dados:
1. Qual é a melhor oportunidade de trading agora?
2. Devo comprar, vender ou aguardar?
3. Qual percentual do capital devo usar?
4. Onde colocar stop-loss e take-profit?

Responda em formato JSON conforme especificado no system message.
"""
            
            message = UserMessage(text=prompt)
            response = await self.chat.send_message(message)
            
            # Parse resposta
            try:
                # Tentar extrair JSON da resposta
                response_text = response.strip()
                
                # Procurar por JSON na resposta
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    decision = json.loads(json_str)
                else:
                    decision = json.loads(response_text)
                
                # Validar campos obrigatórios
                required_fields = ['action', 'symbol', 'confidence']
                for field in required_fields:
                    if field not in decision:
                        raise ValueError(f"Missing required field: {field}")
                
                logger.info(f"AI Decision: {decision['action']} {decision.get('symbol', 'N/A')} (confidence: {decision.get('confidence', 0)})")
                return decision
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                logger.error(f"Raw response: {response}")
                # Retornar decisão conservadora
                return {
                    'action': 'HOLD',
                    'symbol': 'BTCUSDT',
                    'confidence': 0.0,
                    'reason': 'Failed to parse AI response'
                }
        
        except Exception as e:
            logger.error(f"Error in AI analysis: {e}")
            # Retornar decisão conservadora em caso de erro
            return {
                'action': 'HOLD',
                'symbol': 'BTCUSDT',
                'confidence': 0.0,
                'reason': f'Error: {str(e)}'
            }
    
    async def evaluate_position(self, position: Dict, current_price: float) -> Dict:
        """Avalia uma posição aberta e decide se deve fechar"""
        try:
            pnl_percent = ((current_price - position['entry_price']) / position['entry_price']) * 100
            
            if position['type'] == 'SHORT':
                pnl_percent = -pnl_percent
            
            prompt = f"""
Avalie esta posição aberta:

Símbolo: {position['symbol']}
Tipo: {position['type']}
Preço de entrada: ${position['entry_price']:.2f}
Preço atual: ${current_price:.2f}
P&L: {pnl_percent:.2f}%
Tempo aberto: {position.get('time_open', 'N/A')}

Devo:
1. Manter a posição aberta?
2. Fechar para realizar lucro?
3. Fechar para evitar mais perdas?

Responda em formato JSON:
{{
  "action": "HOLD" ou "CLOSE",
  "reason": "Explicação",
  "confidence": 0.85
}}
"""
            
            message = UserMessage(text=prompt)
            response = await self.chat.send_message(message)
            
            # Parse resposta
            try:
                start_idx = response.find('{')
                end_idx = response.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response[start_idx:end_idx]
                    decision = json.loads(json_str)
                else:
                    decision = json.loads(response)
                
                return decision
            
            except json.JSONDecodeError:
                # Decisão conservadora: fechar se perda > 3% ou lucro > 5%
                if pnl_percent < -3 or pnl_percent > 5:
                    return {
                        'action': 'CLOSE',
                        'reason': f'Auto-close: P&L at {pnl_percent:.2f}%',
                        'confidence': 0.9
                    }
                return {
                    'action': 'HOLD',
                    'reason': 'Maintaining position',
                    'confidence': 0.7
                }
        
        except Exception as e:
            logger.error(f"Error evaluating position: {e}")
            return {
                'action': 'HOLD',
                'reason': f'Error: {str(e)}',
                'confidence': 0.0
            }