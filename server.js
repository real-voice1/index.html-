const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'REAL VOICE Agora Token Server' });
});

app.get('/rtc-token', (req, res) => {
  if (!APP_ID || !APP_CERTIFICATE) {
    return res.status(500).json({ error: 'Missing Agora environment variables' });
  }

  const channelName = String(req.query.channelName || '').trim();
  if (!channelName) {
    return res.status(400).json({ error: 'channelName is required' });
  }

  const uid = Number.isInteger(Number(req.query.uid)) ? Number(req.query.uid) : 0;
  const role = req.query.role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
  const expireSeconds = Math.min(Math.max(Number(req.query.expire) || 3600, 60), 86400);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs,
    privilegeExpiredTs
  );

  res.json({
    token,
    appId: APP_ID,
    channelName,
    uid,
    expireAt: privilegeExpiredTs
  });
});

app.listen(PORT, () => {
  console.log(`REAL VOICE token server running on port ${PORT}`);
});
