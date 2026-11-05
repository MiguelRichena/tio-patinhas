const TZ = process.env.TZ_NAME || 'America/Sao_Paulo'

const isoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Data de hoje no fuso do usuário, no formato YYYY-MM-DD */
export function todayISO(now = new Date()) {
  return isoFormatter.format(now)
}

/** Soma dias a uma data YYYY-MM-DD sem sofrer com fuso */
export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function monthStart(iso) {
  return `${iso.slice(0, 7)}-01`
}

export function yearStart(iso) {
  return `${iso.slice(0, 4)}-01-01`
}

export function formatShort(iso) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

const PERIODS = {
  hoje: { label: 'hoje', title: 'de hoje' },
  semana: { label: 'últimos 7 dias', title: 'dos últimos 7 dias' },
  mes: { label: 'mês atual', title: 'do mês' },
  ano: { label: 'ano atual', title: 'do ano' },
}

export function periodRange(kind = 'mes', now = new Date()) {
  const today = todayISO(now)

  switch (kind) {
    case 'hoje':
      return { from: today, to: today, ...PERIODS.hoje, today }
    case 'semana':
      return { from: addDays(today, -6), to: today, ...PERIODS.semana, today }
    case 'ano':
      return { from: yearStart(today), to: today, ...PERIODS.ano, today }
    case 'mes':
    default:
      return { from: monthStart(today), to: today, ...PERIODS.mes, today }
  }
}
