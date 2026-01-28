module.exports = {
  name: "unregister",
  command: ["unreg", "unregister"],
  tags: ["user"],
  limit: false,

  async handler({ m }) {
    if (!global.db[m.sender]) {
      return m.reply("❌ Kamu belum terdaftar");
    }

    const msg = await m.reply(
      "⚠️ *KONFIRMASI UNREGISTER*\n\n" +
        "Semua data kamu akan dihapus permanen.\n\n" +
        "Reply:\n" +
        "• yes → lanjut\n" +
        "• no  → batal",
    );

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "unregister",
      msgId: msg.key.id,
      expire: Date.now() + 60_000,
    });
  },

  async onReply({ m, session }) {
    const text = (m.text || "").toLowerCase().trim();

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply("⏳ Konfirmasi expired");
    }

    if (text === "yes") {
      delete global.db[m.sender];
      global.REPLY_SESSIONS.delete(m.sender);

      return m.reply(
        "✅ *UNREGISTER BERHASIL*\n\n" +
          "Data kamu sudah dihapus.\n" +
          "Ketik *daftar nama umur* untuk daftar ulang.",
      );
    }

    if (text === "no") {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply("❎ Unregister dibatalkan");
    }

    return m.reply("❌ Reply *yes* atau *no* saja");
  },
};
