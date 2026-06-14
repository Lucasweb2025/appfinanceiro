# Spec 01 — Receitas e Despesas Fixas

> App Finanças · Fase 1 (Fundamentos + CRUD) · SDD conforme `dev_learning_path.pdf`

## Contexto

**Problema:** Lucas precisa saber quanto entra e quanto sai de forma fixa todo mês, para projetar os meses seguintes e se organizar.

**Quem usa:** Usuário do App Finanças (inicialmente Lucas; futuro SaaS multi-usuário).

**Restrições:**
- Interface em português (BR)
- Moeda BRL
- Sem login nesta fase (dados em `localStorage`)
- Visual Flutter-like (React + Tailwind)

---

## Escopo desta spec

### Incluído
- CRUD de **receitas fixas** (entrada recorrente por dia do mês)
- CRUD de **despesas fixas** (saída recorrente por dia do mês)
- Ativar / desativar lançamento
- Dashboard do mês: total entradas, total saídas fixas, **sobra**
- Projeção simples: lista de eventos do mês (dia + valor)
- Persistência local (`localStorage`)

### Fora do escopo (próximas specs)
- Cartão de crédito (fechamento/vencimento) → Spec 03
- Dívidas parceladas → Spec 02
- Metas → Spec 04
- Login / JWT → Fase 3
- IA → futuro

---

## Modelo de dados

```json
{
  "id": "uuid",
  "name": "Recebimento dia 5",
  "type": "income | expense",
  "dayOfMonth": 5,
  "defaultAmount": 1750.00,
  "active": true
}
```

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | string | UUID, gerado pelo sistema |
| `name` | string | Obrigatório, 2–60 caracteres |
| `type` | enum | `income` ou `expense` |
| `dayOfMonth` | number | Inteiro 1–31 |
| `defaultAmount` | number | > 0, até 2 casas decimais |
| `active` | boolean | Default `true` |

---

## Regras de negócio

1. **Dia 31 em meses curtos:** usar último dia do mês (ex.: 31 em fev → 28/29).
2. **Valor padrão:** usado em todos os meses projetados nesta fase.
3. **Inativo:** não entra no cálculo, mas permanece salvo (histórico futuro).
4. **Sobra do mês:** `totalEntradas - totalDespesasFixas` (apenas ativos).
5. **Dados iniciais:** se vazio, carregar exemplo do Lucas (dia 5, 20, 30 + aluguel).

---

## Telas

### Início (Dashboard)
- Cards: Entradas do mês | Saídas fixas | Sobra
- Lista cronológica de eventos do mês atual
- Indicador visual: sobra positiva (verde) ou negativa (vermelho)

### Fixos (Lançamentos)
- Abas ou filtro: Receitas | Despesas
- Lista com nome, dia, valor, status (ativo/inativo)
- Botão adicionar
- Ações: editar, excluir, ativar/desativar

### Formulário (modal ou página)
- Nome, tipo, dia do mês, valor
- Validação inline
- Salvar / Cancelar

---

## API interna (Fase 1 — frontend only)

Sem backend ainda. Operações via funções + `localStorage`:

| Operação | Equivalente REST | Ação |
|----------|------------------|------|
| Listar | `GET /recurring` | Ler array do storage |
| Criar | `POST /recurring` | Append + persist |
| Atualizar | `PATCH /recurring/:id` | Merge + persist |
| Excluir | `DELETE /recurring/:id` | Filter + persist |

Futuro (Fase 2+): migrar para API real mantendo mesmo contrato.

---

## Cálculos (Service)

**Entrada:** lista de `RecurringEntry[]`, mês/ano de referência

**Saída:**
```json
{
  "totalIncome": 3748,
  "totalFixedExpenses": 800,
  "netBalance": 2948,
  "events": [
    { "date": "2026-06-05", "name": "Recebimento dia 5", "type": "income", "amount": 1750 }
  ]
}
```

---

## Critérios de aceite

- [ ] Usuário cadastra receita dia 5 R$ 1.750, dia 20 R$ 1.750, dia 30 R$ 248 → dashboard mostra **R$ 3.748** de entradas
- [ ] Usuário cadastra despesa fixa aluguel dia 10 R$ 800 → saídas **R$ 800**, sobra **R$ 2.948**
- [ ] Desativar uma receita remove do total imediatamente
- [ ] Editar valor atualiza dashboard sem recarregar página
- [ ] Dados persistem após fechar o navegador
- [ ] Dia 31 em fevereiro não quebra o sistema
- [ ] Formulário bloqueia nome vazio e valor ≤ 0
- [ ] Testes unitários cobrem cálculo de totais e dia 31 em fev

---

## Testes (Fase 4 — escopo desta spec)

**Unit (obrigatório):**
- Soma de entradas com 3 receitas ativas
- Despesa inativa não entra no total
- `clampDayToMonth(2026, 2, 31) === 28`

**Manual:**
- Cadastrar, recarregar, conferir persistência
- Mobile: layout legível, botões tocáveis

---

## Referência — dados de exemplo (Lucas)

| Nome | Tipo | Dia | Valor |
|------|------|-----|-------|
| Condução | income | 30 | R$ 248 |
| Recebimento dia 5 | income | 5 | R$ 1.750 |
| Recebimento dia 20 | income | 20 | R$ 1.750 |
| Aluguel | expense | 10 | R$ 800 |

---

## Próxima spec

**Spec 02 — Dívidas ativas** (parcela + saldo devedor + projeção de quitação)
