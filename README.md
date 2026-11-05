# 💸 tio-patinhas

Agente financeiro pessoal no WhatsApp: você manda uma mensagem e ele registra, categoriza e devolve o resumo dos seus gastos.

Projeto pessoal em desenvolvimento — nasceu da preguiça de abrir planilha para anotar cada compra.

## Como funciona

```
WhatsApp  →  webhook Express  →  parser da mensagem  →  Supabase (Postgres)
                                                             │
                          resposta no chat  ←  resumo/consulta
```

## Stack

- **Node.js + Express** — recebe os eventos do WhatsApp e responde
- **Supabase (Postgres)** — persistência das transações e categorias
- **dotenv** — configuração local

## Rodando localmente

```bash
git clone https://github.com/MiguelRichena/tio-patinhas.git
cd tio-patinhas
npm install
cp .env.example .env   # preencha SUPABASE_URL e SUPABASE_KEY
npm run dev
```

Exponha a porta local com `ngrok http 3000` e use essa URL no webhook do provedor de WhatsApp.

## Estrutura

```
index.js       # bootstrap do servidor Express
routes/        # endpoints do webhook
db/            # acesso ao Supabase
```

## Próximos passos

- [ ] Parser de linguagem natural para "mercado 32,50 ontem"
- [ ] Categorização automática dos gastos
- [ ] Resumo semanal e metas por categoria
- [ ] Testes dos endpoints do webhook

## Licença

MIT
