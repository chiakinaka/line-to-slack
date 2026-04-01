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

    try {
      if (source.type === 'group') {
        // グループ名を取得
        const groupSummary = await client.getGroupSummary(source.groupId);
        const groupName = groupSummary.groupName;

        // 送信者名を取得
        const memberProfile = await client.getGroupMemberProfile(source.groupId, source.userId);
        const memberName = memberProfile.displayName;

        senderInfo = `${groupName}（${memberName}）`;

      } else if (source.type === 'room') {
        // トークルームは名前取得不可のためIDを使用
        const memberProfile = await client.getRoomMemberProfile(source.roomId, source.userId);
        const memberName = memberProfile.displayName;
        senderInfo = `トークルーム（${memberName}）`;

      } else {
        // 個人チャットは名前取得不可
        senderInfo = '個人チャット';
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      senderInfo = source.groupId || source.roomId || source.userId || '不明';
    }

    const slackMessage = `📣 メンションされました！\n送信元: ${senderInfo}\nメッセージ: ${message}`;
    await sendToSlack(slackMessage);
  }
}

module.exports = { handleEvent };