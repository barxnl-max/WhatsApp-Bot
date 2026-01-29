# 🤖 WhatsApp Bot — Baileys Multi-Device

> 🚀 Powerful, fast, and fully modular **WhatsApp Bot** built with **Node.js (CommonJS)** and **Baileys Multi-Device**.  
> Designed for stability, scalability, and easy customization using a **plugin-based system**.

![Node.js](https://img.shields.io/badge/node-%3E%3D20-green)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Baileys](https://img.shields.io/badge/Baileys-Multi--Device-purple)

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

- **Node.js ≥ 20**
- **Baileys (WhatsApp Multi-Device)**
- **CommonJS (CJS)**
- Express
- FFmpeg
- Sharp / Jimp

---

## 📂 Project Structure
```bash
WhatsApp-Bot/
├── plugins/            # All bot features (commands)
├── lib/                # Core libraries (database, helper)
├── session/            # WhatsApp session (ignored by git)
├── index.js            # Main entry
├── package.json
└── README.md```md


## 🚀 Installation

### 1️⃣ Clone Repository

git clone https://github.com/barxnl-max/WhatsApp-Bot.git
cd WhatsApp-Bot
npm install
npm start 


## 🧩 Plugin Template

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
  async handler({
    m,
    isGroup
  }) {

    // group check (because group: true)
    if (!isGroup) {
      return m.reply("❌ This command can only be used in groups")
    }

    // simple response
    await m.reply("👋 Hello, I am a WhatsApp Bot 🤖")
  }
}
