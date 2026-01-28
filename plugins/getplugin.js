const fs = require("fs");
const path = require("path");

module.exports = {
  name: "getplugin",
  command: ["getplugin"],
  usedCmd: "getplugin <nama>",
  tags: ["owner"],
  owner: true,

  async handler({ m, args }) {
    if (!args[0]) {
      return m.reply("Contoh:\n.getplugin autorespon");
    }

    const name = args[0].replace(/\.js$/i, "");
    const pluginPath = path.join(process.cwd(), "plugins", name + ".js");

    if (!fs.existsSync(pluginPath)) {
      return m.reply("Plugin tidak ditemukan");
    }

    const content = fs.readFileSync(pluginPath, "utf8");

    if (!content.trim()) {
      return m.reply("Plugin kosong");
    }

    const text = "```js\n" + content.slice(0, 38000) + "\n```";

    await m.reply(text);
  },
};
