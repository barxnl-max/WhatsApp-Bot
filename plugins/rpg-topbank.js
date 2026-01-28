module.exports = {
  name: "topbank",
  command: ["topbank", "banktop"],
  tags: ["game"],
  limit: false,

  async handler({ sock, m, chatId }) {
    const db = global.db || {}
    const list = []

    for (const jid in db) {
      const user = db[jid]
      if (!user?.bank?.balance) continue

      list.push({
        jid,
        balance: user.bank.balance
      })
    }

    if (!list.length) {
      return m.reply("🏦 Belum ada user yang memiliki saldo bank")
    }

    list.sort((a, b) => b.balance - a.balance)

    const top = list.slice(0, 10)

    let text = "🏆 *TOP BANK GLOBAL*\n\n"
    const mentions = []

    for (let i = 0; i < top.length; i++) {
      const num = top[i].jid.split("@")[0]
      mentions.push(top[i].jid)

      text +=
        `${i + 1}. @${num}\n` +
        `   💰 Saldo: ${top[i].balance.toLocaleString()}\n\n`
    }

    await sock.sendMessage(
      chatId,
      { text: text.trim(), mentions },
      { quoted: m }
    )
  }
}