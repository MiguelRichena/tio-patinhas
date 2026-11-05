export const CATEGORIES = {
  Alimentação: '🍔',
  Mercado: '🛒',
  Transporte: '🚗',
  Moradia: '🏠',
  Contas: '🧾',
  Lazer: '🎬',
  Saúde: '💊',
  Educação: '📚',
  Compras: '🛍️',
  Assinaturas: '📺',
  Outros: '📦',
}

/**
 * A ordem importa: a primeira regra que casar vence.
 * "netflix" precisa cair em Assinaturas antes de Lazer.
 */
const RULES = [
  ['Assinaturas', ['netflix', 'spotify', 'disney', 'prime video', 'amazon prime', 'hbo', 'max', 'icloud', 'chatgpt', 'github', 'youtube premium', 'deezer', 'globoplay']],
  ['Assinaturas', ['assinatura', 'mensalidade do app']],
  ['Mercado', ['mercado', 'supermercado', 'assai', 'carrefour', 'pao de acucar', 'atacadao', 'hortifruti', 'acougue', 'feira', 'sacolao']],
  ['Alimentação', ['mcdonalds', 'mc donalds', 'mcdonald', 'burger king', 'bk', 'habibs', 'subway', 'ifood', 'rappi', 'restaurante', 'lanchonete', 'pizza', 'sushi', 'padaria', 'cafe', 'cafeteria', 'starbucks', 'outback', 'cerveja', 'bar', 'almoco', 'jantar', 'sorvete', 'doce', 'pastel']],
  ['Transporte', ['uber', '99', 'taxi', 'gasolina', 'combustivel', 'posto', 'metro', 'onibus', 'estacionamento', 'pedagio', 'passagem', 'bilhete']],
  ['Moradia', ['aluguel', 'condominio', 'iptu', 'movel', 'reforma', 'faxina', 'diarista']],
  ['Contas', ['luz', 'energia', 'agua', 'internet', 'telefone', 'celular', 'gas', 'boleto', 'conta de']],
  ['Saúde', ['farmacia', 'drogaria', 'medico', 'consulta', 'academia', 'dentista', 'exame', 'terapia', 'plano de saude', 'remedio']],
  ['Educação', ['curso', 'faculdade', 'livro', 'udemy', 'escola', 'alura', 'apostila']],
  ['Compras', ['zara', 'renner', 'riachuelo', 'shein', 'amazon', 'mercado livre', 'roupa', 'tenis', 'shopping', 'loja', 'centauro', 'c&a']],
  ['Lazer', ['cinema', 'show', 'teatro', 'jogo', 'viagem', 'praia', 'parque', 'ingresso', 'museu', 'balada']],
]

export function normalize(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasTerm(description, term) {
  // termos só com letras/números usam fronteira de palavra ("bar" não casa "barbearia")
  if (/^[\w\s]+$/.test(term)) {
    return new RegExp(`\\b${escapeRegex(term)}\\b`).test(description)
  }
  return description.includes(term)
}

export function guessCategory(description) {
  const text = normalize(description)
  if (!text) return 'Outros'

  for (const [category, terms] of RULES) {
    if (terms.some((term) => hasTerm(text, term))) return category
  }
  return 'Outros'
}
