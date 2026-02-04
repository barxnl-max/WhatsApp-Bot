if (!global.anticall) {
  global.anticall = {
    enabled: true,
    autoblock: true
  }
}

module.exports = {
  name: "anticall",
  command: ["anticall"],
  tags: ["owner"],
  owner: true,

  usedCmd: [
    "anticall"
  ],

  async handler({ m, args }) {
    const sub = (args[0] || "").toLowerCase()

    if (!sub) {
      return m.reply(
        "📵 *ANTI CALL*\n\n" +
        `Status : ${global.anticall.enabled ? "ON ✅" : "OFF ❌"}\n` +
        `Auto Block : ${global.anticall.autoblock ? "ON" : "OFF"}\n\n` +
        "Gunakan:\n" +
        "• anticall on\n" +
        "• anticall off"
      )
    }

    if (sub === "on") {
      global.anticall.enabled = true
      return m.reply("✅ Anti call diaktifkan")
    }

    if (sub === "off") {
      global.anticall.enabled = false
      return m.reply("❌ Anti call dimatikan")
    }

    return m.reply("❌ Perintah tidak dikenal")
  },

  async onCall({ sock, call }) {
    if (!global.anticall?.enabled) return

    const caller = call.from

    try {
      await sock.rejectCall(call.id, caller)
    } catch {}

    try {
      await sock.sendMessage(caller, {
        text:
          "📵 *ANTI CALL*\n\n" +
          "❌ Jangan menelpon bot\n" +
          "Gunakan chat untuk berinteraksi."
      })
    } catch {}

    if (global.anticall.autoblock) {
      try {
        await sock.updateBlockStatus(caller, "block")
      } catch {}
    }
  }
}

