module.exports = {
  name: "bot",
  command: ["bot"],
  tags: ["main"],
  usedCmd: ["bot"],
  limit: false,

  async handler({ m }) {
    await m.reply("halo saya whatsapp bot")
  }
}
