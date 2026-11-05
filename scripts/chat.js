import 'dotenv/config'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

import { handleMessage } from '../src/bot.js'
import { openDb } from '../src/db.js'

const db = openDb(process.env.DB_PATH || 'data/tio-patinhas.db')
const rl = createInterface({ input: stdin, output: stdout })

console.log('Tio Patinhas — modo console')
console.log('Escreve como se fosse uma mensagem de WhatsApp. "sair" para terminar.\n')

try {
  while (true) {
    const line = await rl.question('> ')
    const text = line.trim()

    if (!text) continue
    if (['sair', 'exit', 'quit'].includes(text.toLowerCase())) break

    console.log(`\n${handleMessage({ db, phone: 'console', text })}\n`)
  }
} finally {
  rl.close()
}
