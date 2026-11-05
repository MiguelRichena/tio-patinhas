import { handleMessage } from '../bot.js'

/**
 * Transporte WhatsApp via Baileys (não oficial, escaneia QR Code).
 * Só é carregado quando WHATSAPP=1, para o resto do projeto rodar sem ele.
 */
export async function startWhatsApp({ db }) {
  let makeWASocket
  let useMultiFileAuthState
  let DisconnectReason
  let qrcode

  try {
    ;({ default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('baileys'))
    qrcode = (await import('qrcode-terminal')).default
  } catch {
    console.error('[whatsapp] dependências ausentes. Roda: npm i baileys qrcode-terminal')
    return
  }

  const owner = (process.env.OWNER_PHONE || '').replace(/\D/g, '')
  if (!owner) {
    console.warn('[whatsapp] OWNER_PHONE não definido — qualquer contato poderá usar o bot!')
  }

  const { state, saveCreds } = await useMultiFileAuthState(
    process.env.WHATSAPP_AUTH_DIR || 'data/wa-auth',
  )

  const sock = makeWASocket({ auth: state })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log('[whatsapp] escaneia o QR com o teu telefone:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') console.log('[whatsapp] conectado')

    if (connection === 'close') {
      const status = lastDisconnect?.error?.output?.statusCode
      const loggedOut = status === DisconnectReason.loggedOut
      console.log(`[whatsapp] desconectado (status ${status})`)

      if (loggedOut) {
        console.log('[whatsapp] sessão encerrada. Apaga data/wa-auth e liga de novo.')
      } else {
        setTimeout(() => startWhatsApp({ db }), 3000)
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue

      const jid = msg.key.remoteJid || ''
      if (!jid.endsWith('@s.whatsapp.net')) continue // ignora grupos, canais e status

      const phone = jid.split('@')[0]
      if (owner && phone !== owner) continue

      const text = extractText(msg.message)
      if (!text) continue

      try {
        const reply = handleMessage({ db, phone, text })
        await sock.sendMessage(jid, { text: reply })
      } catch (err) {
        console.error('[whatsapp] erro ao responder:', err)
      }
    }
  })
}

function extractText(message) {
  const content = message.ephemeralMessage?.message ?? message
  return (
    content.conversation ??
    content.extendedTextMessage?.text ??
    content.imageMessage?.caption ??
    null
  )
}
