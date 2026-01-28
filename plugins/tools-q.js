module.exports = {
  name: "quoted",
  command: ["q", "quoted"],
  usedCmd: "quoted <reply>",
  tags: ["tools"],
  limit: true,

  async handler({ sock, m, chatId }) {
    if (!m.quoted) {
      return sock.sendMessage(
        chatId,
        { text: "Reply pesan yang ingin diambil" },
        { quoted: m }
      )
    }

    const getContext = msg =>
      msg?.extendedTextMessage?.contextInfo ||
      msg?.imageMessage?.contextInfo ||
      msg?.videoMessage?.contextInfo ||
      msg?.documentMessage?.contextInfo ||
      msg?.audioMessage?.contextInfo ||
      msg?.stickerMessage?.contextInfo ||
      msg?.viewOnceMessageV2?.message?.imageMessage?.contextInfo ||
      msg?.viewOnceMessageV2?.message?.videoMessage?.contextInfo ||
      null

    const ctx1 = getContext(m.message)
    if (!ctx1?.stanzaId) {
      return sock.sendMessage(
        chatId,
        { text: "Pesan ini tidak membalas pesan lain" },
        { quoted: m }
      )
    }

    const jid1 = ctx1.remoteJid || chatId
    const first = await global.store.loadMessage(jid1, ctx1.stanzaId)

    if (!first?.message) {
      return sock.sendMessage(
        chatId,
        { text: "Pesan tidak ditemukan di store" },
        { quoted: m }
      )
    }

    const ctx2 = getContext(first.message)
    const target = ctx2?.stanzaId
      ? await global.store.loadMessage(ctx2.remoteJid || jid1, ctx2.stanzaId)
      : first

    if (!target?.message) {
      return sock.sendMessage(
        chatId,
        { text: "Pesan asli tidak ditemukan" },
        { quoted: m }
      )
    }

    await sock.copyNForward(
      chatId,
      {
        key: target.key,
        message: target.message
      },
      true
    )
  }
}