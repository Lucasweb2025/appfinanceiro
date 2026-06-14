# Spec 02 — Dívidas ativas + Dashboard Fase 2

## Dashboard (wireframe)

```
┌──────────────────────────────┐
│ SOBRA · jun/2026             │
│ R$ X.XXX                     │
│ entradas − fixos − variáveis │
│ − parcelas dívidas           │
├──────────────────────────────┤
│ Entradas │ Saídas totais     │
│ Dívidas  │ Parcelas/mês      │
├──────────────────────────────┤
│ Próximos no mês              │
│ • dia 8 — Empréstimo R$ 300  │
│ • dia 15 — Cartão R$ 400     │
├──────────────────────────────┤
│ Calendário (fixos + parcelas)│
├──────────────────────────────┤
│ Dívidas — quita em X meses   │
└──────────────────────────────┘
```

## Regras

- Parcela descontada na sobra do mês (dia de vencimento)
- Saldo devedor reduz a cada parcela simulada
- Previsão: `ceil(saldo / parcela)` meses
- Inativo não entra no cálculo

## Critérios de aceite

- [ ] CRUD dívidas na aba Dívidas
- [ ] Dashboard mostra parcelas no total de saídas
- [ ] Sobra = entradas − fixos − variáveis − parcelas
- [ ] Alertas dos próximos vencimentos do mês
- [ ] Total em dívidas ativas visível
