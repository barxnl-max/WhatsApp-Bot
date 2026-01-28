const { getUser, isPremiumUser } = require("../lib/dbuser");

module.exports = {
  name: "limit",
  command: ["limit"],
  tags: ["user"],

  async handler({ m, isOwner }) {
    const user = getUser(m.sender);

    // ✅ FIX: param ke-2 adalah isOwner (boolean)
    const isPremium = isPremiumUser(user, isOwner);

    const userName =
      m.pushName && m.pushName.trim()
        ? m.pushName
        : m.sender.split("@")[0];

    const level = user.level ?? 0;
    const credit = user.credit ?? 0;
    const dailyLimit = user.limit?.daily ?? 0;

    await m.reply(
      `🎟️ *LIMIT HARIAN*\n\n` +
      `👤 User       : ${userName}\n` +
      `⭐ Level      : ${level}\n` +
      `💰 Credit     : ${credit}\n\n` +
      `🎫 Sisa Limit : ${isPremium ? "∞" : dailyLimit}\n` +
      `👑 Premium    : ${isPremium ? "Ya" : "Tidak"}`
    );
  },
};