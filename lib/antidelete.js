global.DELETED_STORE = global.DELETED_STORE || new Map();
global.db.antidelete = global.db.antidelete || {};
function isAntideleteOn(chatId) {
  return global.db.antidelete?.[chatId] === true;
}
function storeMessage(sock, message) {
  if (!message?.key?.id) return;
  if (message.key.fromMe) return;
  global.DELETED_STORE.set(message.key.id, {
    message,
    time: Date.now()
  });
  setTimeout(() => {
    global.DELETED_STORE.delete(message.key.id);
  }, 1000 * 60 * 60);
}
async function handleMessageRevocation(sock, message) {
  const key = message.message?.protocolMessage?.key;
  if (!key?.id) return;
  const chatId = key.remoteJid;
  if (!isAntideleteOn(chatId)) return;
  const stored = global.DELETED_STORE.get(key.id);
  if (!stored) return;
  await sock.sendMessage(chatId, {
    text: "Woi apus apaan itu 😂",
    quoted: stored.message
  });
  await sock.copyNForward(chatId, stored.message, true);
}
module.exports = {
  storeMessage,
  handleMessageRevocation
};