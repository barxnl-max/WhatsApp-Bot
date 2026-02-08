module.exports = {
  name: "autogroup",
  command: ["autogroup"],
  admin: true,
  group: true,
  botAdmin: true,

  async handler({ m, args }) {
    global.db.autogroup ||= {}
    const gid = m.chat
    const sub = (args[0] || "").toLowerCase()

    if (!global.db.autogroup[gid]) {
      global.db.autogroup[gid] = {
        active: false,
        timezone: null,
        schedules: []
      }
    }

    const cfg = global.db.autogroup[gid]

    if (!sub) {
      return m.reply(
        "🔒 *AUTOGROUP*\n\n" +
        "• autogroup set <wib|wita|wit>\n" +
        "• autogroup on / off\n" +
        "• autogroup close <HH:MM>\n" +
        "• autogroup open <HH:MM>\n" +
        "• autogroup delete\n" +
        "• autogroup status"
      )
    }

    if (sub === "set") {
      const tz = (args[1] || "").toLowerCase()
      if (!["wib", "wita", "wit"].includes(tz)) {
        return m.reply("❌ Timezone tidak valid")
      }
      cfg.timezone = tz
      return m.reply(`🌍 Timezone diset ke *${tz.toUpperCase()}*`)
    }

    if (!cfg.timezone) {
      return m.reply("❗ Wajib set timezone dulu\nContoh: autogroup set wib")
    }

    if (sub === "on") {
      cfg.active = true
      return m.reply("✅ Autogroup diaktifkan")
    }

    if (sub === "off") {
      cfg.active = false
      return m.reply("❌ Autogroup dimatikan")
    }

    if (sub === "close" || sub === "open") {
      const time = args[1]
      if (!isValidTime(time)) {
        return m.reply("❌ Format waktu salah (HH:MM)")
      }

      cfg.schedules.push({ type: sub, time })
      return m.reply(
        `${sub === "close" ? "🔒" : "🔓"} Jadwal ditambahkan\n🕒 ${time}`
      )
    }

    if (sub === "status") {
      const list =
        cfg.schedules
          .map((s, i) => `${i + 1}. ${s.type.toUpperCase()} - ${s.time}`)
          .join("\n") || "-"

      return m.reply(
        "📊 *AUTOGROUP STATUS*\n\n" +
        `Aktif    : ${cfg.active ? "✅" : "❌"}\n` +
        `Timezone : ${cfg.timezone.toUpperCase()}\n\n` +
        "*JADWAL:*\n" + list
      )
    }

    if (sub === "delete") {
      if (!cfg.schedules.length) {
        return m.reply("❌ Tidak ada jadwal")
      }

      let text = "*🗑 HAPUS JADWAL*\n\n"
      cfg.schedules.forEach((s, i) => {
        text += `${i + 1}. ${s.type.toUpperCase()} - ${s.time}\n`
      })
      text += "\nReply angka (1 / 1 2) atau *all*"

      const sent = await m.reply(text)

      global.REPLY_SESSIONS.set(m.sender, {
        plugin: "autogroup",
        msgId: sent.key.id,
        expire: Date.now() + 60000,
        data: { gid }
      })
      return
    }

    m.reply("❌ Sub-command tidak dikenali")
  },

  async onReply({ m, session }) {
    const text = m.text.trim().toLowerCase()
    const cfg = global.db.autogroup[session.data.gid]
    if (!cfg) return

    if (text === "all") {
      cfg.schedules = []
      global.REPLY_SESSIONS.delete(m.sender)
      return m.reply("✅ Semua jadwal dihapus")
    }

    const nums = text.split(/\s+/).map(v => parseInt(v))
    if (!nums.length) return

    cfg.schedules = cfg.schedules.filter((_, i) => !nums.includes(i + 1))
    global.REPLY_SESSIONS.delete(m.sender)
    return m.reply("✅ Jadwal terpilih dihapus")
  },

  onLoad() {
    setInterval(runAutoGroup, 60000)
  }
}

function isValidTime(t) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t)
}

function getTimeByTZ(tz) {
  const offset = { wib: 7, wita: 8, wit: 9 }[tz]
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + offset * 3600000).toTimeString().slice(0, 5)
}

async function runAutoGroup() {
  if (!global.sock || !global.db?.autogroup) return

  for (const [gid, cfg] of Object.entries(global.db.autogroup)) {
    if (!cfg.active || !cfg.timezone) continue

    const now = getTimeByTZ(cfg.timezone)

    for (const s of cfg.schedules) {
      if (s.time !== now) continue

      try {
        await global.sock.groupSettingUpdate(
          gid,
          s.type === "close"
            ? "announcement"
            : "not_announcement"
        )
      } catch {}
    }
  }
}
