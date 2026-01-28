const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
const settings = require("../settings")
const isOwnerOrSudo = require("../lib/isOwner")

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        return reject(
          new Error((stderr || stdout || err.message || "").toString())
        )
      }
      resolve((stdout || "").toString())
    })
  })
}

async function hasGitRepo() {
  if (!fs.existsSync(path.join(process.cwd(), ".git"))) return false
  try {
    await run("git --version")
    return true
  } catch {
    return false
  }
}

async function updateViaGit() {
  const oldRev = (await run("git rev-parse HEAD").catch(() => "unknown")).trim()

  await run("git fetch --all --prune")

  const newRev = (await run("git rev-parse origin/main")).trim()
  const alreadyUpToDate = oldRev === newRev

  if (!alreadyUpToDate) {
    await run(`git reset --hard ${newRev}`)
    await run("git clean -fd")
  }

  return { oldRev, newRev, alreadyUpToDate }
}

function downloadFile(url, dest, visited = new Set()) {
  return new Promise((resolve, reject) => {
    if (visited.has(url) || visited.size > 5) {
      return reject(new Error("Too many redirects"))
    }

    visited.add(url)
    const client = url.startsWith("https") ? require("https") : require("http")

    client
      .get(
        url,
        {
          headers: {
            "User-Agent": "Bot-Updater",
            Accept: "*/*"
          }
        },
        res => {
          if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
            const next = new URL(res.headers.location, url).toString()
            res.resume()
            return downloadFile(next, dest, visited)
              .then(resolve)
              .catch(reject)
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`))
          }

          const file = fs.createWriteStream(dest)
          res.pipe(file)

          file.on("finish", () => file.close(resolve))
          file.on("error", err => {
            fs.unlink(dest, () => reject(err))
          })
        }
      )
      .on("error", err => {
        fs.unlink(dest, () => reject(err))
      })
  })
}

async function extractZip(zipPath, outDir) {
  if (process.platform === "win32") {
    return run(
      `powershell -NoProfile -Command "Expand-Archive -Force '${zipPath}' '${outDir}'"`
    )
  }

  try {
    await run("unzip -o '" + zipPath + "' -d '" + outDir + "'")
    return
  } catch {}

  try {
    await run("7z x -y '" + zipPath + "' -o'" + outDir + "'")
    return
  } catch {}

  throw new Error("No unzip tool available")
}

function copyRecursive(src, dest, ignore = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

  for (const name of fs.readdirSync(src)) {
    if (ignore.includes(name)) continue

    const s = path.join(src, name)
    const d = path.join(dest, name)

    if (fs.lstatSync(s).isDirectory()) {
      copyRecursive(s, d, ignore)
    } else {
      fs.copyFileSync(s, d)
    }
  }
}

async function updateViaZip(zipUrl) {
  if (!zipUrl) throw new Error("ZIP URL not configured")

  const tmpDir = path.join(process.cwd(), "tmp")
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

  const zipPath = path.join(tmpDir, "update.zip")
  const extractDir = path.join(tmpDir, "extract")

  await downloadFile(zipUrl, zipPath)

  if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true })
  await extractZip(zipPath, extractDir)

  const [root] = fs.readdirSync(extractDir)
  const src = path.join(extractDir, root)

  copyRecursive(src, process.cwd(), [
    ".git",
    "node_modules",
    "session",
    "tmp",
    "data"
  ])

  fs.rmSync(zipPath, { force: true })
  fs.rmSync(extractDir, { recursive: true })
}

async function restart() {
  try {
    await run("pm2 restart all")
  } catch {
    process.exit(0)
  }
}

async function updateCommand(sock, chatId, message) {
  const senderId = message.key.participant || message.key.remoteJid
  const isOwner = await isOwnerOrSudo(senderId, sock, chatId)

  if (!message.key.fromMe && !isOwner) {
    return sock.sendMessage(chatId, { text: "Owner only" }, { quoted: message })
  }

  await sock.sendMessage(
    chatId,
    { text: "Updating, please wait..." },
    { quoted: message }
  )

  try {
    if (await hasGitRepo()) {
      await updateViaGit()
      await run("npm install --no-audit --no-fund")
    } else {
      await updateViaZip(settings.updateZipUrl)
    }

    await sock.sendMessage(
      chatId,
      { text: "Update complete. Restarting..." },
      { quoted: message }
    )

    await restart()
  } catch (err) {
    await sock.sendMessage(
      chatId,
      { text: "Update failed:\n" + err.message },
      { quoted: message }
    )
  }
}

module.exports = updateCommand
