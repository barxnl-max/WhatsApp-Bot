const { getUser, buyLimit } = require("../lib/dbuser");

const PRICE_PER_LIMIT = 1500;

module.exports = {
  name: "buylimit",
  command: ["buylimit"],
  tags: ["user"],
  usedCmd: ["buylimit <angka>"],
  limit: false,

  async handler({ m, senderId, args, isOwner }) {
    const user = getUser(senderId);

    const amount = Math.max(parseInt(args[0]) || 1, 1);
    const totalPrice = amount * PRICE_PER_LIMIT;

    if (!isOwner && user.credit < totalPrice) {
      return m.reply(
        `❌ *Credit tidak cukup*\n\n` +
          `💰 Credit kamu : ${user.credit}\n` +
          `🛒 Harga       : ${PRICE_PER_LIMIT} / limit\n` +
          `📦 Total bayar : ${totalPrice}`,
      );
    }

    // owner gratis (opsional)
    if (!isOwner) {
      const ok = buyLimit(user, amount);
      if (!ok) return m.reply("❌ Gagal membeli limit");
    } else {
      user.limit.daily += amount;
    }

    return m.reply(
      `✅ *BERHASIL BELI LIMIT*\n\n` +
        `📦 Jumlah   : ${amount}\n` +
        `💸 Biaya    : ${isOwner ? 0 : totalPrice} credit\n` +
        `🎟️ Limit    : ${user.limit.daily}`,
    );
  },
};
