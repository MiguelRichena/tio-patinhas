import 'dotenv/config'
import express from 'express'

import { handleMessage } from './src/bot.js'
import { openDb, summarize } from './src/db.js'
import { listExpenses } from './src/db.js'
import { periodRange } from './src/period.js'

const db = openDb(process.env.DB_PATH || 'data/tio-patinhas.db')
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.type('text/plain').send(
    [
      'Tio Patinhas no ar 💸',
      '',
      'POST /mensagens   { "texto": "120 - McDonald\'s", "telefone": "opcional" }',
      'GET  /gastos      ?limite=10',
      'GET  /resumo      ?periodo=mes|semana|hoje|ano',
      'GET  /health',
    ].join('\n'),
  )
})

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() })
})

app.post('/mensagens', (req, res) => {
  const { texto, telefone } = req.body ?? {}

  if (typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({ erro: 'o campo "texto" é obrigatório' })
  }

  const resposta = handleMessage({ db, phone: telefone || 'api', text: texto })
  res.json({ resposta })
})

app.get('/gastos', (req, res) => {
  const phone = req.query.telefone || 'api'
  const range = periodRange('ano')
  const limit = Math.min(Number(req.query.limite) || 10, 100)

  res.json({
    gastos: listExpenses(db, { phone, from: range.from, to: range.to, limit }),
  })
})

app.get('/resumo', (req, res) => {
  const phone = req.query.telefone || 'api'
  const range = periodRange(String(req.query.periodo || 'mes'))
  const summary = summarize(db, { phone, from: range.from, to: range.to })

  res.json({ periodo: { de: range.from, ate: range.to }, ...summary })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`[api] http://localhost:${port}`)
})

if (process.env.WHATSAPP === '1') {
  const { startWhatsApp } = await import('./src/transports/whatsapp.js')
  await startWhatsApp({ db })
}
