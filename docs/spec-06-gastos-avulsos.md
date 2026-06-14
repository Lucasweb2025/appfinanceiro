# Spec 06 — Gastos avulsos (lançamentos reais)

## O que faz

- Registrar gasto com **nome, valor, data** (hoje, passado ou futuro)
- Categoria opcional (vincula a estimativa variável)
- Desconta do **“Disponível para gastar”** no Início
- Aparece no **calendário** e na lista do período
- Estimativas mensais + barra **previsto vs gasto** na aba Variáveis

## Regras

- Data futura = gasto **planejado** (já compromete o orçamento)
- Gastos ativos entre último recebimento e próxima entrada reduzem o disponível
- Estimativa mensal continua separada (proporcional no período)
- Gastos lançados somam-se ao desconto (não substituem a estimativa)

## Critérios de aceite

- [x] + Registrar gasto no Início e em Variáveis
- [x] CRUD completo (editar, excluir, ativar/inativo)
- [x] Café R$ 21 amanhã reduz disponível hoje
- [x] Calendário mostra gasto lançado
- [x] Categoria opcional com progresso no mês
