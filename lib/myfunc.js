const {
  proto,
  getContentType,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const chalk = require("chalk");
const fs = require("fs");
exports.smsg = (sock, m, store) => {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = sock.decodeJid(m.fromMe ? sock.user.id : m.participant || m.key.participant || m.chat);
  }
  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg = m.mtype === "viewOnceMessage" ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype];
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || "";
    m.download = async () => {
      if (!m.msg) return null;
      const type = m.mtype.replace("Message", "");
      const stream = await downloadContentFromMessage(m.msg, type);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    };
    if (m.msg?.contextInfo?.quotedMessage) {
      let quotedMsg = m.msg.contextInfo.quotedMessage;
      let qtype = getContentType(quotedMsg);
      let q = M.fromObject({
        key: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.msg.contextInfo.stanzaId,
          participant: m.msg.contextInfo.participant
        },
        message: quotedMsg
      });
      m.quoted = exports.smsg(sock, q, store);
      m.quoted.download = async () => {
        if (!m.quoted.msg) return null;
        const type = m.quoted.mtype.replace("Message", "");
        const stream = await downloadContentFromMessage(m.quoted.msg, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      };
      m.quoted.delete = () => sock.sendMessage(m.quoted.chat, {
        delete: q.key
      });
      m.quoted.copyNForward = (jid, force = false, options = {}) => sock.copyNForward(jid, q, force, options);
    }
  }
  m.reply = (text, chatId = m.chat, options = {}) => {
    if (Buffer.isBuffer(text)) {
      return sock.sendMessage(chatId, {
        document: text
      }, {
        quoted: m,
        ...options
      });
    }
    if (typeof text === "object") {
      return sock.sendMessage(chatId, text, {
        quoted: m,
        ...options
      });
    }
    return sock.sendMessage(chatId, {
      text
    }, {
      quoted: m,
      ...options
    });
  };
  m.copy = () => exports.smsg(sock, M.fromObject(M.toObject(m)), store);
  m.copyNForward = (jid = m.chat, force = false, options = {}) => sock.copyNForward(jid, m, force, options);
  return m;
};
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});