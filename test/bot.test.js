import assert from 'node:assert/strict'
import test from 'node:test'

import { handleMessage } from '../src/bot.js'
import { openDb } from '../src/db.js'

const NOW = new Date('2026-11-05T12:00:00-03:00')

function setup(now = NOW) {
  const db = openDb(':memory:')
  const send = (text, phone = '5511999999999') => handleMessage({ db, phone, text, now })
  return { db, send }
}

test('registra e resume os gastos', () => {
  const { send } = setup()

  const confirmation = send("120 - Mcdonald's, 60 - Zara, 80 - Cinema")
  assert.match(confirmation, /3 gastos registrados/)
  assert.match(confirmation, /R\$\s*260,00/)

  const summary = send('resumo')
  assert.match(summary, /Resumo do mês/)
  assert.match(summary, /R\$\s*260,00/)
  assert.match(summary, /Alimentação/)
  assert.match(summary, /Compras/)
  assert.match(summary, /Lazer/)
})

test('resumo vazio não quebra', () => {
  const { send } = setup()
  assert.match(send('resumo'), /Nenhum gasto registrado/)
})

test('desfazer apaga só o último', () => {
  const { send } = setup()

  send('10 - Café, 20 - Uber')
  const removed = send('desfazer')
  assert.match(removed, /Uber/)

  const summary = send('resumo')
  assert.match(summary, /R\$\s*10,00/)
  assert.doesNotMatch(summary, /R\$\s*30,00/)
})

test('resumo do mês ignora meses anteriores', () => {
  const { db, send } = setup()

  handleMessage({
    db,
    phone: '5511999999999',
    text: '100 - Mercado',
    now: new Date('2026-10-05T12:00:00-03:00'),
  })

  assert.match(send('resumo'), /Nenhum gasto registrado/)

  send('50 - Padaria')
  assert.match(send('resumo'), /R\$\s*50,00/)
})

test('entende pergunta em linguagem natural', () => {
  const { send } = setup()
  send('45 - Posto')

  assert.match(send('quanto gastei esse mês?'), /Resumo do mês/)
  assert.match(send('quanto gastei hoje?'), /Resumo de hoje/)
})

test('texto sem gasto pede o formato correto', () => {
  const { send } = setup()
  assert.match(send('bom dia'), /Não achei nenhum gasto/)
})

test('ajuda lista os comandos', () => {
  const { send } = setup()
  assert.match(send('ajuda'), /Comandos/)
  assert.match(send('/ajuda'), /Comandos/)
})
