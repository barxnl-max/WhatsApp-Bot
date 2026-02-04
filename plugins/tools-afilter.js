const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")
const { downloadMediaMessage } = require("@whiskeysockets/baileys")

const FILTERS = {
  volume: "volume=1.5",
  normalize: "loudnorm",
  bass: "equalizer=f=94:width_type=o:width=2:g=30",
  treble: "treble=g=8",
  fast: "atempo=1.6",
  slow: "atempo=0.7",
  nightcore: "asetrate=44100*1.12,atempo=1.02",
  chipmunk: "asetrate=65100,atempo=0.5",
  deep: "asetrate=44100*0.7,atempo=1.0",
  fat: "asetrate=22100,atempo=1.6",
  earrape: "volume=12",
  blown: "acrusher=.1:1:64:0:log",
  distorted: "acrusher=level_in=1:level_out=1:bits=4:mode=log",
  overdrive: "acompressor=threshold=0.05:ratio=20:attack=5:release=50",
  echo: "aecho=0.8:0.9:1000:0.3",
  reverb: "aecho=0.8:0.9:1000|1800:0.3|0.25",
  robot:
    "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75",
  reverse: "areverse",
  vaporwave: "asetrate=44100*0.8,atempo=0.8",
  radio: "highpass=f=300,lowpass=f=3000",
  telephone: "highpass=f=500,lowpass=f=2500",
  underwater: "lowpass=f=1000",
  "8d": "apulsator=hz=0.125",
}

module.exports = {
  name: "afilter",
  command: ["afilter"],
  usedCmd: ["afilter <filter>"],
  tags: ["tools"],
  limit: true,

  async handler({ sock, m, chatId, args }) {
    try {
      const filter = args[0]?.toLowerCase()

      if (!filter || !FILTERS[filter]) {
        return m.reply(
          `❌ Audio filter tidak valid\n\n` +
            `Available:\n` +
            Object.keys(FILTERS).join(", ") +
            `\n\nContoh:\n.afilter nightcore`
        )
      }

      const ctx = m.message?.extendedTextMessage?.contextInfo
      if (!ctx?.quotedMessage) {
        return m.reply("❌ Reply audio / VN / video")
      }

      const quoted = ctx.quotedMessage
      const isAudio = !!quoted.audioMessage
      const isVideo = !!quoted.videoMessage

      if (!isAudio && !isVideo) {
        return m.reply("❌ Hanya support audio atau video")
      }

      const mediaMsg = {
        key: {
          remoteJid: chatId,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
        message: quoted,
      }

      const buffer = await downloadMediaMessage(
        mediaMsg,
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      )

      const tmpDir = path.join(process.cwd(), "tmp")
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

      const input = path.join(tmpDir, `af_in_${Date.now()}`)
      const output = path.join(tmpDir, `af_out_${Date.now()}.mp3`)

      fs.writeFileSync(input, buffer)

      const cmd = isVideo
        ? `ffmpeg -y -i "${input}" -vn -af "${FILTERS[filter]}" "${output}"`
        : `ffmpeg -y -i "${input}" -af "${FILTERS[filter]}" "${output}"`

      await new Promise((resolve, reject) => {
        exec(cmd, err => (err ? reject(err) : resolve()))
      })

      await sock.sendMessage(
        chatId,
        {
          audio: fs.readFileSync(output),
          mimetype: "audio/mpeg",
        },
        { quoted: m }
      )

      try {
        fs.unlinkSync(input)
        fs.unlinkSync(output)
      } catch {}
    } catch (e) {
      console.error("[AFILTER ERROR]", e)
      m.reply("❌ Gagal apply audio filter")
    }
  },
}
