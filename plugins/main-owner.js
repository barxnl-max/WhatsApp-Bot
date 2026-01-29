const settings = require("../settings")

module.exports = {
  name: "owner",
  command: ["owner"],
  usedCmd: ["owner"],
  tags: ["main"],
  limit: false,

  async handler({ sock, m }) {
    const number = settings.ownerNumber
      .replace(/[^0-9]/g, "")

    const jid = number + "@s.whatsapp.net"

    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      `FN:Bot Owner\n` +
      `N:Owner;Bot;;;\n` +
      `TEL;type=CELL;type=VOICE;waid=${number}:${number}\n` +
      "END:VCARD"

    await sock.sendMessage(
      m.chat,
      {
        contacts: {
          displayName: "Bot Owner",
          contacts: [
            {
              vcard
            }
          ]
        }
      },
      { quoted: m }
    )
  }
}
