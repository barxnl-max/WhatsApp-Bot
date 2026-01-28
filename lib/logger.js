const chalk = require("chalk");
function getTimeAndDate() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(now);
  const date = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(now);
  return {
    time,
    date
  };
}
function logCommand({
  command,
  user,
  group
}) {
  const {
    time,
    date
  } = getTimeAndDate();
  const tag = chalk.bold.bgBlue.white("[ CMD ]");
  const timePart = chalk.bold.yellow(`${time} WIB`);
  const datePart = chalk.bold.yellow(`| ${date}`);
  const userPart = chalk.bold.magenta(user || "Unknown");
  const groupPart = group ? chalk.cyan(`in ${group}`) : "";
  const cmdPart = chalk.bold.green(command);
  console.log(`${tag} ${timePart} ${datePart} from ${userPart} ${groupPart} | ${cmdPart}`);
}
function logMessage({
  from,
  sender,
  text
}) {
  const {
    time,
    date
  } = getTimeAndDate();
  const tag = chalk.bold.bgMagenta.white("[ MSG ]");
  const timePart = chalk.bold.yellow(`${time} WIB`);
  const datePart = chalk.bold.yellow(`| ${date}`);
  const fromPart = chalk.white(from || "Unknown");
  const senderPart = chalk.bold.magenta(sender || "Unknown");
  const textPart = chalk.white(text || "[Non-text]");
  console.log(`${tag} ${timePart} ${datePart} ${fromPart} | ${senderPart}: ${textPart}`);
}
module.exports = {
  logCommand,
  logMessage
};