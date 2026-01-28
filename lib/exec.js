const {
  exec
} = require("child_process");
module.exports = async function executeHandler(ctx) {
  const {
    normalized,
    message,
    m,
    sock,
    chatId,
    senderIsOwnerOrSudo
  } = ctx;
  if (!normalized.startsWith("$")) return false;
  if (!message.key.fromMe && !senderIsOwnerOrSudo) {
    await m.reply("❌ Execute hanya untuk owner/sudo");
    return true;
  }
  const cmd = normalized.slice(1).trim();
  if (!cmd) {
    await m.reply("❌ Tidak ada command");
    return true;
  }
  console.log(`[EXEC] ${cmd}`);
  exec(cmd, {
    timeout: 60_000
  }, async (err, stdout, stderr) => {
    let output = "";
    if (err) {
      output = stderr || err.message;
    } else {
      output = stdout || stderr || "✔️ Done";
    }
    if (!output) output = "✔️ Done";
    await m.reply(output);
  });
  return true;
};