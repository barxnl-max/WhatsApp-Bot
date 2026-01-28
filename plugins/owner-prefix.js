module.exports = {
  name: "prefix",
  command: ["prefix"],
  usedCmd: "prefix",
  tags: ["owner"],
  owner: true,

  async handler({ m, args }) {
    const sub = (args[0] || "").toLowerCase();

    if (sub === "on") {
      global.noPrefix = false;
      return m.reply("✅ Prefix mode ON");
    }

    if (sub === "off") {
      global.noPrefix = true;
      return m.reply("⚠️ Prefix mode OFF (no prefix)");
    }

    if (sub === "set") {
      const newPrefix = args.slice(1);
      if (!newPrefix.length) {
        return m.reply("❌ Usage:\n.prefix set . ! / #");
      }

      global.prefix = [...new Set(newPrefix)];
      return m.reply(`✅ Prefix updated:\n${global.prefix.join(" ")}`);
    }

    return m.reply(
      `📌 *Prefix Settings*\n\n` +
        `Mode    : ${global.noPrefix ? "OFF (no prefix)" : "ON"}\n` +
        `Prefix  : ${global.prefix.join(" ")}\n\n` +
        `Usage:\n` +
        `• .prefix on\n` +
        `• .prefix off\n` +
        `• .prefix set . ! / #`,
    );
  },
};
