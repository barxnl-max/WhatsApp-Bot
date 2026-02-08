const fs = require("fs")
const path = require("path")
const axios = require("axios")
const isAdminLib = require("../lib/isAdmin")

const ADZAN_MP3 = path.join(process.cwd(), "assets", "adzan.mp3")

module.exports = {
  name: "autoadzan",
  command: ["autoadzan"],
  group: true,
  tags: ["islam"],

  async handler({ sock, m, args, isAdmin, isOwner }) {
    global.db.autoadzan ||= {}

    const gid = m.chat
    const input = (args.join(" ") || "").toLowerCase()

    if (!global.db.autoadzan[gid]) {
      global.db.autoadzan[gid] = {
        active: false,
        cityId: null,
        cityName: null,
        timezone: "WIB",
        schedule: null,
        canClose: false,
        lastDate: null,
        lastTrigger: null
      }
    }

    const cfg = global.db.autoadzan[gid]

    if (!input || input === "status") {
      return m.reply(
        "📊 *AUTO ADZAN STATUS*\n\n" +
        `• Aktif : ${cfg.active ? "✅ YA" : "❌ TIDAK"}\n` +
        `• Kota : ${cfg.cityName || "-"}\n` +
        `• Zona : ${cfg.timezone}\n` +
        `• Bot Admin : ${cfg.canClose ? "✅ YA" : "❌ TIDAK"}`
      )
    }

    if (input === "off") {
      if (!isAdmin && !isOwner) return m.reply("❌ Hanya admin atau owner")
      cfg.active = false
      return m.reply("❌ Auto adzan dimatikan")
    }

    if (!isAdmin && !isOwner) {
      return m.reply("❌ Hanya admin atau owner")
    }

    try {
      const kotaRes = await axios.get(
        "https://api.myquran.com/v2/sholat/kota/semua"
      )

      const kotaList = kotaRes.data.data
      const found = kotaList.find(v =>
        v.lokasi.toLowerCase().includes(input)
      )

      if (!found) return m.reply("❌ Kota tidak ditemukan")

      const zona =
        /papua|jayapura|manokwari/i.test(found.lokasi) ? "WIT" :
        /ambon|ternate|tidore/i.test(found.lokasi) ? "WIT" :
        /makassar|samarinda|balikpapan|kendari|palu/i.test(found.lokasi) ? "WITA" :
        "WIB"

      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const dd = String(now.getDate()).padStart(2, "0")
      const todayKey = `${yyyy}-${mm}-${dd}`

      const jadwalRes = await axios.get(
        `https://api.myquran.com/v2/sholat/jadwal/${found.id}/${yyyy}/${mm}/${dd}`
      )

      const j = jadwalRes.data.data.jadwal
      const adminStatus = await isAdminLib(sock, gid, m.sender)

      cfg.active = true
      cfg.cityId = found.id
      cfg.cityName = found.lokasi
      cfg.timezone = zona
      cfg.lastDate = todayKey
      cfg.lastTrigger = null
      cfg.canClose = adminStatus.isBotAdmin === true
      cfg.schedule = {
        subuh: j.subuh,
        dzuhur: j.dzuhur,
        ashar: j.ashar,
        maghrib: j.maghrib,
        isya: j.isya
      }

      return m.reply(
        "✅ *AUTO ADZAN AKTIF*\n\n" +
        `📍 Kota : *${found.lokasi}*\n` +
        `🕰 Zona : ${zona}\n` +
        `🤖 Bot Admin : ${cfg.canClose ? "✅ YA" : "❌ TIDAK"}`
      )
    } catch {
      return m.reply("❌ Gagal mengambil jadwal sholat")
    }
  },

  onLoad() {
    setInterval(runAutoAdzan, 60 * 1000)
  }
}

function getLocalHHMM(timezone) {
  const offset = { WIB: 7, WITA: 8, WIT: 9 }[timezone] || 7
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const local = new Date(utc + offset * 3600000)
  return local.toTimeString().slice(0, 5)
}

async function runAutoAdzan() {
  if (!global.db?.autoadzan || !global.sock) return

  const today = new Date().toISOString().slice(0, 10)

  for (const [gid, cfg] of Object.entries(global.db.autoadzan)) {
    if (!cfg.active || !cfg.schedule) continue

    if (cfg.lastDate !== today) {
      cfg.lastDate = today
      cfg.lastTrigger = null
    }

    const hhmm = getLocalHHMM(cfg.timezone)

    let prayerName = null
    for (const [name, time] of Object.entries(cfg.schedule)) {
      if (time === hhmm) {
        prayerName = name
        break
      }
    }

    if (!prayerName) continue

    const triggerKey = `${today}|${prayerName}`
    if (cfg.lastTrigger === triggerKey) continue

    cfg.lastTrigger = triggerKey

    try {
      await global.sock.sendMessage(gid, {
        text:
          `🕌 *Waktu ${capitalize(prayerName)} telah tiba*\n\n` +
          "Mari tunaikan sholat 🤍"
      })

      if (fs.existsSync(ADZAN_MP3)) {
        await global.sock.sendMessage(gid, {
          audio: fs.readFileSync(ADZAN_MP3),
          mimetype: "audio/mpeg",
          contextInfo: {
            externalAdReply: {
              title: "Lydia AI",
              body: `Waktunya sholat ${capitalize(prayerName)}`,
              thumbnailUrl: "https://i.ibb.co.com/6cPQFYyc/100070162.jpg",
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: "https://github.com/barxnl-max/WhatsApp-Bot"
            }
          }
        })
      }

      if (cfg.canClose) {
        await global.sock.groupSettingUpdate(gid, "announcement")
        setTimeout(async () => {
          try {
            await global.sock.groupSettingUpdate(gid, "not_announcement")
          } catch {}
        }, 10 * 60 * 1000)
      }
    } catch {}
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
