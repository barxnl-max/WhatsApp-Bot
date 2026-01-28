const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const {
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");
module.exports = function simple(sock) {
  sock.sendText = (jid, text, quoted, options = {}) => {
    return sock.sendMessage(jid, {
      text
    }, {
      quoted,
      ...options
    });
  };
  sock.reply = (jid, text, quoted, options = {}) => {
    return sock.sendMessage(jid, {
      text,
      ...options
    }, {
      quoted
    });
  };
  sock.sendFile = async (jid, input, options = {}) => {
    const {
      caption = "",
      fileName,
      quoted,
      ptt = false,
      asDocument = false,
      viewOnce = false,
      gifPlayback = false,
      ptv = false
    } = options;
    let mimeType = "application/octet-stream";
    let data = input;
    if (typeof input === "string" && /^https?:\/\//i.test(input)) {
      try {
        const head = await axios.head(input, {
          timeout: 7000,
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });
        mimeType = head.headers["content-type"] || mimeType;
      } catch {}
      data = {
        url: input
      };
    } else if (typeof input === "string" && fs.existsSync(input)) {
      data = fs.readFileSync(input);
      mimeType = mime.lookup(input) || mimeType;
    } else if (Buffer.isBuffer(input)) {
      data = input;
    }
    const name = fileName || (typeof input === "string" ? path.basename(input.split("?")[0]) : "file");
    if (asDocument) {
      return sock.sendMessage(jid, {
        document: data,
        mimetype: mimeType,
        fileName: name,
        caption
      }, {
        quoted
      });
    }
    if (mimeType.startsWith("image/")) {
      return sock.sendMessage(jid, {
        image: data,
        caption,
        viewOnce
      }, {
        quoted
      });
    }
    if (mimeType.startsWith("video/")) {
      return sock.sendMessage(jid, {
        video: data,
        caption,
        gifPlayback,
        viewOnce,
        ptv
      }, {
        quoted
      });
    }
    if (mimeType.startsWith("audio/")) {
      return sock.sendMessage(jid, {
        audio: data,
        mimetype: mimeType,
        ptt
      }, {
        quoted
      });
    }
    return sock.sendMessage(jid, {
      document: data,
      mimetype: mimeType,
      fileName: name,
      caption
    }, {
      quoted
    });
  };
  sock.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    if (!message) return;
    const m = message.message ? message : message.fakeObj || message;
    const content = await generateForwardMessageContent(m, forceForward);
    const type = Object.keys(content)[0];
    content[type].contextInfo = {
      ...(m.message?.contextInfo || {}),
      ...(content[type].contextInfo || {})
    };
    const waMessage = await generateWAMessageFromContent(jid, content, {
      userJid: sock.user.id,
      ...options
    });
    await sock.relayMessage(jid, waMessage.message, {
      messageId: waMessage.key.id
    });
    return waMessage;
  };
  sock.extendMessage = m => {
    m.download = async () => {
      const msg = m.message || m.msg;
      if (!msg) return null;
      const type = Object.keys(msg)[0];
      const stream = await downloadContentFromMessage(msg[type], type.replace("Message", ""));
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    };
    if (m.quoted) {
      m.quoted.download = async () => {
        const msg = m.quoted.message || m.quoted.msg;
        if (!msg) return null;
        const type = Object.keys(msg)[0];
        const stream = await downloadContentFromMessage(msg[type], type.replace("Message", ""));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      };
    }
    m.reply = (input, options = {}) => {
      if (typeof input === "string" && /^https?:\/\//i.test(input)) {
        return sock.sendFile(m.chat, input, {
          quoted: m,
          ...options
        });
      }
      if (typeof input === "object") {
        return sock.sendMessage(m.chat, input, {
          quoted: m,
          ...options
        });
      }
      return sock.sendText(m.chat, input, m, options);
    };
    m.send = (input, options = {}) => {
      if (typeof input === "string" && /^https?:\/\//i.test(input)) {
        return sock.sendFile(m.chat, input, options);
      }
      if (typeof input === "object") {
        return sock.sendMessage(m.chat, input, options);
      }
      return sock.sendText(m.chat, input, null, options);
    };
    m.copy = () => JSON.parse(JSON.stringify(m));
    m.forward = (jid, force = false, options = {}) => sock.copyNForward(jid, m, force, options);
    return m;
  };
};
