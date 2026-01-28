module.exports = {
  name: "blockcmd",
  command: ["blockcmd"],
  usedCmd: "blockcmd",
  tags: ["owner"],
  owner: true,

  async handler({ m, args }) {
    if (!global.blockedCommands) global.blockedCommands = [];

    const sub = (args[0] || "").toLowerCase();
    const target = (args[1] || "").toLowerCase();

    if (!sub || sub === "list") {
      if (!global.blockedCommands.length) {
        return m.reply("📛 Tidak ada command yang diblok.");
      }

      return m.reply(
        `📛 *Blocked Commands*\n\n` +
          global.blockedCommands.map((c) => `• ${c}`).join("\n"),
      );
    }

    if (!target) {
      return m.reply(
        "❌ Usage:\n" +
          ".blockcmd add <command>\n" +
          ".blockcmd del <command>\n" +
          ".blockcmd list",
      );
    }

    if (sub === "add") {
      if (global.blockedCommands.includes(target)) {
        return m.reply(`⚠️ *${target}* sudah diblok.`);
      }

      global.blockedCommands.push(target);
      return m.reply(`✅ *${target}* berhasil diblok.`);
    }

    if (sub === "del" || sub === "remove") {
      if (!global.blockedCommands.includes(target)) {
        return m.reply(`⚠️ *${target}* tidak ada di daftar blok.`);
      }

      global.blockedCommands = global.blockedCommands.filter(
        (c) => c !== target,
      );

      return m.reply(`♻️ *${target}* berhasil dibuka kembali.`);
    }

    return m.reply(
      "❌ Usage:\n" +
        ".blockcmd add <command>\n" +
        ".blockcmd del <command>\n" +
        ".blockcmd list",
    );
  },
};
