const moment = require("moment-timezone")
const { getUser } = require("../lib/dbuser")

const readmore = String.fromCharCode(8206).repeat(4001)

const headers = [
  "𝙻𝚈𝙳𝙸𝙰 𝙱𝙾𝚃",
  "𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝙱𝙰𝙲𝙺",
  "𝙱𝙾𝚃 𝙼𝙴𝙽𝚄",
  "𝙷𝙴𝙻𝙻𝙾 𝚂𝚆𝙴𝙴𝚃𝙸𝙴"
]

function getHeader() {
  return headers[Math.floor(Math.random() * headers.length)]
}

function getLevelInfo(xp = 0) {
  const level = Math.floor(xp / 100)
  const next = (level + 1) * 100
  return { level, next }
}

function formatTag(tag) {
  const map = {
    main: "𝙼𝙰𝙸𝙽",
    tools: "𝚃𝙾𝙾𝙻𝚂",
    admin: "𝙰𝙳𝙼𝙸𝙽",
    downloader: "𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁",
    owner: "𝙾𝚆𝙽𝙴𝚁",
    fun: "𝙵𝚄𝙽",
    game: "𝙶𝙰𝙼𝙴",
    islam: "𝙸𝚂𝙻𝙰𝙼",
    user: "𝚄𝚂𝙴𝚁",
    ai: "𝙰𝙸",
    nsfw: "𝙽𝚂𝙵𝚆",
    misc: "𝙼𝙸𝚂𝙲",
    internet: "𝙸𝙽𝚃𝙴𝚁𝙽𝙴𝚃",
    sticker: "𝚂𝚃𝙸𝙲𝙺𝙴𝚁",
    random: "𝚁𝙰𝙽𝙳𝙾𝙼",
    rpg: "𝚁𝙿𝙶",
    anime: "𝙰𝙽𝙸𝙼𝙴",
    image: "𝙸𝙼𝙰𝙶𝙴",
    group: "𝙶𝚁𝙾𝚄𝙿",
    info: "𝙸𝙽𝙵𝙾"
  }
  return map[tag] || tag.toUpperCase()
}

function generateMenu(style, user, m, prefix, plugins, isOwner, isPremium, sock, jam, tanggal, statusUser, akunStatus, limitText, level, next, sortedTags, menuMap) {
  let text = ""

  if (style === 1) {
    text = `
╭───────────────
   ${getHeader()}
╰───────────────

User   : ${m.pushName || "User"}
Status : ${statusUser}
Level  : ${level}
XP     : ${user.xp || 0} / ${next}
Limit  : ${limitText}
DB     : SawitDB 🌱
Time   : ${jam}
Date   : ${tanggal}
${readmore}
`.trimStart()

    for (const tag of sortedTags) {
      text += `\n┈┈┈┈  ${formatTag(tag)}  ┈┈┈┈\n`
      for (const item of menuMap[tag]) {
        const cmd = `${prefix}${item.cmd}`
        text += `• ${cmd}${item.premium ? " 〔Premium〕" : ""}\n`
      }
    }

    text += `\n┈┈┈┈┈┈┈┈┈┈\nSystem Online\nRuntime : ${process.uptime().toFixed(0)}s`
    if (sock.isClone) text += `\nPowered by ${global.botname || 'Lydia AI'}`
  }

  if (style === 2) {
    text = `
૮₊˚⊹♡ ${getHeader()} ♡⊹˚₊

୨୧ Hai ${m.pushName || "Bestie"} !!
୨୧ Status   : ${statusUser}
୨୧ Account  : ${akunStatus}
୨୧ Level    : ${level}
୨୧ XP       : ${user.xp || 0} / ${next}
୨୧ Limit    : ${limitText}
୨୧ DB       : SawitDB 🌱
୨୧ Time     : ${jam}
୨୧ Date     : ${tanggal}

꒰ა ♡ Scroll yaa ♡ ꒱
${readmore}
`.trimStart()

    for (const tag of sortedTags) {
      text += `\n╰┈➤ ${formatTag(tag)} 💕\n\n`
      for (const item of menuMap[tag]) {
        const cmd = `${prefix}${item.cmd}`
        text += `   ♡ ${cmd}${item.premium ? " 💎" : ""}\n`
      }
    }

    text += `\n꒰ა 💖 Bot lagi online yaa~\n꒰ა ⏳ Runtime : ${process.uptime().toFixed(0)}s`
    if (sock.isClone) text += `\n꒰ა Powered by ${global.botname || 'Lydia AI'}`
  }

  if (style === 3) {
    text = `
╭・🌸﹒Lydia Bot Menu﹒🌸・╮
│ 💗 Haiii ${m.pushName || "Sweetie"}~
│
│ 👑 Status  : ${statusUser}
│ 💎 Account : ${akunStatus}
│ 🎀 Level   : ${level}
│ ✨ XP      : ${user.xp || 0} / ${next}
│ 🎯 Limit   : ${limitText}
│ 📦 DB      : SawitDB 🌱
│ ⏰ Time    : ${jam}
│ 📅 Date    : ${tanggal}
╰・✨﹒Have Fun﹒✨・╯
${readmore}
`.trimStart()

    for (const tag of sortedTags) {
      text += `\n୨୧ ── ${formatTag(tag)} ── ୨୧\n`
      for (const item of menuMap[tag]) {
        const cmd = `${prefix}${item.cmd}`
        text += `♡ ${cmd}${item.premium ? " 〔💎〕" : ""}\n`
      }
      text += `\n`
    }

    text += `⏳ Runtime  : ${process.uptime().toFixed(0)}s\n💞 Lydia Always With You`
    if (sock.isClone) text += `\nPowered by ${global.botname || 'Lydia AI'}`
  }

  return text
}

