import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS expenses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  phone        TEXT    NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  description  TEXT    NOT NULL,
  category     TEXT    NOT NULL,
  occurred_at  TEXT    NOT NULL,
  created_at   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_phone_date
  ON expenses (phone, occurred_at);
`

export function openDb(path = ':memory:') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })

  const db = new DatabaseSync(path)
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL;')
  db.exec(SCHEMA)
  return db
}

export function addExpense(db, expense) {
  const stmt = db.prepare(`
    INSERT INTO expenses (phone, amount_cents, description, category, occurred_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const info = stmt.run(
    expense.phone,
    expense.amountCents,
    expense.description,
    expense.category,
    expense.occurredAt,
    expense.createdAt,
  )

  return Number(info.lastInsertRowid)
}

export function addExpenses(db, phone, expenses, { occurredAt, createdAt } = {}) {
  const now = new Date()
  const date = occurredAt ?? now.toISOString().slice(0, 10)
  const timestamp = createdAt ?? now.toISOString()

  const ids = []
  for (const expense of expenses) {
    ids.push(addExpense(db, { phone, ...expense, occurredAt: date, createdAt: timestamp }))
  }
  return ids
}

export function listExpenses(db, { phone, from, to, limit = 10 }) {
  return db
    .prepare(`
      SELECT id, amount_cents, description, category, occurred_at
      FROM expenses
      WHERE phone = ? AND occurred_at BETWEEN ? AND ?
      ORDER BY occurred_at DESC, id DESC
      LIMIT ?
    `)
    .all(phone, from, to, limit)
}

export function summarize(db, { phone, from, to }) {
  const rows = db
    .prepare(`
      SELECT category,
             SUM(amount_cents) AS total_cents,
             COUNT(*)          AS count
      FROM expenses
      WHERE phone = ? AND occurred_at BETWEEN ? AND ?
      GROUP BY category
      ORDER BY total_cents DESC
    `)
    .all(phone, from, to)

  const byCategory = rows.map((row) => ({
    category: row.category,
    totalCents: Number(row.total_cents),
    count: Number(row.count),
  }))

  const totalCents = byCategory.reduce((acc, row) => acc + row.totalCents, 0)
  const count = byCategory.reduce((acc, row) => acc + row.count, 0)

  return { totalCents, count, byCategory }
}

export function deleteLast(db, { phone }) {
  const last = db
    .prepare(`
      SELECT id, amount_cents, description, category
      FROM expenses
      WHERE phone = ?
      ORDER BY id DESC
      LIMIT 1
    `)
    .get(phone)

  if (!last) return null

  db.prepare('DELETE FROM expenses WHERE id = ?').run(last.id)
  return {
    amountCents: Number(last.amount_cents),
    description: last.description,
    category: last.category,
  }
}

export function countAll(db, phone) {
  const row = db.prepare('SELECT COUNT(*) AS count FROM expenses WHERE phone = ?').get(phone)
  return Number(row.count)
}
