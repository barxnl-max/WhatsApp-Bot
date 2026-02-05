const moment = require("moment-timezone")
const { getUser } = require("../lib/dbuser")

const readmore = String.fromCharCode(8206).repeat(4001)

module.exports = {
  name: "menu",
  command: ["menu", "help"],
  usedCmd: ["menu", "help"],
  tags: ["main"],

  async handler({ m, prefix, plugins, senderId, isOwner, isPremium }) {
    const user = getUser(senderId)

    const time = moment.tz("Asia/Jakarta")
    const jam = time.format("HH:mm:ss")
    const tanggal = time.format("DD MMMM YYYY")

    const statusUser = isOwner ? "👑 Owner" : "👤 User"
    const akunStatus = isPremium ? "⭐ Premium" : "🆓 Free"
    const limitText = isPremium ? "∞" : user.limit.daily

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
            menuMap[tag].push({
              cmd: c,
              premium: p.premium === true
            })
          }
        }
      }
    }

    let text = `
╭─〔 🤖 BOT MENU 〕
│
│ 🕒 Jam      : ${jam}
│ 📆 Tanggal  : ${tanggal}
│ 🎟️ Limit    : ${limitText}
│ 👤 Status   : ${statusUser}
│ 💳 Akun     : ${akunStatus}
│
${readmore}
`.trimStart()

    for (const tag of Object.keys(menuMap)) {
      text += `\n├─〔 ${tagName(tag)} 〕\n`

      for (const item of menuMap[tag]) {
        const cmd = `${prefix}${item.cmd}`
        const display = item.premium ? `\`${cmd}\`` : cmd
        text += `│ • ${display}\n`
      }

      text += "│"
    }

    text += "\n╰──────────────"

    await m.reply(text)
  }
}

function tagName(tag) {
  return (
    {
      main: "🏠 Main",
      tools: "⚙️ Tools",
      admin: "🛡️ Admin",
      downloader: "📥 Downloader",
      owner: "👑 Owner",
      fun: "🎲 Fun",
      game: "🎮 Game",
      islam: "🕌 Islam",
      user: "👤 User",
      ai: "🤖 AI",
      nsfw: "🔞 NSFW",
      misc: "🧩 Misc",
      sticker: "🧷 Sticker",
      random: "🎯 Random"
    }[tag] || tag.toUpperCase()
  )
}
