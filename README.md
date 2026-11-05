# 💸 tio-patinhas

Agente financeiro pessoal no WhatsApp: você manda o gasto como mensagem, ele **categoriza**, guarda em **SQLite** e devolve **resumos**.

Tudo roda local — sem nuvem, sem chave de API, sem planilha.

```
> 120 - McDonald's, 60 - Zara, 80 - Cinema

✅ *3 gastos registrados*

• R$ 120,00 · McDonald's → 🍔 Alimentação
• R$ 60,00 · Zara → 🛍️ Compras
• R$ 80,00 · Cinema → 🎬 Lazer

*Total: R$ 260,00*

> resumo

📊 *Resumo do mês* · 01/11 → 05/11
3 lançamentos · *R$ 260,00*

• 🍔 Alimentação · R$ 120,00 · 46%
• 🎬 Lazer · R$ 80,00 · 31%
• 🛍️ Compras · R$ 60,00 · 23%
```

## Como rodar

Requisitos: **Node 22.5+** (usa o `node:sqlite` nativo, sem dependência nativa para compilar).

```bash
npm install
cp .env.example .env
```

### Modo console (não precisa de WhatsApp)

```bash
npm run chat
```

Escreve como se fosse uma mensagem. É o jeito mais rápido de testar o parser.

### Modo API

```bash
npm start
```

```bash
curl -X POST http://localhost:3000/mensagens \
  -H "Content-Type: application/json" \
  -d '{ "texto": "120 - McDonald'"'"'s, 60 - Zara" }'
```

| Rota | O que faz |
|---|---|
| `POST /mensagens` | recebe `{ texto, telefone? }` e devolve `{ resposta }` |
| `GET /resumo?periodo=mes` | resumo em JSON (`hoje`, `semana`, `mes`, `ano`) |
| `GET /gastos?limite=10` | últimos lançamentos |
| `GET /health` | status |

### Modo WhatsApp

```bash
npm i baileys qrcode-terminal   # já vêm como optionalDependencies
# no .env: WHATSAPP=1 e OWNER_PHONE=5511999999999
npm start
```

Aparece um QR Code no terminal — escaneia com o WhatsApp em **Dispositivos conectados**. A sessão fica em `data/wa-auth/`, então só precisa escanear uma vez.

> ⚠️ Baileys é uma biblioteca **não oficial**. O uso pode violar os termos do WhatsApp e existe risco de bloqueio do número. Use um número secundário, e nunca remova o `OWNER_PHONE`: sem ele, qualquer pessoa que mandar mensagem consegue ler os teus gastos.

## Comandos

| Mensagem | Resposta |
|---|---|
| `120 - McDonald's` | registra o gasto |
| `120 - McDonald's, 60 - Zara` | registra vários |
| `32,50 - Uber` / `R$ 45 padaria` | outros formatos aceitos |
| `resumo` | mês atual, por categoria |
| `resumo semana` / `resumo hoje` | últimos 7 dias / hoje |
| `quanto gastei esse mês?` | mesmo que `resumo` |
| `ultimos` | últimos 10 lançamentos |
| `desfazer` | apaga o último |
| `categorias` | lista o que ele reconhece |
| `ajuda` | menu |

## Como o parser funciona

A mensagem é quebrada em linhas, `;` e vírgulas — **vírgula entre dígitos não separa**, para `32,50` continuar sendo um valor.

```
120 - McDonald's, 60 - Zara, 80 - Cinema
└── chunk 1 ────┘ └─ chunk 2 ┘ └─ chunk 3 ┘
```

Cada chunk passa por quatro padrões, do mais específico ao mais tolerante:

| Formato | Exemplo |
|---|---|
| `valor - descrição` | `120 - McDonald's` |
| `valor [preposição] descrição` | `45 no mercado` |
| `valor descrição` | `32,50 Uber` |
| `descrição valor` | `Cinema 80` |

Valores aceitam `120`, `32,50`, `1.234,56` e `R$ 45`. Verbos no início (`gastei`, `paguei`, `comprei`) são ignorados. A categoria vem de palavras-chave, com prioridade — por isso `netflix` cai em **Assinaturas** e não em Lazer, e `bar` não casa com `barbearia`.

## Arquitetura

```
WhatsApp (Baileys) ─┐
Console (readline) ─┼─→ handleMessage() ─→ parser ─→ categories
HTTP (Express) ─────┘         │
                              └─→ SQLite (node:sqlite) ─→ resumo formatado
```

O núcleo (`handleMessage`) não sabe de onde a mensagem veio. O transporte é só um adaptador — é o que permite testar tudo sem abrir o WhatsApp.

```
src/
├── bot.js               # roteia comandos e gastos
├── parser.js            # texto livre -> [{ valor, descrição, categoria }]
├── categories.js        # regras de categorização
├── money.js             # parsing/formatação de BRL em centavos
├── period.js            # hoje / últimos 7 dias / mês / ano
├── db.js                # SQLite (schema, insert, agregações)
├── format.js            # respostas em texto de WhatsApp
└── transports/
    └── whatsapp.js      # Baileys (opcional)
```

## Decisões

- **SQLite em vez de nuvem.** O dado é financeiro e pessoal; o projeto é local por definição. `node:sqlite` evita dependência nativa e mantém o `npm install` curto.
- **Parser determinístico em vez de LLM.** O formato é simples, e regra explícita é testável, instantânea e gratuita. Um LLM entraria bem como *fallback* para frases longas.
- **Centavos em inteiro.** Nada de `float` para dinheiro.
- **Transporte plugável.** O mesmo núcleo atende console, HTTP e WhatsApp.
- **Allowlist por número.** Um bot financeiro aberto é um vazamento esperando acontecer.

## Testes

```bash
npm test
```

15 testes cobrindo parser (formatos, decimais, ambiguidades), categorização, resumo por período, `desfazer` e comandos.

## Limitações

- Sem edição de lançamento (só `desfazer` do último).
- Sem parcelamento, recorrentes ou orçamento.
- Datas relativas ("ontem") não são interpretadas — tudo entra como hoje.
- Categorização é por palavra-chave: nome de loja desconhecido cai em **Outros**.
- Sem exportação (CSV viria fácil).

## Licença

MIT
