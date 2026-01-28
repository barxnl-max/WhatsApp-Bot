const fs = require("fs");
const path = require("path");
const isOwnerOrSudo = require("./isOwner");
const FILE = path.join(__dirname, "../data/premium.json");
function loadPremium() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({
      premium: []
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE));
}
function savePremium(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
function cleanId(id = "") {
  return id.split(":")[0].split("@")[0];
}
async function isPremium(senderId, sock = null, chatId = null) {
  if (await isOwnerOrSudo(senderId, sock, chatId)) {
    return true;
  }
  const data = loadPremium();
  const senderClean = cleanId(senderId);
  return data.premium.some(u => {
    const uClean = cleanId(u);
    return senderId === u || senderClean === uClean || senderId.includes(uClean);
  });
}
async function addPremium(userId) {
  const data = loadPremium();
  if (!data.premium.includes(userId)) {
    data.premium.push(userId);
    savePremium(data);
  }
  return true;
}
async function removePremium(userId) {
  const data = loadPremium();
  data.premium = data.premium.filter(u => u !== userId);
  savePremium(data);
  return true;
}
async function getPremiumList() {
  const data = loadPremium();
  return data.premium;
}
module.exports = {
  isPremium,
  addPremium,
  removePremium,
  getPremiumList
};