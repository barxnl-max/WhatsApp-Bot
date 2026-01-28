module.exports = {
  name: "leaderboard",
  command: ["leaderboard", "lb"],
  tags: ["game"],
  premium: false,
  limit: false,
  group: false,
  private: false,

  async handler({ m, sock }) {
    const db = global.db || {};

    const users = Object.entries(db)
      .filter(([_, u]) => u && typeof u.level === "number")
      .map(([jid, u]) => ({
        jid,
        level: u.level,
        exp: u.exp || 0,
        credit: u.credit || 0,
        limit: u.limit?.daily ?? 0,
        premium: !!u.premium,
      }));

    if (!users.length) {
      return m.reply("❌ Belum ada data user");
    }

    users.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.exp - a.exp;
    });

    const top = users.slice(0, 10);

    let text = "🏆 *LEADERBOARD TOP 10*\n\n";
    const mentions = [];

    top.forEach((u, i) => {
      const rank = i + 1;
      const tag = `@${u.jid.split("@")[0]}`;
      mentions.push(u.jid);

      text +=
        `${rank}. ${tag} ${u.premium ? "👑" : ""}\n` +
        `   ⭐ Level  : ${u.level}\n` +
        `   ✨ Exp    : ${u.exp}\n` +
        `   💰 Credit : ${u.credit}\n` +
        `   🎟️ Limit  : ${u.limit}\n\n`;
    });

    await sock.sendMessage(
      m.chat,
      {
        text,
        mentions,
      },
      { quoted: m },
    );
  },
};
