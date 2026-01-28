const fetch = require("node-fetch");
const xvideos = require("../lib/xvideos");

if (!global.REPLY_SESSIONS) global.REPLY_SESSIONS = new Map();

module.exports = {
  name: "xvideos",
  command: ["xvideos", "xvsearch"],
  usedCmd: "xvideos <query / url>",
  tags: ["nsfw"],
  nsfw: true,
  private: true,
  premium: true,

  async handler({ m, args, prefix, sock }) {
    const text = args.join(" ").trim();

    if (!text) {
      return m.reply(
        `❌ Masukkan kata kunci atau URL

📌 Contoh:
${prefix}xvideos japanese
${prefix}xvideos https://www.xvideos.com/video123`,
      );
    }

    // ===============================
    // 🔗 DIRECT URL
    // ===============================
    if (/xvideos\.com\/video/i.test(text)) {
      await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      try {
        const dl = await xvideos.download(text);
        const videoUrl = dl?.videos?.high || dl?.videos?.low || dl?.videos?.HLS;

        if (!videoUrl) throw "No video url";

        const title = dl.title || "Xvideos Video";
        const duration = dl.duration || "-";
        const artist = dl.artist || "Unknown";

        let asDoc = false;
        try {
          const head = await fetch(videoUrl, { method: "HEAD" });
          const len = head.headers.get("content-length");
          if (len && Number(len) > 100 * 1024 * 1024) asDoc = true;
        } catch {}

        const caption = `🎬 *Judul* : ${title}
⏱️ *Durasi* : ${duration}
🎭 *Artist* : ${artist}
🌐 *Source* : Xvideos

🍿 Selamat menonton~ 😋`;

        if (asDoc) {
          await sock.sendMessage(
            m.chat,
            {
              document: { url: videoUrl },
              mimetype: "video/mp4",
              fileName: `${title}.mp4`,
              caption,
            },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            m.chat,
            {
              video: { url: videoUrl },
              caption,
            },
            { quoted: m },
          );
        }

        await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      } catch (e) {
        console.error("XVIDEOS URL ERROR:", e);
        await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ Gagal download video");
      }
      return;
    }

    // ===============================
    // 🔍 SEARCH MODE
    // ===============================
    const res = await xvideos.search(text);
    if (!res?.length) return m.reply("❌ Tidak ada hasil");

    const list = res.slice(0, 10);

    let msg =
      `🔎 *Hasil Pencarian Xvideos*\n\n` +
      list
        .map(
          (v, i) =>
            `*${i + 1}.* ${v.title}
⏱ ${v.duration} | 📺 ${v.resolution}`,
        )
        .join("\n\n");

    msg += `\n\n📥 *Reply pesan ini dengan:*
getvideo
getvideo 1
getvideo 1 2
getvideo all`;

    const sent = await m.reply(msg);

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "xvideos",
      msgId: sent.key.id,
      data: list,
      expire: Date.now() + 2 * 60 * 1000,
    });
  },

  // ===============================
  // 🔁 ON REPLY (FIXED)
  // ===============================
  async onReply({ m, sock, session }) {
    if (!session || session.plugin !== "xvideos") return;
    if (!m.text) return;

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply("⏳ Sesi habis, silakan cari ulang");
    }

    if (!m.quoted || m.quoted.key.id !== session.msgId) return;

    const text = m.text.trim().toLowerCase();
    if (!text.startsWith("getvideo")) return;

    const arg = text.replace("getvideo", "").trim();
    let indexes = [];

    if (!arg) {
      indexes = [0];
    } else if (arg === "all") {
      indexes = session.data.map((_, i) => i);
    } else {
      indexes = arg
        .split(/\s+/)
        .filter((v) => /^\d+$/.test(v))
        .map((v) => Number(v) - 1);
    }

    if (!indexes.length) return m.reply("❌ Format salah");

    await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    for (const i of indexes) {
      const item = session.data[i];
      if (!item) continue;

      try {
        const dl = await xvideos.download(item.link);
        const videoUrl = dl?.videos?.high || dl?.videos?.low || dl?.videos?.HLS;

        if (!videoUrl) continue;

        let asDoc = false;
        try {
          const head = await fetch(videoUrl, { method: "HEAD" });
          const len = head.headers.get("content-length");
          if (len && Number(len) > 100 * 1024 * 1024) asDoc = true;
        } catch {}

        const caption = `🎬 *Judul* : ${item.title}
⏱️ *Durasi* : ${item.duration || "-"}
🎭 *Artist* : ${item.artist || "Unknown"}
🌐 *Source* : Xvideos

🔥 Enjoy~ 😈`;

        if (asDoc) {
          await sock.sendMessage(
            m.chat,
            {
              document: { url: videoUrl },
              mimetype: "video/mp4",
              fileName: `${item.title}.mp4`,
              caption,
            },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            m.chat,
            {
              video: { url: videoUrl },
              caption,
            },
            { quoted: m },
          );
        }
      } catch (e) {
        console.error("XVIDEOS GETVIDEO ERROR:", e);
      }
    }

    await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    global.REPLY_SESSIONS.delete(m.sender);
  },
};
