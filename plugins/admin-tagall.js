module.exports = {
  name: "tagall",
  command: ["tagall", "mentionall"],
  usedCmd: ["tagall", "mentionall"],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,
  limit: false,

  async handler({ sock, m, chatId }) {
    const groupMetadata = await sock.groupMetadata(chatId)
    const participants = groupMetadata.participants || []

    if (!participants.length) {
      return m.reply("❌ Tidak ada member di grup")
    }

    let text = "📢 *TAG ALL MEMBER*\n\n"
    const mentions = []

    for (const p of participants) {
      const id = p.id
      mentions.push(id)
      text += `@${id.split("@")[0]}\n`
    }

    await sock.sendMessage(chatId, {
      text,
      mentions
    }, { quoted: m })
  }
}
