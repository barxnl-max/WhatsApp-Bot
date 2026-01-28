require("./settings");
require("./server");
const {
  Boom
} = require("@hapi/boom");
const fs = require("fs");
const chalk = require("chalk");
const gradient = require("gradient-string");
const path = require("path");
const readline = require("readline");
const PhoneNumber = require("awesome-phonenumber");
const NodeCache = require("node-cache");
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  delay
} = require("@whiskeysockets/baileys");
const {
  handleMessages,
  handleGroupParticipantUpdate,
  handleStatus
} = require("./main");
const {
  smsg
} = require("./lib/myfunc");
const store = require("./lib/lightweight_store");
const simple = require("./lib/simple");
const WIDTH = 56;
const top = chalk.gray("┌" + "─".repeat(WIDTH) + "┐");
const bottom = chalk.gray("└" + "─".repeat(WIDTH) + "┘");
const side = chalk.gray("│");
function ui(lines, color = "white") {
  console.log(top);
  for (const line of lines) {
    console.log(`${side} ${chalk[color](line).padEnd(WIDTH - 1)}${side}`);
  }
  console.log(bottom);
}
store.readFromFile();
const settings = require("./settings");
setInterval(() => {
  store.writeToFile();
}, settings.storeWriteInterval || 10000);
global.botname = "CATA BOT";
global.themeemoji = "•";
const owner = JSON.parse(fs.readFileSync("./data/owner.json"));
let phoneNumber = "6282198571732";
const pairingCode = !!phoneNumber;
const rl = process.stdin.isTTY ? readline.createInterface({
  input: process.stdin,
  output: process.stdout
}) : null;
const question = text => rl ? new Promise(resolve => rl.question(text, resolve)) : Promise.resolve(phoneNumber);
async function startsock() {
  let sock;
  try {
    const {
      version
    } = await fetchLatestBaileysVersion();
    const {
      state,
      saveCreds
    } = await useMultiFileAuthState("./session");
    const msgRetryCounterCache = new NodeCache();
    sock = makeWASocket({
      version,
      logger: pino({
        level: "silent"
      }),
      printQRInTerminal: false,
      browser: ["Mac OS", "Safari", "16.0"],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({
          level: "silent"
        }))
      },
      markOnlineOnConnect: true,
      syncFullHistory: false,
      msgRetryCounterCache,
      getMessage: async key => {
        const jid = jidNormalizedUser(key.remoteJid);
        const msg = await store.loadMessage(jid, key.id);
        return msg?.message || "";
      }
    });
    simple(sock);
    sock.ev.on("creds.update", saveCreds);
    store.bind(sock.ev);
    global.store = store;
    sock.ev.on("messages.upsert", async chatUpdate => {
      try {
        const msg = chatUpdate.messages?.[0];
        if (!msg?.message) return;
        if (msg.key.remoteJid === "status@broadcast") {
          await handleStatus(sock, chatUpdate);
          return;
        }
        if (msg.message?.ephemeralMessage) {
          msg.message = msg.message.ephemeralMessage.message;
        }
        sock.serializeM = m => smsg(sock, m, store);
        await handleMessages(sock, chatUpdate, true);
      } catch (err) {
        console.error("messages.upsert error:", err);
      }
    });
    sock.decodeJid = jid => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return decode.user && decode.server ? decode.user + "@" + decode.server : jid;
      }
      return jid;
    };
    sock.getName = (jid, withoutContact = false) => {
      jid = sock.decodeJid(jid);
      let v;
      if (jid.endsWith("@g.us")) {
        return "Group";
      }
      v = jid === sock.decodeJid(sock.user?.id) ? sock.user : store.contacts[jid] || {};
      return (withoutContact ? "" : v.name) || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
    };
    sock.public = true;
    sock.ev.on("connection.update", async update => {
      const {
        connection,
        lastDisconnect,
        qr
      } = update;
      if (connection === "connecting") {
        ui(["🔄 CONNECTING", "Please wait..."], "cyan");
      }
      if (connection === "open") {
        console.clear();
        console.log(gradient.mind(`[ ${global.botname} ]`));
        ui(["🤖 Status   : CONNECTED", `👤 User     : ${sock.user?.name || "Unknown"}`, `📞 Number   : ${sock.user?.id.split(":")[0]}`, `⏰ Time     : ${new Date().toLocaleString()}`, "", `📲 Owner    : ${owner}`, "💳 Credit   : BARXNL"], "green");
        try {
          const jid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
          await sock.sendMessage(jid, {
            text: `✅ BOT CONNECTED\n\n${global.botname}`
          });
        } catch {}
      }
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = code !== DisconnectReason.loggedOut;
        ui(["❌ CONNECTION CLOSED", `Reason : ${code || "Unknown"}`], "red");
        if (code === DisconnectReason.loggedOut || code === 401) {
          fs.rmSync("./session", {
            recursive: true,
            force: true
          });
          console.log(chalk.yellow("🗑️ Session cleared"));
        }
        if (shouldReconnect) {
          console.log(chalk.yellow("🔁 Reconnecting in 5 seconds..."));
          await delay(5000);
          startsock();
        }
      }
    });
    if (pairingCode && !sock.authState.creds.registered) {
      const input = await question(chalk.bgBlack(chalk.greenBright("Masukkan nomor WhatsApp\nFormat: 628xxxx : ")));
      const number = input.replace(/[^0-9]/g, "");
      if (!number) process.exit(1);
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(number);
          console.log(chalk.black(chalk.bgGreen("PAIRING CODE :")), chalk.white(code.match(/.{1,4}/g).join("-")));
        } catch (e) {
          console.error("PAIRING ERROR:", e);
        }
      }, 3000);
    }
    sock.ev.on("group-participants.update", async update => {
      await handleGroupParticipantUpdate(sock, update);
    });
    return sock;
  } catch (err) {
    console.error("STARTSOCK ERROR:", err);
    await delay(5000);
    process.exit(1);
  }
}
startsock();
