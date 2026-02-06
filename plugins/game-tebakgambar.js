const tebakgambar = require("../lib/scrape/tebakgambar")
const similarity = require("string-similarity")
const { addExp, addCredit, getUser } = require("../lib/dbuser")

module.exports = {
  name: "tebakgambar",
  command: ["tebakgambar"],
  tags: ["game"],

  async handler({ sock, m }) {
    const soal = await tebakgambar()
    const data = soal.data[Math.floor(Math.random() * soal.data.length)]

    const answer = data.jawaban.toLowerCase()

    const sent = await sock.sendMessage(
      m.chat,
      {
        image: { url: data.image },
        caption:
          "🧠 *TEBAK GAMBAR*\n\n" +
          data.penjelasan + "\n\n" +
          "⏱ Timeout: 120 detik\n" +
          "🎁 Bonus: 500 XP\n" +
          "💰 Credit: 500\n\n" +
          "💡 ketik *hint* (−50 credit)\nReply pesan ini untuk jawaban!"
      },
      { quoted: m }
    )

    const timeoutId = setTimeout(() => {
      const session = global.REPLY_SESSIONS.get(m.sender)
      if (!session) return

      global.REPLY_SESSIONS.delete(m.sender)

      sock.sendMessage(
        m.chat,
        {
          text:
            "⏰ *WAKTU HABIS!*\n\n" +
            "❌ Jawabannya adalah:\n" +
            `✅ *${answer.toUpperCase()}*`
        },
        { quoted: sent }
      )
    }, 120000)

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "tebakgambar",
      msgId: sent.key.id,
      trigger: ["*"],
      expire: Date.now() + 120000,
      timeoutId,
      data: {
        answer,
        hintStep: 1,
        lastMsg: sent
      }
    })
  },

  async onReply({ m, session }) {
    const text = m.text?.toLowerCase().trim()
    if (!text) return

    const user = getUser(m.sender)
    const { answer, lastMsg } = session.data

    if (text === "hint") {
      if (user.credit < 50) {
        return m.reply("❌ Credit kamu kurang (butuh 50)")
      }

      user.credit -= 50
      const hint = buildHint(answer, session.data.hintStep)
      session.data.hintStep++

      return m.reply(
        "💡 *HINT*\n" +
        hint +
        "\n\n💰 −50 Credit"
      )
    }

    const sim = similarity.compareTwoStrings(text, answer)

    if (sim >= 0.85) {
      clearTimeout(session.timeoutId)
      global.REPLY_SESSIONS.delete(m.sender)

      addExp(user, 500)
      addCredit(user, 500)

      return m.reply(
        "🎉 *JAWABAN BENAR!*\n\n" +
        `✅ ${answer.toUpperCase()}\n\n` +
        "🎁 +500 XP\n" +
        "💰 +500 Credit"
      )
    }

    if (sim >= 0.6) {
      return m.reply("🔥 Dikit lagi!")
    }

    return m.reply("❌ Salah, coba lagi!\nReply pesan bergambar di atad untuk jawaban!")
  }
}

function buildHint(answer, step) {
  return answer
    .split(" ")
    .map(word => {
      const show = Math.min(step, word.length)
      return word.slice(0, show) + "_".repeat(word.length - show)
    })
    .join(" ")
}
