const fs = require("fs");
const path = require("path");

module.exports = {
  name: "delplugin",
  command: ["delplugin", "dp"],
  usedCmd: "delplugin",
  tags: ["owner"],
  owner: true,

  async handler({ m, args }) {
    const name = args[0];
    if (!name) return m.reply("Nama plugin?");

    if (!name.endsWith(".js")) return m.reply("Nama harus .js");

    const pluginPath = path.join(process.cwd(), "plugins", name);

    if (!fs.existsSync(pluginPath)) {
      return m.reply("Plugin tidak ditemukan");
    }

    delete require.cache[require.resolve(pluginPath)];
    fs.unlinkSync(pluginPath);

    m.reply(`🗑️ Plugin *${name}* berhasil dihapus`);
  },
};
