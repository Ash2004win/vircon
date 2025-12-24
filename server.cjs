const express = require("express");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const app = express();
app.use(cors());

const APP_ID = "ab352e10408145eda50920a293424622";
const APP_CERTIFICATE = "406f77a15ab54f70954223ff4374e8d7";

app.get("/token", (req, res) => {
  const channelName = req.query.channel;
  const uid = Number(req.query.uid); // 🔴 UNIQUE UID PER USER
  const role = RtcRole.PUBLISHER;

  const expireTime = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  res.json({ token, uid });
});

app.listen(8080, () => {
  console.log("Agora token server running on http://localhost:8080");
});
