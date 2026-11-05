import { parseAmount } from './money.js'
import { guessCategory } from './categories.js'

const AMOUNT = String.raw`(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)`

const PATTERNS = [
  { re: new RegExp(`^${AMOUNT}\\s*(?:-|–|—|:)\\s*(.+)$`, 'i'), amount: 1, description: 2 },
  { re: new RegExp(`^${AMOUNT}\\s+(?:no|na|em|de|do|da|com|para|pra)\\s+(.+)$`, 'i'), amount: 1, description: 2 },
  { re: new RegExp(`^${AMOUNT}\\s+(.+)$`, 'i'), amount: 1, description: 2 },
  { re: new RegExp(`^(.+?)\\s+(?:-|–|—)?\\s*${AMOUNT}\\s*$`, 'i'), amount: 2, description: 1 },
]

const LEADING_VERBS = /^(gastei|paguei|comprei|anota|anotar|registra|registrar|add|adiciona|adicionar)\s+/i

/**
 * Uma mensagem pode trazer vários gastos:
 *   "120 - McDonald's, 60 - Zara, 80 - Cinema"
 *   "32,50 uber"
 *   "Mercado 45"
 */
export function parseMessage(text) {
  const expenses = []
  const ignored = []

  for (const chunk of splitChunks(text)) {
    const parsed = parseChunk(chunk)
    if (parsed) expenses.push(parsed)
    else ignored.push(chunk)
  }

  return { expenses, ignored }
}

export function splitChunks(text) {
  return String(text)
    .split(/\r?\n|;/)
    .flatMap((part) => part.split(/,(?!\d)/)) // vírgula de milhar/decimal não separa
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseChunk(chunk) {
  let s = chunk
    .trim()
    .replace(/^[-•*]\s*/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(LEADING_VERBS, '')
    .trim()

  if (!s) return null

  for (const { re, amount, description } of PATTERNS) {
    const match = s.match(re)
    if (!match) continue

    const amountCents = parseAmount(match[amount])
    const label = cleanDescription(match[description])

    if (!amountCents || !label) continue

    return {
      amountCents,
      description: capitalize(label),
      category: guessCategory(label),
    }
  }

  return null
}

function cleanDescription(value) {
  return String(value)
    .replace(/^[\s\-–—:]+/, '')
    .replace(/^(no|na|em|de|do|da|com|para|pra)\s+/i, '')
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function capitalize(value) {
  if (!value) return value
  return value[0].toUpperCase() + value.slice(1)
}
