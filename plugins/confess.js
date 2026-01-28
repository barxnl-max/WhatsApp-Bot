global.CONFESS_THREADS = global.CONFESS_THREADS || {}

module.exports = {
  name: "confess",
  command: ["confess", "stopconfess"],
  tags: ["fun"],
  limit: false,

  async handler({ sock, m, args, command }) {
    if (command === "stopconfess") {
      const ctx = m.message?.extendedTextMessage?.contextInfo
      const replyId = ctx?.stanzaId || m.quoted?.key?.id

      if (!replyId || !global.CONFESS_THREADS[replyId]) {
        return m.reply("💔 Tidak ada sesi confess yang bisa dihentikan")
      }

      const thread = global.CONFESS_THREADS[replyId]
      const a = thread.a
      const b = thread.b

      delete global.CONFESS_THREADS[replyId]

      await sock.sendMessage(a, {
        text:
          "💔 *CONFESS DIHENTIKAN*\n\n" +
          "🌸 Sesi confess telah berakhir\n" +
          "🕊️ Terima kasih sudah berbagi perasaan"
      })

      await sock.sendMessage(b, {
        text:
          "💔 *CONFESS DIHENTIKAN*\n\n" +
          "🌸 Lawan bicara menghentikan sesi confess\n" +
          "🕊️ Semoga harimu tetap indah"
      })

      await sock.sendMessage(m.chat, {
        react: { text: "💔", key: m.key }
      })

      return
    }

    const target = args[0]
    const text = args.slice(1).join(" ")

    if (!target || !text) {
      return m.reply(
        "🌸 Gunakan:\n" +
        ".confess 628xxxx pesan\n\n" +
        "💮 Contoh:\n" +
        ".confess 62812xxxx halo kamu 🧸"
      )
    }

    const jid =
      target.startsWith("62")
        ? target + "@s.whatsapp.net"
        : target.replace(/^0/, "62") + "@s.whatsapp.net"

    const sent = await sock.sendMessage(jid, {
      text:
        "💌 *CONFESS ANONIM* 💌\n\n" +
        "🌸 Pesan untukmu:\n" +
        text +
        "\n\n💮 Balas pesan ini untuk membalas\n" +
        "🎀 Gunakan .stopconfess untuk berhenti"
    })

    global.CONFESS_THREADS[sent.key.id] = {
      a: m.sender,
      b: jid
    }

    await m.reply("💖 Confess terkirim 🌷")
  },

  async responder({ sock, m }) {
    const ctx = m.message?.extendedTextMessage?.contextInfo
    const replyId = ctx?.stanzaId || m.quoted?.key?.id
    if (!replyId) return false

    const thread = global.CONFESS_THREADS[replyId]
    if (!thread) return false

    const text = m.text
    if (!text) return true

    if (text.toLowerCase() === ".stopconfess") {
      delete global.CONFESS_THREADS[replyId]

      await sock.sendMessage(thread.a, {
        text:
          "💔 *CONFESS DIHENTIKAN*\n\n" +
          "🌸 Salah satu pihak menghentikan sesi"
      })

      await sock.sendMessage(thread.b, {
        text:
          "💔 *CONFESS DIHENTIKAN*\n\n" +
          "🌸 Salah satu pihak menghentikan sesi"
      })

      return true
    }

    const to = m.sender === thread.a ? thread.b : thread.a

    const sent = await sock.sendMessage(to, {
      text:
        "💬 *BALASAN CONFESS* 💬\n\n" +
        "🧸 Pesan:\n" +
        text +
        "\n\n💮 Balas lagi untuk lanjut\n" +
        "💔 Ketik .stopconfess untuk berhenti"
    })

    delete global.CONFESS_THREADS[replyId]
    global.CONFESS_THREADS[sent.key.id] = thread

    await sock.sendMessage(m.chat, {
      react: { text: "💌", key: m.key }
    })

    return true
  }
}