module.exports = {
  name: "demote",
  command: ["demote"],
  usedCmd: ["demote <tag @user>"],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,

  async handler({
    sock,
    m,
    chatId,
    isOwner,
    isAdmin: isSenderAdmin,
    isBotAdmin,
  }) {
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin dulu")
    if (!isOwner && !isSenderAdmin)
      return m.reply("❌ Hanya admin grup yang bisa pakai command ini")

    let users = []

    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid
    const replyUser =
      m.message?.extendedTextMessage?.contextInfo?.participant

    if (mention?.length) users = mention
    else if (replyUser) users = [replyUser]

    if (!users.length)
      return m.reply("❌ Tag atau reply user yang mau didemote")

    const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net"
    if (users.includes(botJid))
      return m.reply("🤖 Aku gak bisa demote diri sendiri")

    try {
      await sock.groupParticipantsUpdate(chatId, users, "demote")

      const teks = users.map(u => `@${u.split("@")[0]}`).join(", ")
      await sock.sendMessage(chatId, {
        text: `✅ ${teks} bukan admin lagi`,
        mentions: users,
      })
    } catch (e) {
      console.error("DEMOTE ERROR:", e)
      m.reply("❌ Gagal demote user")
    }
  },
}