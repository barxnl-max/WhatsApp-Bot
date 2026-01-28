const fs = require("fs");
const path = require("path");

module.exports = {
  name: "addplugin",
  command: ["addplugin", "sp"],
  usedCmd: "addplugin",
  tags: ["owner"],
  owner: true,

  async handler({ m, args, plugins }) {
    const name = args[0];
    if (!name) return m.reply("Nama plugin?");

    const code =
      m.quoted?.text ||
      m.quoted?.message?.conversation ||
      m.quoted?.message?.extendedTextMessage?.text;

    if (!code) return m.reply("Reply code plugin");
    if (!name.endsWith(".js")) return m.reply("Nama harus .js");

    const pluginPath = path.join(process.cwd(), "plugins", name);

    try {
      fs.writeFileSync(pluginPath, code, "utf8");

      delete require.cache[require.resolve(pluginPath)];

      const index = plugins.findIndex((p) => p.__file === pluginPath);
      if (index !== -1) plugins.splice(index, 1);

      const plugin = require(pluginPath);
      plugin.__file = pluginPath;
      plugins.push(plugin);

      m.reply(`✅ Plugin *${name}* berhasil disimpan (overwrite OK)`);
    } catch (err) {
      console.error(err);
      m.reply("❌ Gagal load plugin\n" + err.message);
    }
  },
};
