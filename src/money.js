const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Centavos -> "R$ 1.234,56" */
export function formatBRL(cents) {
  return BRL.format((cents ?? 0) / 100)
}

/**
 * Aceita "120", "32,50", "1.234,56", "R$ 45", "32.50".
 * Devolve centavos (inteiro) ou null se não for um valor válido.
 */
export function parseAmount(raw) {
  if (raw == null) return null

  let s = String(raw)
    .trim()
    .replace(/r\$/i, '')
    .replace(/\s/g, '')

  if (!s) return null

  const hasComma = s.includes(',')
  const hasDot = s.includes('.')

  if (hasComma && hasDot) {
    // 1.234,56 -> 1234.56
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    const [int, dec = ''] = s.split(',')
    // 32,50 -> 32.50 | 1,200 -> 1200 (milhar)
    s = dec.length <= 2 ? `${int}.${dec}` : `${int}${dec}`
  } else if (hasDot) {
    const parts = s.split('.')
    if (parts.length > 2) {
      s = parts.join('') // 1.234.567
    } else if (parts[1].length === 3) {
      s = parts.join('') // 1.234 (milhar)
    }
    // 32.50 fica como decimal
  }

  const n = Number(s)
  if (!Number.isFinite(n) || n <= 0) return null

  return Math.round(n * 100)
}

/** "1.234,56" para relatórios em texto puro */
export function formatBRLPlain(cents) {
  return formatBRL(cents).replace(/\u00a0/g, ' ')
}
