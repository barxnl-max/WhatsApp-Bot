const { getUser, addExp, addCredit } = require("../lib/dbuser")

module.exports = {
  name: "tebakbom",
  command: ["tebakbom"],
  tags: ["game"],
  limit: true,

  async handler({ sock, m }) {
    const user = getUser(m.sender)

    const bomb = Math.floor(Math.random() * 9) + 1

    const sent = await sock.sendMessage(
      m.chat,
      {
        text:
          "💣 *TEBAK BOM*\n\n" +
          "Buka 8 kotak aman\n" +
          "Satu kotak berisi bom\n\n" +
          renderBoard([], null) +
          "\n\n⏱ Timeout: 120 detik\n" +
          "🎁 Reward progresif (×2)\n" +
          "🏆 Menang: total ×4\n\n" +
          "➡️ Kirim angka *1–9*"
      },
      { quoted: m }
    )

    const timeoutId = setTimeout(() => {
      const s = global.REPLY_SESSIONS.get(m.sender)
      if (!s) return

      global.REPLY_SESSIONS.delete(m.sender)

      sock.sendMessage(
        m.chat,
        {
          text:
            "⏰ *WAKTU HABIS!*\n\n" +
            "💥 Kamu tidak sempat menyelesaikan game\n" +
            `💣 Bom ada di kotak *${bomb}*`
        },
        { quoted: sent }
      )
    }, 120000)

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "tebakbom",
      msgId: sent.key.id,
      trigger: ["*"],
      free: true,
      expire: Date.now() + 120000,
      timeoutId,
      data: {
        bomb,
        opened: [],
        rewardBase: 100,
        totalExp: 0,
        totalCredit: 0,
        sentId: sent.key.id
      }
    })
  },

  async onReply({ m, session }) {
    const text = m.text?.trim()
    if (!text) return

    const pick = parseInt(text)
    if (isNaN(pick) || pick < 1 || pick > 9) {
      return m.reply("❌ Pilih angka *1–9*")
    }

    const user = getUser(m.sender)
    const {
      bomb,
      opened,
      rewardBase,
      sentId
    } = session.data

    if (opened.includes(pick)) {
      return m.reply("⚠️ Kotak sudah dibuka")
    }

    if (pick === bomb) {
      clearTimeout(session.timeoutId)
      global.REPLY_SESSIONS.delete(m.sender)

      return m.reply(
        "💥 *BOOM!*\n\n" +
        renderBoard(opened, bomb) +
        "\n\n😵 Kamu kena bom"
      )
    }

    opened.push(pick)

    const streak = opened.length
    const gain = rewardBase * Math.pow(2, streak - 1)

    addExp(user, gain)
    addCredit(user, gain)

    session.data.totalExp += gain
    session.data.totalCredit += gain

    if (streak === 8) {
      clearTimeout(session.timeoutId)
      global.REPLY_SESSIONS.delete(m.sender)

      const winExp = session.data.totalExp * 4
      const winCredit = session.data.totalCredit * 4

      addExp(user, winExp)
      addCredit(user, winCredit)

      return m.reply(
        "🏆 *MENANG!*\n\n" +
        renderBoard(opened, null) +
        "\n\n🎉 Semua kotak aman!\n\n" +
        `✨ Total EXP : ${winExp}\n` +
        `💰 Total Credit : ${winCredit}`
      )
    }

    return m.reply(
      "✅ Aman!\n\n" +
      renderBoard(opened, null) +
      `\n\n+${gain} EXP | +${gain} Credit`
    )
  }
}

function renderBoard(opened, bomb) {
  const cell = i => {
    if (bomb === i) return "💥"
    if (opened.includes(i)) return "✅"
    return `${i}️⃣`
  }

  return (
    cell(1) + cell(2) + cell(3) + "\n" +
    cell(4) + cell(5) + cell(6) + "\n" +
    cell(7) + cell(8) + cell(9)
  )
}
