const { tiktokDownload } = require("../lib/scraper/TikTok");

module.exports = {
  name: "tiktok2",

  command: ["tiktok", "tt"],
  usedCmd: ["tiktok"],

  tags: ["downloader"],

  premium: false,
  owner: false,
  admin: false,
  group: false,
  private: false,

  desc: {
    title: "TikTok Downloader",
    description: "Download video TikTok tanpa watermark atau ambil audionya.",
    usage: "#tiktok2 <url> [--wm | --audio]",
    example:
      "#tiktok2 https://vt.tiktok.com/xxxx\n#tiktok2 https://vt.tiktok.com/xxxx --audio",
    note: "--wm = video watermark\n--audio = audio saja",
  },

  async handler({ sock, m, chatId, args, usedPrefix, command }) {
    const prefix = usedPrefix || "#";
    const cmd = command || "tiktok2";

    const url = args.find((v) =>
      /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com)/i.test(v),
    );

    if (!url) {
      return m.reply(`❌ Contoh:\n${prefix}${cmd} https://tiktok.com/...`);
    }

    const isWM = args.includes("--wm");
    const isAudio = args.includes("--audio");

    await sock.sendMessage(chatId, {
      react: { text: "⏳", key: m.key },
    });

    const data = await tiktokDownload(url);
    if (!data) return m.reply("❌ Gagal mengambil data TikTok");

    const title = (data.title || "TikTok").slice(0, 60);

    if (isAudio) {
      if (!data.music) {
        return m.reply(
          `❌ Audio tidak ditemukan\n\nContoh:\n${prefix}${cmd} ${url} --audio`,
        );
      }

      return sock.sendFile(chatId, data.music, {
        quoted: m,
        fileName: `${title}.mp3`,
        mimetype: "audio/mpeg",
      });
    }

    const videoUrl = isWM ? data.wm : data.hd || data.no_wm;
    if (!videoUrl) return m.reply("❌ Video tidak tersedia");

    return sock.sendFile(chatId, videoUrl, {
      quoted: m,
      fileName: `${title}.mp4`,
      caption: `🎬 ${title}\n👤 ${data.author?.nickname || "-"}`,
    });
  },
};
