require("./settings");
require("./server");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const PhoneNumber = require('awesome-phonenumber')
const gradient = require("gradient-string");
const readline = require("readline");
const NodeCache = require("node-cache");
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  delay,
  jidDecode
} = require("@whiskeysockets/baileys");

const SESSION_DIR = path.join(process.cwd(), "session");
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, {
  recursive: true
});

global.botname = "Lydia AI";
global.author = "Barxnl (Akbar)";
global.instagram = "@barxnl250_";

function cls() {
  process.stdout.write("\x1Bc");
}

function padRight(str, len) {
  return str + " ".repeat(Math.max(0, len - str.length));
}

function kaliLogo() {
  return [chalk.cyanBright("██████╗ ██████╗ ████████╗"), chalk.cyanBright("██╔══██╗██╔═══██╗╚══██╔══╝"), chalk.blueBright("██████╔╝██║   ██║   ██║"), chalk.blueBright("██╔══██╗██║   ██║   ██║"), chalk.magentaBright("██████╔╝╚██████╔╝   ██║"), chalk.magentaBright("╚═════╝  ╚═════╝    ╚═╝"), chalk.gray("  WHATSAPP BOT ENGINE")];
}

function neofetch(info = {}) {
  cls();
  const logo = kaliLogo();
  const keys = Object.keys(info);
  const maxKey = Math.max(...keys.map(v => v.length));
  const GAP = 46;
  for (let i = 0; i < Math.max(logo.length, keys.length); i++) {
    const left = logo[i] || "";
    let right = "";
    if (keys[i]) {
      const key = padRight(keys[i], maxKey);
      right = chalk.greenBright(key) + chalk.gray(" : ") + chalk.whiteBright(info[keys[i]]);
    }
    console.log(padRight(left, GAP) + right);
  }
  console.log("");
}

const rl = process.stdin.isTTY ? readline.createInterface({
  input: process.stdin,
  output: process.stdout
}) : null;
const question = q => rl ? new Promise(res => rl.question(chalk.green(q), ans => res(ans))) : Promise.reject("NO_TTY");

async function pairingPrompt() {
  neofetch({
    BOT: global.botname,
    MODE: "PAIRING",
    FORMAT: "628xxxxxxxxx"
  });
  return await question("Number > ");
}

async function startSock() {
  neofetch({
    BOT: global.botname,
    STATUS: "INITIALIZING",
    AUTHOR: global.author,
    IG: global.instagram
  });

  const {
    version
  } = await fetchLatestBaileysVersion();
  const {
    state,
    saveCreds
  } = await useMultiFileAuthState(SESSION_DIR);
  const msgRetryCounterCache = new NodeCache();

  const sock = makeWASocket({
    version,
    logger: pino({
      level: "silent"
    }),
    printQRInTerminal: false,
    browser: ["MacOS", "Safari", "16.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({
        level: "silent"
      }))
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
    msgRetryCounterCache,
    getMessage: async () => ""
  });

  sock.ev.on("creds.update", saveCreds);

  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (jid.includes(':')) {
      const decoded = jidDecode(jid)
      if (decoded?.user && decoded?.server) {
        return decoded.user + '@' + decoded.server
      }
    }
    return jid
  }

  sock.ev.on("contacts.update", updates => {
    if (!store?.contacts) return
    for (const contact of updates) {
      const id = sock.decodeJid(contact.id)
      if (!id) continue
      store.contacts[id] = {
        ...(store.contacts[id] || {}),
        id,
        name: contact.notify || store.contacts[id]?.name || ""
      }
    }
  })

  sock.getName = async (jid, withoutContact = false) => {
    const id = sock.decodeJid(jid)
    withoutContact = sock.withoutContact || withoutContact
    if (!id) return ""
    if (id.endsWith("@g.us")) {
      const group = store.contacts[id] || await sock.groupMetadata(id).catch(() => ({}))
      return group.subject || group.name || "Group"
    }
    if (id === "0@s.whatsapp.net") return "WhatsApp"
    if (id === sock.decodeJid(sock.user?.id)) {
      return sock.user?.name || sock.user?.verifiedName || "Me"
    }
    const contact = store.contacts[id] || {}
    return (
      (!withoutContact && contact.name) ||
      contact.verifiedName ||
      PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international")
    )
  }

  sock.serializeM = m => smsg(sock, m, store);

  sock.ev.on("connection.update", async update => {
    const {
      connection,
      lastDisconnect
    } = update;
    if (connection === "connecting") {
      neofetch({
        BOT: global.botname,
        STATUS: "CONNECTING",
        TARGET: "WhatsApp Server"
      });
    }
    if (connection === "open") {
      global.sock = sock;
      neofetch({
        BOT: chalk.cyanBright(global.botname),
        STATUS: chalk.greenBright("CONNECTED"),
        AUTH: chalk.yellowBright(sock.authState.creds.registered ? "SESSION" : "PAIRING"),
        USER: chalk.whiteBright(sock.user?.id?.split(":")[0] || "-"),
        DEVICE: chalk.magentaBright("Linux Server"),
        TIME: chalk.gray(new Date().toLocaleString())
      });
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      neofetch({
        BOT: global.botname,
        STATUS: "DISCONNECTED",
        CODE: code || "UNKNOWN"
      });
      if (code !== DisconnectReason.loggedOut) {
        await delay(5000);
        process.exit(1);
      }
    }
  });

  if (!sock.authState.creds.registered) {
    const input = await pairingPrompt();
    const number = input.replace(/[^0-9]/g, "");
    neofetch({
      BOT: global.botname,
      ACTION: "REQUEST PAIRING",
      NUMBER: number
    });
    setTimeout(async () => {
      const code = await sock.requestPairingCode(number);
      neofetch({
        BOT: global.botname,
        PAIRING_CODE: code.match(/.{1,4}/g).join("-"),
        INFO: "Linked Devices"
      });
    }, 3000);
  }

  return sock;
}