module.exports = {
  name: "menu",
  command: ["menu", "help", "setmenu"],
  usedCmd: ["menu", "help", "setmenu"],
  tags: ["main"],

  async handler({ sock, m, prefix, plugins, senderId, isOwner, isPremium, args, command }) {

    global.db.settings ||= {}
    if (!global.db.settings.menuStyle) global.db.settings.menuStyle = 2

    if (command === "setmenu") {
      if (!isOwner) return m.reply("Owner only.")
      const input = args.join(" ")
      if (!input) return m.reply("Masukkan nomor style (1/2/3) atau teks custom untuk menu.")

      const styleNum = parseInt(input)
      if (!isNaN(styleNum) && [1,2,3].includes(styleNum)) {
        global.db.settings.menuStyle = styleNum
        delete global.db.settings.menuCustom
        return m.reply(`✅ Menu style diubah ke ${styleNum}`)
      } else {
        global.db.settings.menuStyle = 4
        global.db.settings.menuCustom = input
        return m.reply(`✅ Menu custom telah disimpan.\nGunakan .menu untuk melihat hasil.`)
      }
    }

    const MENU_STYLE = global.db.settings.menuStyle
    const user = getUser(senderId)

    const time = moment.tz("Asia/Jakarta")
    const jam = time.format("HH:mm:ss")
    const tanggal = time.format("DD MMMM YYYY")

    const statusUser = isOwner ? "Owner" : "User"
    const akunStatus = isPremium ? "Premium" : "Free"
    const limitText = isPremium ? "Unlimited" : user.limit?.daily || 0

    const { level, next } = getLevelInfo(user.xp || 0)

    const menuMap = {}

    for (const p of plugins) {
      if (!Array.isArray(p.tags)) continue
      if (p.owner && !isOwner) continue
      if (p.premium && !isPremium) continue

      let cmds = []

      if (Array.isArray(p.usedCmd)) cmds = p.usedCmd
      else if (typeof p.usedCmd === "string") cmds = [p.usedCmd]
      else if (Array.isArray(p.command)) cmds = [p.command[0]]
      else if (typeof p.command === "string") cmds = [p.command]

      cmds = cmds.map(v => v.trim()).filter(Boolean)

      for (const tag of p.tags) {
        if (!menuMap[tag]) menuMap[tag] = []
        for (const c of cmds) {
          if (!menuMap[tag].some(v => v.cmd === c)) {
            menuMap[tag].push({ cmd: c, premium: p.premium === true })
          }
        }
      }
    }

    const sortedTags = Object.keys(menuMap).sort()
    let text = ""

    if (MENU_STYLE === 4 && global.db.settings.menuCustom) {
      let template = global.db.settings.menuCustom
      const menuStandar = generateMenu(1, user, m, prefix, plugins, isOwner, isPremium, sock, jam, tanggal, statusUser, akunStatus, limitText, level, next, sortedTags, menuMap)
      const replacements = {
        "%prefix": prefix,
        "%jam": jam,
        "%tanggal": tanggal,
        "%nama": m.pushName || "User",
        "%level": level,
        "%xp": `${user.xp || 0} / ${next}`,
        "%limit": limitText,
        "%status": statusUser,
        "%akun": akunStatus,
        "%runtime": process.uptime().toFixed(0),
        "%botname": global.botname || "Lydia AI",
        "%author": global.author || "Barxnl",
        "%readmore": readmore,
        "%menu": menuStandar,
        "%uptime": process.uptime().toFixed(0)
      }
      for (const [key, value] of Object.entries(replacements)) {
        template = template.split(key).join(value)
      }
      text = template
    } else {
      text = generateMenu(MENU_STYLE, user, m, prefix, plugins, isOwner, isPremium, sock, jam, tanggal, statusUser, akunStatus, limitText, level, next, sortedTags, menuMap)
    }

    await sock.sendMessage(m.chat, { text }, { quoted: m })
  }
}