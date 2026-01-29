const fs = require("fs")
const path = require("path")

const DB_PATH = path.join(__dirname, "../data/iklan.json")
const COOLDOWN = 10 * 60 * 1000

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH))
  } catch {
    return {
      sourceGroup: null,
      list: [],
      lastSend: 0
    }
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function cleanText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

module.exports = {
  name: "iklan",
  command: ["iklan"],
  tags: ["owner"],
  owner: true,
  group: true,

  async handler({ m, chatId, args, prefix, command }) {
    const db = loadDB()
    const sub = (args[0] || "").toLowerCase()

    if (!sub) {
      return m.reply(
        `📢 *IKLAN BOT*\n\n` +
        `📍 Source Group : ${db.sourceGroup ? "Aktif" : "Belum diset"}\n` +
        `📦 Total Iklan : ${db.list.length}\n\n` +
        `Gunakan:\n` +
        `.iklan set\n` +
        `.iklan add <teks>\n` +
        `.iklan del <nomor>\n` +
        `.iklan list`
      )
    }

    if (sub === "set") {
      db.sourceGroup = chatId
      saveDB(db)
      return m.reply("✅ Grup ini dijadikan source iklan")
    }

    if (sub === "add") {
      const fullText = m.text || ""
      const cut = `${prefix}${command} add`
      const index = fullText.indexOf(cut)

      if (index === -1) return m.reply("❌ Gagal membaca teks iklan")

      const text = fullText.slice(index + cut.length).trim()
      if (!text) return m.reply("❌ Teks iklan kosong")

      db.list.push(cleanText(text))
      saveDB(db)

      return m.reply("✅ Iklan berhasil ditambahkan (format aman)")
    }

    if (sub === "del") {
      const i = parseInt(args[1]) - 1
      if (isNaN(i) || !db.list[i]) return m.reply("❌ Nomor iklan tidak valid")

      db.list.splice(i, 1)
      saveDB(db)
      return m.reply("🗑️ Iklan dihapus")
    }

    if (sub === "list") {
      if (!db.list.length) return m.reply("❌ Belum ada iklan")

      let text = "📋 *DAFTAR IKLAN*\n\n"
      db.list.forEach((v, i) => {
        text += `${i + 1}.\n${v}\n\n──────────────\n\n`
      })

      return m.reply(text.trim())
    }
  },

  async responder({ sock, m }) {
    if (!m.isGroup) return false

    const db = loadDB()
    if (!db.sourceGroup) return false
    if (!db.list.length) return false
    if (m.chat === db.sourceGroup) return false

    const now = Date.now()
    if (now - db.lastSend < COOLDOWN) return false
    if (Math.random() > 0.2) return false

    const iklan = cleanText(pick(db.list))

    await sock.sendMessage(m.chat, {
      text:
        `📢 *IKLAN*\n` +
        `──────────────\n\n` +
        iklan
    })

    db.lastSend = now
    saveDB(db)

    return false
  }
}
