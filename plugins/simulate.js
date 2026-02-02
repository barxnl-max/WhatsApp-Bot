module.exports = {
  name: "simulate",
  command: ["simulate"],
  tags: ["admin"],
  group: true,
  admin: true,
  limit: false,

  async handler({ sock, m, chatId, args }) {
    const mode = (args[0] || "").toLowerCase();

    if (!["welcome", "leave"].includes(mode)) {
      return m.reply(
        "❌ Mode tidak valid\n\n" +
          "Gunakan:\n" +
          "simulate welcome\n" +
          "simulate leave",
      );
    }

    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    const targets = mentioned?.length ? mentioned : [m.sender];

    const groupMetadata = await sock.groupMetadata(chatId);

    let executed = false;

    for (const p of global.plugins) {
      if (mode === "welcome" && typeof p.onGroupJoin === "function") {
        executed = true;
        await p.onGroupJoin({
          sock,
          chatId,
          participants: targets,
          groupMetadata,
        });
      }

      if (mode === "leave" && typeof p.onGroupLeave === "function") {
        executed = true;
        await p.onGroupLeave({
          sock,
          chatId,
          participants: targets,
          groupMetadata,
        });
      }
    }

    if (!executed) {
      return m.reply(
        "⚠️ Simulasi dijalankan\n\n" +
          `❌ Tidak ada plugin ${mode} yang aktif\n` +
          `Pastikan fitur ${mode} sudah ON`,
      );
    }

    await m.reply(`✅ Simulasi ${mode} berhasil`);
  },
};
