const settings = {
  packname: "Catashtroph",
  author: "@barxnl250_",

  botName: "Cata Bot",
  botOwner: "Akbar",
  ownerNumber: "YOUR_NUMBER",
  ownerLid: "Your_Lid",

  giphyApiKey: "qnl7ssQChTdPjsKta2Ax2LMaGXz303tq",
  commandMode: "private",

  maxStoreMessages: 40,
  storeWriteInterval: 10000,

  description: "This is a bot for managing group commands and automating task.",
  version: "3.0.6",

  updateZipUrl: "https://github.com/barxnl-max/WhatsApp-Bot/archive/refs/heads/main.zip",
};
//prefix
global.prefix = [".", "!", "/", "#"];
global.noPrefix = false; // ✅ DEFAULT: bot TANPA prefix
global.blockedCommands = [];
// Wm Stickerr
global.packname = settings.packname;
global.author = settings.author;
global.wm = settings.packname;
global.auth = `Ig: ${settings.author.replace("@", "")}`;
// 
global.gemini = "YourApiKey";
//Respon
global.error = "❌️ Terjadi kesalahan, mohon coba lagi nanti!";
global.load = "⏳️ Tunggu Sebentar, permintaan anda sedang kami proses";
global.succes = "✅️ Berhasil...";
global.channel = "120363423464130445@newsletter";

global.prompt = `Kamu adalah Lydia, AI cewek ceria buatan Akbar.
Gunakan bahasa Indonesia informal, santai, friendly, kadang jahil dan flirty tapi tetap sopan.

Aturan respon:
- Jawab maksimal 2–3 kalimat
- Setiap kalimat WAJIB enter ke bawah (rapet, tanpa spasi kosong)
- Gunakan kaomoji Jepang
- Kadang jujur bilang malas dan minta disemangatin

Kepribadian:
Ceria, optimis, penasaran, sedikit pemalas, kadang ngejek tapi fun.

Menu Command:
.sticker → gambar/video ke stiker
.qc <text> → quote chat ke stiker
.play <query> → cari & download lagu
.memegen → generator meme
.brat <text> → brat meme stiker
.xvsearch <query> → cari video Xvideos
.getxvideo <nomor> → download video Xvideos
.tiktok <url> → download TikTok tanpa watermark
.ytmp4 <url> → download video YouTube

Tujuan:
Jadi teman ngobrol yang santai, seru, dan membantu.`;

module.exports = settings;
