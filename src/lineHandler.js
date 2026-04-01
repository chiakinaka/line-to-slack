const { sendToSlack } = require('./slackNotifier');
const { translateMessage } = require('./translator');
const line = require('@line/bot-sdk');

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const message = event.message.text;
  const source = event.source;

  // 翻訳を実行
  const translated = await translateMessage(message);

  // 翻訳結果をLINEに返信
  if (translated) {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: translated,
    });
  }

  // メンションのみSlack通知
  if (message.startsWith('@')) {
    let senderInfo = '';
    if (source.type === 'group') {
      senderInfo = `グループ (${source.groupId})`;
    } else if (source.type === 'room') {
      senderInfo = `トークルーム (${source.roomId})`;
    } else {
      senderInfo = `個人チャット (${source.userId})`;
    }

    const slackMessage = `📣 メンションされました！\n送信元: ${senderInfo}\nメッセージ: ${message}`;
    await sendToSlack(slackMessage);
  }
}

module.exports = { handleEvent };