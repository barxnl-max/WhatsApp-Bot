<p align="center">
  <img 
    src="https://raw.githubusercontent.com/barxnl-max/WhatsApp-Bot/main/assets/giphy.gif"
    alt="WhatsApp Bot Banner"
    width="40%"
  />
</p>

<h2 align="center">🤖 WhatsApp Bot — Baileys Multi-Device</h2>

<p align="center">
  <i>Fast, modular, and powerful WhatsApp bot built with Baileys Multi-Device</i>
</p>

<p align="center">
  👤 <b>Author:</b> <a href="https://github.com/barxnl-max">Akbar</a> &nbsp;•&nbsp;
  📸 <b>Instagram:</b> <a href="https://instagram.com/barxnl250_">@barxnl250_</a> &nbsp;•&nbsp;
  👥 <b>WhatsApp Group:</b> <a href="https://chat.whatsapp.com/FpaS5cApRWr7t5jxg4N96h">Join</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D20-green?style=flat-square" />
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Baileys-Multi--Device-purple?style=flat-square" />
</p>

---

## ✨ Features

- 📥 YouTube & Media Downloader
- 🖼️ Sticker Maker (Image / Video / GIF)
- 🎵 Music Search & Download
- 👥 Group Management (anti-spam, welcome, admin tools)
- 🔎 Web Scraping & Search
- ⚡ Fast & Lightweight
- 🔐 Secure Multi-Device Session
- 🧩 Modular Plugin System
- 💾 Built-in User Database (EXP, Level, Credit, Limit)

---

## 📦 Tech Stack

- **Node.js ≥ 24**
- **Baileys (WhatsApp Multi-Device)**
- **CommonJS (CJS)**
- Express
- FFmpeg
- Sharp / Jimp

---

## 📂 Project Structure

```bash
WhatsApp-Bot/
├── plugins/          # All bot features (commands)
├── lib/              # Core libraries (database, helper)
├── data/             # Database
├── session/          # WhatsApp session (ignored by git)
├── index.js          # Main entry
├── main.js           # Main bot logic and handlers, including message processing, plugin loader, and permission checks.
├── package.json
└── README.md
```

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/barxnl-max/WhatsApp-Bot.git
cd WhatsApp-Bot
npm install
npm start
```

## 🧩 Plugin Template

```js
module.exports = {
  /* ============== META ============== */
  name: "exampleall",
  command: ["exampleall", "halo", "bot"],

  // permission flags
  group: true,        // group only
  admin: false,       // admin not required
  botAdmin: false,    // bot admin not required
  owner: false,       // owner not required
  premium: false,     // premium not required
  nsfw: false,        // non-NSFW
  private: false,     // usable in group & private
  limit: false,       // no limit usage

  tags: ["example", "group", "misc"],
  usedCmd: ["exampleall"],

  /* ============== HANDLER ============== */
  async handler({ m, isGroup }) {
    if (!isGroup) {
      return m.reply("❌ This command can only be used in groups")
    }

    await m.reply("👋 Hello, I am a WhatsApp Bot 🤖")
  }
}
```

## 📊 Permission Flags

| Flag | Description |
|------|------------|
| group | Group only |
| admin | Group admin |
| botAdmin | Bot must be admin |
| owner | Bot owner only |
| premium | Premium user |
| nsfw | 18+ content |
| limit | Daily limit |


## 📄 License

MIT License

## ⚠️ Disclaimer

This project is for educational purposes only.
