const { getUser } = require("../lib/dbuser")

module.exports = {
  name: "transfer",
  command: ["transfer"],
  tags: ["game"],
  limit: false,

  async handler({ sock, m, chatId, senderId, args }) {
    const sender = getUser(senderId)

    if (!sender.bank?.balance || !sender.bank?.pin) {
      return m.reply("🏦 Kamu belum punya bank atau PIN")
    }

    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mention) {
      return m.reply("❌ Tag user tujuan\n\nContoh:\n.transfer @user 5000")
    }

    const amount = parseInt(args[1])
    if (!amount || amount <= 0) {
      return m.reply("❌ Jumlah transfer tidak valid")
    }

    if (sender.bank.balance < amount) {
      return m.reply("❌ Saldo bank kamu tidak cukup")
    }

    const target = getUser(mention)

    if (!target.bank) {
      return m.reply("❌ Target belum punya bank")
    }

    const text =
      `💸 *KONFIRMASI TRANSFER*\n\n` +
      `👤 Ke : @${mention.split("@")[0]}\n` +
      `💰 Jumlah : ${amount.toLocaleString()}\n\n` +
      `🔐 *Reply pesan ini dengan PIN bank kamu*`

    const sent = await sock.sendMessage(
      chatId,
      { text, mentions: [mention] },
      { quoted: m }
    )

    global.REPLY_SESSIONS.set(senderId, {
      plugin: "transfer",
      msgId: sent.key.id,
      expire: Date.now() + 60_000,
      data: {
        to: mention,
        amount
      }
    })
  },

  async onReply({ sock, m, session }) {
    const { getUser } = require("../lib/dbuser")
    const sender = getUser(m.sender)

    if (!sender.bank?.pin) return

    const pin = m.text?.trim()
    if (!pin) return

    if (pin !== sender.bank.pin) {
      return m.reply("❌ PIN salah")
    }

    const { to, amount } = session.data
    const target = getUser(to)

    if (sender.bank.balance < amount) {
      return m.reply("❌ Saldo tidak cukup")
    }

    sender.bank.balance -= amount
    target.bank.balance += amount

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *TRANSFER BERHASIL*\n\n` +
          `👤 Ke : @${to.split("@")[0]}\n` +
          `💰 Jumlah : ${amount.toLocaleString()}\n\n` +
          `🏦 Saldo kamu sekarang: ${sender.bank.balance.toLocaleString()}`,
        mentions: [to]
      },
      { quoted: m }
    )

    global.REPLY_SESSIONS.delete(m.sender)
  }
}