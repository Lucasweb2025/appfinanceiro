# Spec 05 — Calendário e período até a próxima entrada

## O que faz

- Usuário cadastra **recebimentos** (dia + valor estimado) em Fixos → Receitas
- Início mostra **“Até a próxima entrada”** com quanto pode gastar no período
- **Calendário mensal** com dias de recebimento, saídas e faixa do período
- Cálculo **híbrido**: disponível agora + projeção após cair o próximo recebimento

## Regras

- **Próxima entrada** = próximo recebimento cronológico após hoje
- **Último recebimento** = último dia de entrada ≤ hoje (inclui mês anterior)
- **Período** = hoje → dia da próxima entrada (inclusive)
- **Já entrou** = valor do último recebimento do ciclo
- **Já saiu** = fixos + dívidas + faturas entre último recebimento e hoje
- **Ainda vai sair** = saídas entre hoje e véspera da próxima entrada
- **Variáveis** = estimativa mensal × (dias do período / dias do mês)
- **Disponível** = entrou − já saiu − ainda vai sair − variáveis do período

## Critérios de aceite

- [x] Recebimentos configuráveis (Fixos → Receitas)
- [x] Card “Até a próxima entrada” no Início
- [x] Calendário com recebimentos, saídas e período destacado
- [x] Lista de movimentos até a próxima entrada
- [x] Dia 13/06, receb. dia 20 → período e cálculo coerentes
