/** Welcome canvas
    creted by Muhammad Akbar **/

const {
  createCanvas,
  loadImage
} = require("@napi-rs/canvas");
async function baseCanvas({
  avatar,
  username,
  group,
  member,
  title
}) {
  const width = 900;
  const height = 320;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#020617");
  bg.addColorStop(1, "#020617");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  ctx.fillRect(30, 30, width - 60, height - 60);
  ctx.shadowBlur = 0;
  const img = await loadImage(avatar);
  ctx.save();
  ctx.beginPath();
  ctx.arc(160, 160, 72, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 88, 88, 144, 144);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(160, 160, 78, 0, Math.PI * 2);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(160, 160, 74, 0, Math.PI * 2);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = "bold 72px Sans";
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillText(title, 302, 122);
  ctx.fillStyle = "#0ea5e9";
  ctx.fillText(title, 300, 120);
  ctx.fillStyle = "#e0f2fe";
  ctx.fillText(title, 298, 118);
  ctx.font = "bold 30px Sans";
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillText(username, 302, 175);
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(username, 300, 173);
  ctx.font = "22px Sans";
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillText(`Group : ${group}`, 302, 215);
  ctx.fillText(`Member : ${member}`, 302, 245);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(`Group : ${group}`, 300, 213);
  ctx.fillText(`Member : ${member}`, 300, 243);
  return canvas.toBuffer("image/png");
}
async function Welcome({
  avatar,
  username,
  group,
  member
}) {
  return baseCanvas({
    avatar,
    username,
    group,
    member,
    title: "WELCOME"
  });
}
async function Goodbye({
  avatar,
  username,
  group,
  member
}) {
  return baseCanvas({
    avatar,
    username,
    group,
    member,
    title: "GOODBYE"
  });
}
module.exports = {
  Welcome,
  Goodbye
};
