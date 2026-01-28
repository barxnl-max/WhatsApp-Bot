const updateCommand = require("../lib/update")

module.exports = {
  name: "update",
  command: ["update"],
  tags: ["owner"],
  owner: true,
  usedCmd: ["update"],

  async handler({ sock, m, chatId }) {
    await updateCommand(sock, chatId, m)
  }
}
