const CookpadScraper = require("../lib/scraper/cookpad");
const scraper = new CookpadScraper();

if (!global.REPLY_SESSIONS) global.REPLY_SESSIONS = new Map();

module.exports = {
  name: "resepmasakan",
  command: ["resepmasakan", "cookpad"],
  tags: ["search"],
  premium: false,
  usedCmd: ["resepmasakan <query>"],

  async handler({ m, sock, args, prefix }) {
    const query = args.join(" ").trim();
    if (!query) {
      return m.reply(
        `🍳 *Pencarian Resep Masakan*

${prefix}resepmasakan <nama masakan>

Contoh: ${prefix}resepmasakan nasi goreng

📥 *Ambil detail resep:*
Reply hasil pencarian dengan:
getresep 1
getresep 2 3 5`,
      );
    }

    await sock.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

    const result = await scraper.search(query, 1);
    if (!result.status || result.total === 0) {
      await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ Resep tidak ditemukan");
    }

    const list = result.data;

    let msg = `🍲 *Hasil Pencarian: ${query}*\n\n`;
    list.forEach((item, i) => {
      msg += `*${i + 1}.* ${item.title}\n🔗 ${item.link}\n`;
      if (item.image) msg += `🖼️ ${item.image}\n`;
      msg += "\n";
    });

    msg += `📥 *Reply pesan ini dengan:*
getresep 1
getresep 2 4 7`;

    const sent = await m.reply(msg);

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "resepmasakan",
      msgId: sent.key.id,
      data: list,
      expire: Date.now() + 5 * 60 * 1000, // 5 menit
    });
  },

  async onReply({ m, sock, session }) {
    if (!session || session.plugin !== "resepmasakan") return;
    if (!m.text) return;

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply("⏳ Sesi habis, silakan cari ulang");
    }

    if (!m.quoted || m.quoted.key.id !== session.msgId) return;

    const text = m.text.trim().toLowerCase();
    if (!text.startsWith("getresep")) return;

    const nums = text
      .replace("getresep", "")
      .trim()
      .split(/\s+/)
      .filter((v) => /^\d+$/.test(v))
      .map((v) => Number(v) - 1);

    const indexes = nums.length ? nums : [0];

    for (const i of indexes) {
      const item = session.data[i];
      if (!item) continue;

      await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      try {
        const detail = await scraper.getRecipe(item.link);
        if (!detail.status) {
          await m.reply(`❌ Gagal mengambil detail resep: ${item.title}`);
          continue;
        }

        let caption = `*${detail.title}*\n\n`;
        if (detail.servings) caption += `🍽️ Porsi: ${detail.servings}\n`;
        if (detail.totalTime) caption += `⏱️ Waktu: ${detail.totalTime}\n\n`;

        caption += `*Bahan-bahan:*\n`;
        detail.ingredients.forEach((b, idx) => {
          caption += `${idx + 1}. ${b}\n`;
        });

        caption += `\n*Langkah-langkah:*\n`;
        detail.steps.forEach((s, idx) => {
          caption += `${idx + 1}. ${s}\n`;
        });

        caption += `\n🔗 ${item.link}`;

        if (detail.image) {
          await sock.sendMessage(
            m.chat,
            {
              image: { url: detail.image },
              caption,
            },
            { quoted: m },
          );
        } else {
          await m.reply(caption);
        }
      } catch (e) {
        console.error("getresep error:", e);
        await m.reply("❌ Terjadi kesalahan saat mengambil resep");
      }
    }

    await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    global.REPLY_SESSIONS.delete(m.sender);
  },
};