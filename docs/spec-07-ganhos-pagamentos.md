# Spec 07 — Ganhos extras e pagamentos registrados

## O que faz

### Ganhos extras
- CRUD: nome, valor, data
- Soma ao ciclo após o último recebimento
- Aumenta "Disponível para gastar"
- Aparece no calendário e no histórico do ciclo

### Pagamentos registrados
- Informar **o quê**, **valor**, **data em que pagou**
- Vincula a dívida, cartão ou despesa fixa
- Detecta **pagamento antecipado** vs vencimento cadastrado
- **Substitui** a saída agendada do mês (não duplica)
- Conta na **data real** do pagamento dentro do ciclo

## Regras de ciclo

- Recebimento dia 5 → ciclo começa dia 5
- Pagamento registrado dia 8 → entra em "Já saiu" se dia 8 > dia 5
- Pagamento antes do recebimento → ciclo anterior (não desconta salário do dia 5)
- Ganho extra dia 12 → soma ao disponível no ciclo 5 → 20

## Critérios de aceite

- [x] + Ganho e + Pagamento no Início
- [x] "Já paguei" em Dívidas e Cartões
- [x] Histórico do ciclo desde último recebimento
- [x] Pagamento antecipado substitui vencimento agendado
- [x] Ganho extra aumenta disponível
