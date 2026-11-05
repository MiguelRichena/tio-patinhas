import assert from 'node:assert/strict'
import test from 'node:test'

import { guessCategory } from '../src/categories.js'
import { formatBRL, parseAmount } from '../src/money.js'
import { parseMessage } from '../src/parser.js'

test('vários gastos numa mensagem só', () => {
  const { expenses } = parseMessage("120 - Mcdonald's, 60 - Zara, 80 - Cinema")

  assert.equal(expenses.length, 3)
  assert.deepEqual(expenses.map((e) => e.amountCents), [12000, 6000, 8000])
  assert.deepEqual(expenses.map((e) => e.category), ['Alimentação', 'Compras', 'Lazer'])
})

test('decimal com vírgula não quebra a separação por vírgula', () => {
  const { expenses } = parseMessage('32,50 - Uber, 12,90 - Padaria')

  assert.equal(expenses.length, 2)
  assert.equal(expenses[0].amountCents, 3250)
  assert.equal(expenses[1].amountCents, 1290)
})

test('aceita formatos com e sem separador', () => {
  const cases = [
    ['R$ 45 padaria', 4500, 'Alimentação'],
    ['Mercado 210,90', 21090, 'Mercado'],
    ['gastei 15 no café', 1500, 'Alimentação'],
    ['1.234,56 - Aluguel', 123456, 'Moradia'],
  ]

  for (const [message, cents, category] of cases) {
    const { expenses } = parseMessage(message)
    assert.equal(expenses.length, 1, message)
    assert.equal(expenses[0].amountCents, cents, message)
    assert.equal(expenses[0].category, category, message)
  }
})

test('uma linha por gasto', () => {
  const { expenses } = parseMessage('25 - Netflix\n8,50 - Metrô')
  assert.equal(expenses.length, 2)
  assert.deepEqual(expenses.map((e) => e.category), ['Assinaturas', 'Transporte'])
})

test('mensagem sem valor é ignorada', () => {
  const { expenses, ignored } = parseMessage('oi, tudo bem?')
  assert.equal(expenses.length, 0)
  assert.ok(ignored.length >= 1)
})

test('não confunde "bar" com "barbearia"', () => {
  assert.equal(guessCategory('barbearia'), 'Outros')
  assert.equal(guessCategory('bar do zé'), 'Alimentação')
})

test('parseAmount entende milhar e decimal', () => {
  assert.equal(parseAmount('1.234,56'), 123456)
  assert.equal(parseAmount('32,50'), 3250)
  assert.equal(parseAmount('120'), 12000)
  assert.equal(parseAmount('0'), null)
  assert.equal(parseAmount('abc'), null)
})

test('formatBRL imprime em real', () => {
  assert.match(formatBRL(123456), /1\.234,56/)
})
