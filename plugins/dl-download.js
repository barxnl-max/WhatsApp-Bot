const snapsave = require("../lib/snapsave");
const { tiktokDownload } = require("../lib/scraper/TikTok");
const ytmp3 = require("../lib/ytmp3");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  name: "download",

  command: ["download", "dl"],
  usedCmd: ["download <url>"],

  tags: ["downloader"],

  owner: false,
  admin: false,
  premium: false,
  group: false,
  private: false,

  desc: {
    title: "Universal Downloader",
    description:
      "Download media dari berbagai platform menggunakan satu command.",
    usage: "#download <url>",
    example:
      "#download https://vt.tiktok.com/xxxx\n" +
      "#download https://www.instagram.com/p/xxxx\n" +
      "#download https://youtube.com/watch?v=xxxx",
    support: "TikTok, Instagram, Facebook, YouTube (MP3)",
    note: "Cukup kirim link, bot otomatis menyesuaikan platform.",
  },

  async handler({ sock, m, chatId, args }) {
    const url = args.find((v) => /^https?:\/\//i.test(v));
    if (!url) return m.reply("❌ Masukkan link");

    await sock.sendMessage(chatId, {
      react: { text: "⏳", key: m.key },
    });

    if (/tiktok\.com|vt\.tiktok\.com/i.test(url)) {
      const data = await tiktokDownload(url);
      if (!data) return m.reply("❌ Gagal mengambil TikTok");

      if (data.type === "slide" && Array.isArray(data.images)) {
        for (const img of data.images) {
          await sock.sendMessage(
            chatId,
            { image: { url: img } },
            { quoted: m },
          );
          await delay(1200);
        }

        if (data.music) {
          await sock.sendMessage(
            chatId,
            { audio: { url: data.music }, mimetype: "audio/mpeg" },
            { quoted: m },
          );
        }
        return;
      }

      if (data.type === "video") {
        if (data.no_wm) {
          await sock.sendMessage(
            chatId,
            {
              video: { url: data.no_wm },
              caption: data.title || "TikTok",
            },
            { quoted: m },
          );
        }

        if (data.music) {
          await sock.sendMessage(
            chatId,
            { audio: { url: data.music }, mimetype: "audio/mpeg" },
            { quoted: m },
          );
        }
        return;
      }
    }

    if (/instagram\.com|facebook\.com|fb\.watch/i.test(url)) {
      const res = await snapsave(url);
      if (!res?.success) return m.reply("❌ Gagal download");

      for (const media of res.data.media) {
        if (media.type === "video") {
          await sock.sendMessage(
            chatId,
            { video: { url: media.url } },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            chatId,
            { image: { url: media.url } },
            { quoted: m },
          );
        }
        await delay(1200);
      }
      return;
    }

    if (/youtube\.com|youtu\.be/i.test(url)) {
      const res = await ytmp3(url);
      if (!res?.status) return m.reply("❌ Gagal download audio");

      await sock.sendMessage(
        chatId,
        {
          audio: res.buffer,
          mimetype: "audio/mpeg",
          fileName: `${res.title}.mp3`,
        },
        { quoted: m },
      );
      return;
    }

    return m.reply("❌ Link tidak didukung");
  },
};
