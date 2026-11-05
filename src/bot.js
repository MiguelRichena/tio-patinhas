import { normalize } from './categories.js'
import { addExpenses, deleteLast, listExpenses, summarize } from './db.js'
import {
  renderCategories,
  renderConfirmation,
  renderDeleted,
  renderHelp,
  renderLast,
  renderNoExpenseFound,
  renderSummary,
} from './format.js'
import { parseMessage } from './parser.js'
import { periodRange, todayISO } from './period.js'

const HELP = /^(ajuda|help|comandos|\?)$/
const UNDO = /^(desfazer|desfaz|desfaca|apaga|apagar|remove|remover|errei|cancela)$/
const LAST = /^(ultimos|ultimas|extrato|historico|recentes)$/
const CATEGORIES = /^(categorias|categoria|lista)$/
const SUMMARY_EXPLICIT = /^resumo\b/
const SUMMARY_NATURAL =
  /(quanto (eu )?(gastei|gasto|gastamos)|^total\b|balanco|como (estou|esta|ta) (no|nesse|este|esse) mes)/

/**
 * Ponto único de entrada: recebe texto, devolve a resposta.
 * Não sabe nada sobre WhatsApp — isso é papel do transporte.
 */
export function handleMessage({ db, phone = 'local', text, now = new Date() }) {
  const raw = String(text ?? '').trim()
  if (!raw) return renderHelp()

  const command = normalize(raw).replace(/^\/+/, '').trim()

  if (HELP.test(command)) return renderHelp()
  if (CATEGORIES.test(command)) return renderCategories()
  if (UNDO.test(command)) return renderDeleted(deleteLast(db, { phone }))

  if (LAST.test(command)) {
    const range = periodRange('ano', now)
    return renderLast(listExpenses(db, { phone, from: range.from, to: range.to, limit: 10 }))
  }

  if (SUMMARY_EXPLICIT.test(command) || SUMMARY_NATURAL.test(command)) {
    const kind = detectPeriod(command)
    const range = periodRange(kind, now)
    const summary = summarize(db, { phone, from: range.from, to: range.to })
    return renderSummary(summary, range)
  }

  const { expenses } = parseMessage(raw)
  if (expenses.length) {
    addExpenses(db, phone, expenses, { occurredAt: todayISO(now) })
    return renderConfirmation(expenses)
  }

  if (command.startsWith('/')) return renderHelp()

  return renderNoExpenseFound()
}

function detectPeriod(command) {
  if (/\bhoje\b/.test(command)) return 'hoje'
  if (/\b(semana|7 dias|sete dias)\b/.test(command)) return 'semana'
  if (/\bano\b/.test(command)) return 'ano'
  return 'mes'
}