const store = require("./lib/lightweight_store");
const {
  smsg
} = require("./lib/myfunc");
const {
  handleMessages,
  handleGroupParticipantUpdate
} = require("./main");
const simple = require("./lib/simple");

store.readFromFile();
setInterval(() => store.writeToFile(), 10000);
global.store = store;
global.plugins = [];

function loadPlugins() {
  const dir = path.join(__dirname, "plugins");
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
  for (const file of files) {
    try {
      global.plugins.push(require(path.join(dir, file)));
    } catch {}
  }
}
loadPlugins();

let statistics = {
  messages: 0,
  groups: 0,
  calls: 0,
  startTime: Date.now()
};

// Fungsi ini masih ada, tapi tidak dipanggil berkala
function runtimeNeofetch() {
  const uptime = Math.floor((Date.now() - statistics.startTime) / 1000);
  neofetch({
    BOT: global.botname,
    STATUS: "RUNNING",
    MESSAGES: statistics.messages,
    GROUPS: statistics.groups,
    CALLS: statistics.calls,
    UPTIME: `${uptime}s`,
    TIME: new Date().toLocaleString()
  });
}

async function bindEvents(sock) {
  simple(sock);
  store.bind(sock.ev);

  sock.ev.on("messages.upsert", async chatUpdate => {
    try {
      const msg = chatUpdate.messages?.[0];
      if (!msg?.message) return;
      if (msg.key.remoteJid === "status@broadcast") return;
      if (msg.message?.ephemeralMessage) {
        msg.message = msg.message.ephemeralMessage.message;
      }
      statistics.messages++;
      const m = sock.serializeM(msg);
      await handleMessages(sock, chatUpdate);
      for (const p of global.plugins) {
        if (typeof p.onMessage === "function") {
          await p.onMessage({
            sock,
            m
          });
        }
      }
    } catch {}
  });

  sock.ev.on("group-participants.update", async update => {
    statistics.groups++;
    await handleGroupParticipantUpdate(sock, update);
    for (const p of global.plugins) {
      if (typeof p.onGroup === "function") {
        await p.onGroup({
          sock,
          update
        });
      }
    }
  });

  sock.ev.on("call", async calls => {
    for (const call of calls) {
      statistics.calls++;
      for (const p of global.plugins) {
        if (typeof p.onCall === "function") {
          await p.onCall({
            sock,
            call
          });
        }
      }
    }
  });
}

async function startRuntime() {
  const sock = await startSock();
  await bindEvents(sock);

  // 🔇 INTERVAL NEOFETCH DIHAPUS AGAR KONSOL TIDAK "RESET" TERUS
  // Jika di kemudian hari ingin mengaktifkan kembali, tinggal uncomment baris di bawah.
  // setInterval(() => {
  //   runtimeNeofetch();
  // }, 60000);
}

startRuntime();
