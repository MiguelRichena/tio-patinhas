import { handleMessage } from '../src/bot.js'
import { openDb } from '../src/db.js'

// Demonstração sem WhatsApp e sem banco em disco: tudo em memória.
const db = openDb(':memory:')
const now = new Date()

const conversation = [
  "120 - McDonald's, 60 - Zara, 80 - Cinema",
  '32,50 - Uber',
  'R$ 45 padaria',
  'resumo',
  'resumo semana',
  'ultimos',
  'desfazer',
  'resumo',
]

for (const text of conversation) {
  console.log(`\n> ${text}`)
  console.log(`${handleMessage({ db, phone: 'demo', text, now })}\n`)
}
