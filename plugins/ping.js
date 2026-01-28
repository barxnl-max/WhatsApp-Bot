const os = require("os");
const process = require("process");
const settings = require("../settings");

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [d && `${d} hari`, h && `${h} jam`, m && `${m} menit`, `${s} detik`]
    .filter(Boolean)
    .join(", ");
}

function formatBytes(bytes) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (!bytes) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

module.exports = {
  name: "ping",
  command: ["ping", "p", "status"],
  usedCmd: "ping",
  tags: ["main"],
  owner: false,
  admin: false,
  premium: false,
  group: false,
  private: false,

  async handler({ m }) {
    try {
      const start = Date.now();
      await m.reply("🏓 Pong...");
      const latency = Math.round((Date.now() - start) / 2);

      const uptime = formatUptime(process.uptime());

      const totalRam = os.totalmem();
      const freeRam = os.freemem();
      const usedRam = totalRam - freeRam;

      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model || "Unknown";
      const cpuCore = cpus.length;
      const cpuSpeed = cpus[0]?.speed || 0;
      const loadAvg = os
        .loadavg()
        .map((v) => v.toFixed(2))
        .join(" | ");

      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;

      const botName = global.botname || "WhatsApp Bot";

      const text = `
╭─〔 🤖 BOT STATUS 〕
│
│ 📡 Ping      : ${latency} ms
│ ⏱️ Uptime    : ${uptime}
│
│ 🧠 CPU
│ • Model      : ${cpuModel}
│ • Core       : ${cpuCore}
│ • Speed      : ${cpuSpeed} MHz
│ • Load Avg   : ${loadAvg}
│
│ 💾 Memory
│ • Used       : ${formatBytes(usedRam)}
│ • Free       : ${formatBytes(freeRam)}
│ • Total      : ${formatBytes(totalRam)}
│
│ 🖥️ System
│ • OS         : ${platform} (${arch})
│ • Node.js    : ${nodeVersion}
│
│ 🔖 Bot
│ • Name       : ${botName}
│ • Version    : v${settings.version}
│
╰──────────────
`.trim();

      await m.reply(text);
    } catch (err) {
      console.error("[PING ERROR]", err);
      await m.reply("❌ Gagal mengambil status bot.");
    }
  },
};
