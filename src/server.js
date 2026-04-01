require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const { handleEvent } = require('./lineHandler');

const app = express();

const lineConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  // 全イベントに200を返す（退会防止）
  res.status(200).end();
  Promise.all(req.body.events.map(handleEvent))
    .catch((err) => console.error(err));
});

app.get('/', (req, res) => res.send('LINE to Slack bot is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));