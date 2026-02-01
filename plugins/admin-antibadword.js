const { getGroup, saveGroupDB } = require("../lib/dbgroup")

const MAX_STRIKE = 5

module.exports = {
  name: "antibadword",
  command: ["antibadword", "abw"],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,

  usedCmd: [
    "antibadword"
  ],

  async handler({ m, chatId, args, isAdmin, isOwner }) {
    if (!isAdmin && !isOwner)
      return m.reply("❌ Hanya admin grup")

    const group = getGroup(chatId)

    if (!group.settings) group.settings = {}
    if (!group.settings.antibadword) {
      group.settings.antibadword = {
        enabled: false,
        words: [],
        strikes: {}
      }
    }

    const abw = group.settings.antibadword
    const sub = (args[0] || "").toLowerCase()

    if (!sub) {
      return m.reply(
        "🚫 *ANTI BADWORD*\n\n" +
        `Status : ${abw.enabled ? "ON ✅" : "OFF ❌"}\n` +
        `Badword : ${abw.words.length}\n` +
        `Kick    : ${MAX_STRIKE}x pelanggaran\n\n` +
        "Perintah:\n" +
        "• antibadword on\n" +
        "• antibadword off\n" +
        "• antibadword add <kata>\n" +
        "• antibadword del <nomor>\n" +
        "• antibadword list"
      )
    }

    if (sub === "on") {
      abw.enabled = true
      saveGroupDB()
      return m.reply("✅ Anti badword diaktifkan")
    }

    if (sub === "off") {
      abw.enabled = false
      saveGroupDB()
      return m.reply("❌ Anti badword dimatikan")
    }

    if (sub === "add") {
      const word = args.slice(1).join(" ").toLowerCase().trim()
      if (!word) return m.reply("❌ Masukkan kata")

      if (abw.words.includes(word))
        return m.reply("⚠️ Kata sudah ada")

      abw.words.push(word)
      saveGroupDB()

      return m.reply(`✅ Kata *${word}* ditambahkan`)
    }

    if (sub === "del") {
      const index = parseInt(args[1]) - 1
      if (isNaN(index)) return m.reply("❌ Masukkan nomor")

      if (!abw.words[index]) return m.reply("❌ Nomor tidak valid")

      const del = abw.words.splice(index, 1)
      saveGroupDB()

      return m.reply(`🗑️ Kata *${del[0]}* dihapus`)
    }

    if (sub === "list") {
      if (!abw.words.length)
        return m.reply("📭 Belum ada badword")

      let txt = "📛 *DAFTAR BADWORD*\n\n"
      abw.words.forEach((w, i) => {
        txt += `${i + 1}. ${w}\n`
      })

      return m.reply(txt)
    }

    m.reply("❌ Perintah tidak dikenal")
  },

  async responder({ sock, m, text, isOwner }) {
    if (!m.isGroup) return
    if (!text) return
    if (isOwner) return

    const group = getGroup(m.chat)
    const abw = group.settings?.antibadword
    if (!abw?.enabled) return
    if (!abw.words.length) return

    const sender = m.sender
    const lower = text.toLowerCase()

    const found = abw.words.find(w =>
      new RegExp(`\\b${w}\\b`, "i").test(lower)
    )

    if (!found) return

    abw.strikes[sender] = (abw.strikes[sender] || 0) + 1
    const strike = abw.strikes[sender]

    saveGroupDB()

    try {
      await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    if (strike >= MAX_STRIKE) {
      try {
        await sock.groupParticipantsUpdate(
          m.chat,
          [sender],
          "remove"
        )
      } catch {}

      delete abw.strikes[sender]
      saveGroupDB()

      await sock.sendMessage(m.chat, {
        text:
          `🚫 *ANTI BADWORD*\n\n` +
          `👤 @${sender.split("@")[0]}\n` +
          `❌ Melanggar ${MAX_STRIKE}x\n` +
          `👢 Dikeluarkan dari grup`,
        mentions: [sender]
      })

      return true
    }

    await sock.sendMessage(m.chat, {
      text:
        `⚠️ *PERINGATAN BADWORD*\n\n` +
        `👤 @${sender.split("@")[0]}\n` +
        `📛 Kata : *${found}*\n` +
        `📊 Pelanggaran : ${strike}/${MAX_STRIKE}`,
      mentions: [sender]
    })

    return true
  }
}
