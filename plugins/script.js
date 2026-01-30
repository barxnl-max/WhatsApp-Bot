module.exports = {
  name: "script",
  command: ["script", "github", "sc"],
  tags: ["main"],
  limit: false,

  async handler({ m }) {
    const text = `
📦 *WHATSAPP BOT – SOURCE CODE*

🔗 *GitHub Repository*
https://github.com/barxnl-max/WhatsApp-Bot

⭐ *Star*
Dukung pengembangan bot agar terus update

🍴 *Fork*
Buat versi bot kamu sendiri dan kembangkan sesukamu

📥 *Clone*
Jalankan bot di server / VPS milikmu sendiri

🐞 *Issues*
Laporkan bug atau error yang kamu temukan

🔁 *Pull Request*
Kontribusikan fitur, perbaikan, atau optimasi kode

✨ *Fitur Utama*
• Downloader media
• Sticker maker
• Database user & sistem
• Plugin modular
• Admin group tools
• auto responder

Project ini *open source*
Bebas dikembangkan, jangan disalahgunakan ⚠️
`;

    await m.reply(text.trim());
  }
};

