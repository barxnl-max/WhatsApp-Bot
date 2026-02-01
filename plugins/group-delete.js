module.exports = {
  name: "delete",
  command: ["delete", "del"],
  group: true,
  botAdmin: true,
  limit: true,

  async handler({ sock, m, chatId, isBotAdmin }) {
    if (!m.quoted) {
      return m.reply("❌ Reply pesan yang mau dihapus")
    }

    const q = m.quoted
    const key = q.key

    if (!key.participant) {
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          id: key.id
        }
      })
      return
    }

    await sock.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        id: key.id,
        participant: key.participant
      }
    })
  }
}
