import { CATEGORIES } from './categories.js'
import { formatBRL, formatBRLPlain } from './money.js'
import { formatShort } from './period.js'

export function categoryLabel(name) {
  return `${CATEGORIES[name] ?? CATEGORIES.Outros} ${name}`
}

export function renderHelp() {
  return [
    '*Tio Patinhas* 💸',
    '',
    'Manda os gastos assim:',
    '• `120 - McDonald\'s`',
    '• `32,50 - Uber`',
    '• `R$ 45 padaria`',
    '',
    'Vários de uma vez:',
    '`120 - McDonald\'s, 60 - Zara, 80 - Cinema`',
    '',
    '*Comandos*',
    '• *resumo* — mês atual',
    '• *resumo semana* — últimos 7 dias',
    '• *resumo hoje*',
    '• *ultimos* — últimos lançamentos',
    '• *desfazer* — apaga o último',
    '• *categorias* — o que eu reconheço',
  ].join('\n')
}

export function renderCategories() {
  return [
    '*Categorias que eu reconheço*',
    '',
    ...Object.keys(CATEGORIES).map((name) => `• ${categoryLabel(name)}`),
    '',
    '_Se não reconhecer, cai em 📦 Outros._',
  ].join('\n')
}

export function renderConfirmation(expenses) {
  const total = expenses.reduce((acc, e) => acc + e.amountCents, 0)

  const lines = expenses.map(
    (e) => `• ${formatBRL(e.amountCents)} · ${e.description} → ${categoryLabel(e.category)}`,
  )

  const title =
    expenses.length === 1 ? '✅ *Gasto registrado*' : `✅ *${expenses.length} gastos registrados*`

  return [
    title,
    '',
    ...lines,
    '',
    `*Total: ${formatBRL(total)}*`,
    '_manda *resumo* para ver o mês_',
  ].join('\n')
}

export function renderSummary(summary, range) {
  const period = range.from === range.to
    ? formatShort(range.from)
    : `${formatShort(range.from)} → ${formatShort(range.to)}`

  if (!summary.count) {
    return [
      `📊 *Resumo ${range.title}* · ${period}`,
      '',
      'Nenhum gasto registrado nesse período.',
      '',
      '_Manda algo como `120 - McDonald\'s`_',
    ].join('\n')
  }

  const lines = summary.byCategory.map((row) => {
    const share = Math.round((row.totalCents / summary.totalCents) * 100)
    return `• ${categoryLabel(row.category)} · ${formatBRL(row.totalCents)} · ${share}%`
  })

  return [
    `📊 *Resumo ${range.title}* · ${period}`,
    `${summary.count} lançamento${summary.count === 1 ? '' : 's'} · *${formatBRL(summary.totalCents)}*`,
    '',
    ...lines,
    '',
    `_média por lançamento: ${formatBRL(Math.round(summary.totalCents / summary.count))}_`,
  ].join('\n')
}

export function renderLast(rows) {
  if (!rows.length) {
    return '🧾 Nada registrado ainda.\n\n_Manda `120 - McDonald\'s` para começar._'
  }

  const lines = rows.map(
    (row) =>
      `• ${formatShort(row.occurred_at)} · ${formatBRLPlain(Number(row.amount_cents))} · ${row.description}`,
  )

  return [`🧾 *Últimos ${rows.length} lançamentos*`, '', ...lines].join('\n')
}

export function renderDeleted(row) {
  if (!row) return '🤷 Não há nada para desfazer.'

  return [
    '🗑️ *Removido*',
    '',
    `${formatBRL(row.amountCents)} · ${row.description} (${row.category})`,
  ].join('\n')
}

export function renderNoExpenseFound() {
  return [
    '🤔 Não achei nenhum gasto nessa mensagem.',
    '',
    'O formato é: `valor - descrição`',
    'Ex.: `120 - McDonald\'s` ou `32,50 - Uber`',
    '',
    '_manda *ajuda* para ver os comandos_',
  ].join('\n')
}
