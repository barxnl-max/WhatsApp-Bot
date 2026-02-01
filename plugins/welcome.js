const fs = require("fs")
const path = require("path")
const { Welcome } = require("../lib/welcome")

const DB_PATH = path.join(__dirname, "../data/welcome.json")

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH))
  } catch {
    return {}
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

module.exports = {
  name: "welcome",
  command: ["welcome"],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,

  async handler({ m, chatId, args, isAdmin, isOwner }) {
    if (!isAdmin && !isOwner)
      return m.reply("❌ Hanya admin grup")

    const db = loadDB()

    if (!db[chatId]) {
      db[chatId] = {
        enabled: false,
        mode: "image",
        text: "👋 Selamat datang @user di @group\nMember ke-@member"
      }
      saveDB(db)
    }

    if (!db[chatId].mode) db[chatId].mode = "image"
    if (!db[chatId].text)
      db[chatId].text =
        "👋 Selamat datang @user di @group\nMember ke-@member"

    const sub = (args[0] || "").toLowerCase()

    if (!sub) {
      return m.reply(
        `👋 *WELCOME SETTING*\n\n` +
        `Status : ${db[chatId].enabled ? "ON ✅" : "OFF ❌"}\n` +
        `Mode   : ${(db[chatId].mode || "image").toUpperCase()}\n\n` +
        `Text :\n${db[chatId].text}\n\n` +
        `Gunakan:\n` +
        `.welcome on\n` +
        `.welcome off\n` +
        `.welcome set <text>\n` +
        `.welcome set --text <text>\n\n` +
        `Variabel:\n@user @group @member @desc`
      )
    }

    if (sub === "on") {
      db[chatId].enabled = true
      saveDB(db)
      return m.reply("✅ Welcome diaktifkan")
    }

    if (sub === "off") {
      db[chatId].enabled = false
      saveDB(db)
      return m.reply("❌ Welcome dimatikan")
    }

    if (sub === "set") {
  const isTextOnly = args[1] === "--text"

  const raw =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ""
 
  const text = raw
    .replace(/^\.welcome\s+set(\s+--text)?/i, "")
    .trim()

  if (!text)
    return m.reply("❌ Masukkan teks welcome")

  db[chatId].text = text
  db[chatId].mode = isTextOnly ? "text" : "image"
  saveDB(db)

  return m.reply(
    `✅ Welcome disimpan\nMode: ${db[chatId].mode.toUpperCase()}`
  )
}

    m.reply("❌ Perintah tidak dikenal")
  },

  async onGroupJoin({ sock, chatId, participants, groupMetadata }) {
  const db = loadDB()
  if (!db[chatId]?.enabled) return

  const desc = groupMetadata.desc || "Tidak ada deskripsi"

  for (const p of participants) {
    const jid = typeof p === "string" ? p : p?.id
    if (!jid) continue

    const username = jid.split("@")[0]

    const text = db[chatId].text
      .replace(/@user/g, `@${username}`)
      .replace(/@group/g, groupMetadata.subject)
      .replace(/@member/g, groupMetadata.participants.length)
      .replace(/@desc/g, desc)

    if (db[chatId].mode === "text") {
      await sock.sendMessage(chatId, {
        text,
        mentions: [jid]
      })
      continue
    }

    let avatar
    try {
      avatar = await sock.profilePictureUrl(jid, "image")
    } catch {
      avatar = "https://i.ibb.co/4pDNDk1/avatar.png"
    }

    const img = await Welcome({
      avatar,
      username,
      group: groupMetadata.subject,
      member: groupMetadata.participants.length
    })

    await sock.sendMessage(chatId, {
      image: img,
      caption: text,
      mentions: [jid]
    })
  }
}
}
