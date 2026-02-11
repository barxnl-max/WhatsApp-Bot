const fs = require("fs")
const path = require("path")

const OWNER_JSON = path.join(__dirname, "../data/owner.json")

function loadOwners() {
  if (!fs.existsSync(OWNER_JSON)) return []
  try {
    return JSON.parse(fs.readFileSync(OWNER_JSON))
  } catch {
    return []
  }
}

function saveOwners(data) {
  fs.writeFileSync(OWNER_JSON, JSON.stringify(data, null, 2))
}

function jidToNumber(jid) {
  return jid.split(":")[0].split("@")[0]
}

module.exports = {
  name: "owner",
  command: ["addowner", "delowner", "listowner"],
  tags: ["owner"],
  owner: true,
  usedCmd: ["addowner <tag>", "delowner <tag>", "listowner"],

  async handler({ sock, m, command }) {
    let owners = loadOwners()

    if (command === "listowner") {
      if (!owners.length) {
        return m.reply("📭 Tidak ada owner tambahan")
      }

      let text = "👑 *LIST OWNER TAMBAHAN*\n\n"
      const mentions = []

      owners.forEach((num, i) => {
        const jid = num + "@s.whatsapp.net"
        mentions.push(jid)
        text += `${i + 1}. @${num}\n`
      })

      return sock.sendMessage(
        m.chat,
        { text, mentions },
        { quoted: m }
      )
    }

    let targets = []

    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid

    const replyUser =
      m.message?.extendedTextMessage?.contextInfo?.participant

    if (mention?.length) targets = mention
    else if (replyUser) targets = [replyUser]

    if (!targets.length) {
      return m.reply("❌ Tag atau reply user")
    }

    const targetJid = targets[0]
    const targetNum = jidToNumber(targetJid)

    if (!/^\d+$/.test(targetNum)) {
      return m.reply("❌ Nomor tidak valid")
    }

    if (command === "addowner") {
      if (owners.includes(targetNum)) {
        return m.reply("⚠️ User sudah menjadi owner")
      }

      owners.push(targetNum)
      saveOwners(owners)

      return sock.sendMessage(
        m.chat,
        {
          text: `✅ Owner ditambahkan\n@${targetNum}`,
          mentions: [targetNum + "@s.whatsapp.net"]
        },
        { quoted: m }
      )
    }

    if (command === "delowner") {
      if (!owners.includes(targetNum)) {
        return m.reply("❌ User bukan owner")
      }

      owners = owners.filter(v => v !== targetNum)
      saveOwners(owners)

      return sock.sendMessage(
        m.chat,
        {
          text: `🗑️ Owner dihapus\n@${targetNum}`,
          mentions: [targetNum + "@s.whatsapp.net"]
        },
        { quoted: m }
      )
    }
  }
          }
