const settings = require("../settings");
const {
  isSudo
} = require("./index");
async function isOwnerOrSudo(senderId, sock = null, chatId = null) {
  const ownerJid = settings.ownerNumber + "@s.whatsapp.net";
  const ownerNumberClean = settings.ownerNumber.split(":")[0].split("@")[0];
  const ownerLid = settings.ownerLid || "";
  const ownerLidClean = ownerLid ? ownerLid.split(":")[0].split("@")[0] : "";
  if (senderId === ownerJid) {
    return true;
  }
  if (ownerLid && senderId === ownerLid) {
    return true;
  }
  const senderIdClean = senderId.split(":")[0].split("@")[0];
  const senderLidNumeric = senderId.includes("@lid") ? senderId.split("@")[0].split(":")[0] : "";
  if (ownerLidClean && senderLidNumeric === ownerLidClean) {
    return true;
  }
  if (senderIdClean === ownerNumberClean) {
    return true;
  }
  if (sock && chatId && chatId.endsWith("@g.us") && senderId.includes("@lid")) {
    try {
      const botLid = sock.user?.lid || "";
      const botLidNumeric = botLid.includes(":") ? botLid.split(":")[0] : botLid.includes("@") ? botLid.split("@")[0] : botLid;
      if (senderLidNumeric && botLidNumeric && senderLidNumeric === botLidNumeric) {
        return true;
      }
      const metadata = await sock.groupMetadata(chatId);
      const participants = metadata.participants || [];
      const participant = participants.find(p => {
        const pLid = p.lid || "";
        const pLidNumeric = pLid.includes(":") ? pLid.split(":")[0] : pLid.includes("@") ? pLid.split("@")[0] : pLid;
        const pId = p.id || "";
        const pIdClean = pId.split(":")[0].split("@")[0];
        return p.lid === senderId || p.id === senderId || pLidNumeric === senderLidNumeric || pIdClean === senderIdClean || pIdClean === ownerNumberClean;
      });
      if (participant) {
        const participantId = participant.id || "";
        const participantLid = participant.lid || "";
        const participantIdClean = participantId.split(":")[0].split("@")[0];
        const participantLidNumeric = participantLid.includes(":") ? participantLid.split(":")[0] : participantLid.includes("@") ? participantLid.split("@")[0] : participantLid;
        if (participantId === ownerJid || participantIdClean === ownerNumberClean || participantLidNumeric === botLidNumeric) {
          return true;
        }
      }
    } catch (e) {
      console.error("❌ [isOwner] Error checking participant data:", e);
    }
  }
  if (senderId.includes(ownerNumberClean)) {
    return true;
  }
  try {
    return await isSudo(senderId);
  } catch (e) {
    console.error("❌ [isOwner] Error checking sudo:", e);
    return false;
  }
}
module.exports = isOwnerOrSudo;