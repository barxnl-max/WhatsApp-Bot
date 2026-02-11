const fs = require("fs");
const path = require("path");
const settings = require("../settings");
const {
  isSudo
} = require("./index");
const OWNER_JSON = path.join(__dirname, "../data/owner.json");
function loadExtraOwners() {
  if (!fs.existsSync(OWNER_JSON)) return [];
  try {
    return JSON.parse(fs.readFileSync(OWNER_JSON));
  } catch {
    return [];
  }
}
async function isOwnerOrSudo(senderId, sock = null, chatId = null) {
  const ownerNumber = settings.ownerNumber || "";
  const ownerJid = ownerNumber + "@s.whatsapp.net";
  const ownerClean = ownerNumber.split(":")[0];
  const senderClean = senderId.split(":")[0].split("@")[0];
  if (senderId === ownerJid) return true;
  if (senderClean === ownerClean) return true;
  if (settings.ownerLid) {
    const ownerLidClean = settings.ownerLid.split(":")[0].split("@")[0];
    const senderLidClean = senderId.includes("@lid") ? senderId.split("@")[0].split(":")[0] : "";
    if (senderId === settings.ownerLid) return true;
    if (senderLidClean === ownerLidClean) return true;
  }
  const extraOwners = loadExtraOwners();
  if (extraOwners.includes(senderClean)) return true;
  if (sock && chatId && chatId.endsWith("@g.us") && senderId.includes("@lid")) {
    try {
      const metadata = await sock.groupMetadata(chatId);
      const participant = metadata.participants.find(p => {
        const pid = (p.id || "").split(":")[0].split("@")[0];
        const plid = (p.lid || "").split(":")[0];
        return pid === senderClean || plid === senderClean;
      });
      if (participant && participant.id) {
        const pidClean = participant.id.split(":")[0].split("@")[0];
        if (pidClean === ownerClean) return true;
        if (extraOwners.includes(pidClean)) return true;
      }
    } catch (e) {
      console.error("❌ isOwner group check error:", e);
    }
  }
  try {
    return await isSudo(senderId);
  } catch {
    return false;
  }
}
module.exports = isOwnerOrSudo;
