const { sendToSlack } = require('./slackNotifier');

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const message = event.message.text;
  const source = event.source;

  let senderInfo = '';

  if (source.type === 'group') {
    senderInfo = `グループ (${source.groupId})`;
  } else if (source.type === 'room') {
    senderInfo = `トークルーム (${source.roomId})`;
  } else {
    senderInfo = `個人チャット (${source.userId})`;
  }

  const slackMessage = `📩 LINEメッセージ\n送信元: ${senderInfo}\nメッセージ: ${message}`;
  await sendToSlack(slackMessage);
}

module.exports = { handleEvent }; 
