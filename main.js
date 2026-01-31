const fs = require("fs");
const path = require("path");
const TEMP_DIR = path.join(process.cwd(), "temp");
const TEMP_MAX_AGE = 3 * 60 * 60 * 1000;
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, {
    recursive: true
  });
}
process.env.TMPDIR = TEMP_DIR;
process.env.TMP = TEMP_DIR;
process.env.TEMP = TEMP_DIR;
setInterval(() => {
  fs.readdir(TEMP_DIR, (err, files) => {
    if (err || !Array.isArray(files)) return;
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      fs.stat(filePath, (err, stat) => {
        if (err) return;
        if (!stat.isFile()) return;
        if (now - stat.mtimeMs > TEMP_MAX_AGE) {
          fs.unlink(filePath, () => {});
        }
      });
    }
  });
}, TEMP_MAX_AGE);
const DB_PATH = path.join(__dirname, "data", "database.json");
global.db = {};
function loadDB() {
  try {
    global.db = JSON.parse(fs.readFileSync(DB_PATH));
  } catch {
    global.db = {};
  }
}
function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(global.db, null, 2));
}
loadDB();
setInterval(saveDB, 30_000);
process.on("exit", saveDB);
process.on("SIGINT", saveDB);
process.on("SIGTERM", saveDB);
const settings = require("./settings");
require("./config.js");
const {
  isSudo
} = require("./lib/index");
const isOwnerOrSudo = require("./lib/isOwner");
const isAdmin = require("./lib/isAdmin");
const {
  logCommand,
  logMessage
} = require("./lib/logger");
const { getGroup } = require("./lib/dbgroup")
const {
  storeMessage,
  handleMessageRevocation
} = require("./lib/antidelete");
const {
  addCommandReaction
} = require("./lib/reactions");
const {
  getUser,
  useLimit,
  addExp,
  addCredit,
  isPremiumUser
} = require("./lib/dbuser");
const evaluate = require("./lib/exec");
global.REPLY_SESSIONS = global.REPLY_SESSIONS || new Map();
global.packname = settings.packname;
global.author = settings.author;
global.stickerCmd = {};
try {
  global.stickerCmd = JSON.parse(fs.readFileSync("./data/stickercmd.json"));
} catch {
  global.stickerCmd = {};
}
const pluginFolder = path.join(__dirname, "plugins");
let plugins = [];
function loadPlugins() {
  for (const p of plugins) {
    if (typeof p.onUnload === "function") {
      try {
        p.onUnload();
      } catch {}
    }
  }
  plugins = [];
  if (!fs.existsSync(pluginFolder)) {
    fs.mkdirSync(pluginFolder, {
      recursive: true
    });
    return;
  }
  const files = fs.readdirSync(pluginFolder);
  for (const file of files) {
    if (!file.endsWith(".js")) continue;
    const filePath = path.join(pluginFolder, file);
    try {
      delete require.cache[require.resolve(filePath)];
      const plugin = require(filePath);
      if (plugin && typeof plugin === "object" && typeof plugin.handler === "function" && plugin.command) {
        plugins.push(plugin);
        if (typeof plugin.onLoad === "function") {
          try {
            plugin.onLoad();
          } catch {}
        }
        console.log("Plugin loaded:", file);
      }
    } catch (err) {
      console.error("Plugin error:", file, err);
    }
  }
  global.plugins = plugins;
}
loadPlugins();
let reloadTimer = null;
fs.watch(pluginFolder, (event, filename) => {
  if (!filename || !filename.endsWith(".js")) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(loadPlugins, 300);
});
async function handleMessages(sock, messageUpdate) {
  try {
    const {
      messages,
      type
    } = messageUpdate;
    if (type !== "notify") return;
    if (!Array.isArray(messages) || !messages[0]) return;
    const message = messages[0]
    if (!message) return
    if (message.message?.protocolMessage?.type === 14) {
    const edited =
    message.message.protocolMessage.editedMessage
    if (!edited) return
    message.message = edited
}
if (!message.message) return
    storeMessage(sock, message);
    if (message.message?.protocolMessage?.type === 0) {
      await handleMessageRevocation(sock, message);
      return;
    }
    const m = sock.serializeM(message)
    
    const chatId = m.chat
    const senderId = m.sender;
    if (m.isGroup) {
  const group = getGroup(m.chat)
  if (group.blacklist?.[m.sender]) {
    await sock.sendMessage(m.chat, { delete: m.key })
    return
  }
    }
    if (m.isGroup) {
  const group = getGroup(chatId)
  if (group.banned?.[senderId]) {
    return
  }
    }
    const user = getUser(senderId);
    const isGroup = m.isGroup;
    const isPrivate = !isGroup;
    const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || message.message?.videoMessage?.caption || "";
    let body = rawText.trim();
    const normalized = body.trimStart();
    const userMessage = body.toLowerCase().replace(/\.\s+/g, ".").trim();
    try {
      await logMessage({
        from: isGroup ? m.groupMetadata?.subject || "Group" : "Private",
        sender: m.pushName || senderId.split("@")[0],
        text: m.text || "[Non-text]"
      });
    } catch {}
    let usedPrefix = "";
    let isCommand = false;
    if (global.noPrefix) {
      isCommand = true;
    } else if (Array.isArray(global.prefix)) {
      usedPrefix = global.prefix.find(p => body.startsWith(p)) || "";
      isCommand = Boolean(usedPrefix);
    } else if (typeof global.prefix === "string") {
      usedPrefix = body.startsWith(global.prefix) ? global.prefix : "";
      isCommand = Boolean(usedPrefix);
    }
    if (message.message?.stickerMessage?.fileSha256) {
      const sha = Buffer.from(message.message.stickerMessage.fileSha256).toString("hex");
      if (global.stickerCmd?.[sha]) {
        isCommand = true;
        usedPrefix = Array.isArray(global.prefix) ? global.prefix[0] : global.prefix || ".";
        body = usedPrefix + global.stickerCmd[sha];
      }
    }
    const command = isCommand ? body.slice(usedPrefix.length).trim().split(/\s+/)[0]?.toLowerCase() : null;
    const args = isCommand ? body.slice(usedPrefix.length).trim().split(/\s+/).slice(1) : [];
    if (isCommand) {
      logCommand({
        command: usedPrefix + command,
        user: m.pushName || senderId.split("@")[0],
        group: isGroup ? m.groupMetadata?.subject : null
      });
    }
    const senderIsSudo = await isSudo(senderId);
    const Owner = await isOwnerOrSudo(senderId, sock, chatId);
    const isOwner = Owner || m.key.fromMe;
    const isPremium = isOwner || user.premium === true;
    const isEvalHandled = await evaluate({
      normalized,
      message,
      sock,
      chatId,
      senderIsOwnerOrSudo: isOwner,
      m
    });
    if (isEvalHandled) return;
    if (normalized.startsWith("=>") || normalized.startsWith(">")) {
      if (!isOwner) return;
      const util = require("util");
      const isArrow = normalized.startsWith("=>");
      let code = isArrow ? normalized.slice(2) : normalized.slice(1);
      code = code.trim();
      if (!code) {
        await m.reply("❌ No code");
        return;
      }
      if (!isArrow && !/^return\s+/i.test(code)) {
        code = "return " + code;
      }
      try {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        const fn = new AsyncFunction("require", "process", "sock", "message", "m", "chatId", code);
        let result = await fn(p => require(p.startsWith(".") ? process.cwd() + "/" + p : p), process, sock, message, m, chatId);
        if (typeof result !== "string") {
          result = util.inspect(result, {
            depth: 3
          });
        }
        await m.reply(String(result));
      } catch (e) {
        await m.reply(util.inspect(e));
      }
      return;
    }
    let isPublic = true;
    try {
      const data = JSON.parse(fs.readFileSync("./data/messageCount.json"));
      if (typeof data.isPublic === "boolean") isPublic = data.isPublic;
    } catch {}
    if (!isPublic && !isOwner && !isPremium) return;
    if (isCommand && !user.registered && !isOwner) {
      if (!["daftar", "register"].includes(command)) {
        return m.reply("👋 Hai!\n\n" + "Kamu belum terdaftar di bot ini.\n\n" + "📌 Silakan daftar dulu dengan format:\n" + "`#daftar <nama> <umur>`\n\n" + "Contoh:\n" + "`#daftar lydia 20`");
      }
    }
    if (m.isGroup) {
  const group = getGroup(chatId)
  const banned = group.banned?.[senderId]

  if (banned) {
    if (isCommand) {
      return m.reply("🚫 Kamu diban di grup ini, hubungin atemin untuk membuka banned anda😂")
    }
    return
  }
    }
    if (m.quoted) {
      const session = global.REPLY_SESSIONS.get(senderId);
      if (session && session.msgId === m.quoted.key.id && Date.now() < session.expire) {
        const plugin = plugins.find(p => p.name === session.plugin);
        if (plugin && typeof plugin.onReply === "function") {
          await plugin.onReply({
            sock,
            m,
            session,
            isOwner
          });
          return;
        }
      }
    }
    if (!isCommand) {
      for (const p of plugins) {
        if (typeof p.responder === "function") {
          try {
            const stop = await p.responder({
              sock,
              m,
              text: userMessage,
              isOwner
            });
            if (stop) return;
          } catch (e) {
            console.error("Responder error:", p.name, e);
          }
        }
      }
      if (isGroup) {
        // tambahin lakau mau
        if (isPublic || isOwner) {
          // tambahain kalau mau
        }
      }
      return;
    }
    m._commandContext = {
      command,
      args,
      isOwner,
      isPremium,
      isGroup,
      isPrivate,
      senderId,
      chatId,
      usedPrefix
    };
    await handleMessagesExecutor(sock, m, message, plugins);
  } catch (err) {
    console.error("handleMessages error:", err);
  }
}
async function handleMessagesExecutor(sock, m, message, plugins) {
  const {
    command,
    args,
    isOwner,
    isPremium,
    isGroup,
    isPrivate,
    senderId,
    chatId,
    usedPrefix
  } = m._commandContext || {};
  if (!command) return;
  const user = getUser(senderId);
  if (Array.isArray(global.blockedCommands)) {
    if (global.blockedCommands.includes(command) && !isOwner) {
      return m.reply(`⛔ Command *${command}* sedang diblokir.`);
    }
  }
  let isSenderAdmin = false;
  let isBotAdmin = false;
  const plugin = plugins.find(p => Array.isArray(p.command) ? p.command.includes(command) : p.command === command);
  if (plugin) {
    if (isGroup && plugin.admin) {
      const adminStatus = await isAdmin(sock, chatId, senderId);
      isSenderAdmin = adminStatus.isSenderAdmin;
      isBotAdmin = adminStatus.isBotAdmin;
    }
    if (plugin.owner && !isOwner) return m.reply("❌ Owner only");
    if (plugin.admin && !isSenderAdmin) return m.reply("❌ Admin only");
    if (plugin.premium && !isPremium) return m.reply("❌ Premium only");
    if (plugin.group && !isGroup) return m.reply("❌ Command ini hanya untuk grup");
    if (plugin.private && isGroup) return m.reply("❌ Command ini hanya untuk private chat");
    if (plugin.botAdmin && !isBotAdmin) return m.reply("❌ Bot harus jadi admin");
    if (plugin.nsfw) {
      if (!user.age) {
        return m.reply("🔞 Fitur ini hanya untuk user 18+\n\n" + "❌ Kamu belum mengisi umur\n" + "Gunakan: #daftar nama umur");
      }
      if (user.age < 18) {
        return m.reply("🚫 AKSES DITOLAK\n\n" + "🔞 Fitur NSFW hanya untuk umur 18+\n" + `Umur kamu: ${user.age}`);
      }
    }
    if (plugin.limit) {
      if (!isPremium) {
        const ok = useLimit(user, 1);
        if (!ok) {
          return m.reply("❌ Limit harian kamu habis\n\n" + "💰 Kumpulkan credit dari game\n" + "🛒 Beli limit dengan credit");
        }
      }
    }
    await plugin.handler({
      sock,
      m,
      chatId,
      senderId,
      args,
      isGroup,
      isPrivate,
      isOwner: isOwner,
      isAdmin: isSenderAdmin,
      isBotAdmin,
      prefix: usedPrefix,
      isPremium,
      plugins,
      command
    });
    if (!isOwner) {
      const levelUp = addExp(user, 30);
      if (levelUp) {
        addCredit(user, user.level * 50);
        await m.reply(`🎉 *LEVEL UP!*\n\n` + `👤 User : ${m.pushName || "Unknown"}\n` + `⭐ Level : ${user.level}\n` + `💰 Bonus : ${user.level * 50} credit`);
      }
    }
    return;
  }
}
async function handleGroupParticipantUpdate(sock, update) {
  try {
    const {
      id,
      participants,
      action
    } = update;
    if (!id.endsWith("@g.us")) return;
    if (action === "add") {
      for (const p of global.plugins) {
        if (typeof p.onGroupJoin === "function") {
          await p.onGroupJoin({
            sock,
            chatId: id,
            participants,
            groupMetadata: await sock.groupMetadata(id)
          });
        }
      }
    }
    if (action === "remove") {
      for (const p of global.plugins) {
        if (typeof p.onGroupLeave === "function") {
          await p.onGroupLeave({
            sock,
            chatId: id,
            participants,
            groupMetadata: await sock.groupMetadata(id)
          });
        }
      }
    }
  } catch (e) {
    console.error("Group update error:", e);
  }
}
module.exports = {
  handleMessages,
  handleMessagesExecutor,
  handleGroupParticipantUpdate
};
