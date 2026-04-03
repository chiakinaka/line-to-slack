const { sendToSlack, sendTranslationToThread } = require('./slackNotifier');
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
 const cleanMessageForTranslation = message.replace(/@\S+/g, '').trim();
const translated = await translateMessage(cleanMessageForTranslation);

  // 翻訳結果をLINEに返信
  if (translated) {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: translated,
    });
  }

  // メンションのみSlack通知（@を除いたメッセージを送信）
 if (message.includes('@nomino')) {
    let groupName = '不明';
    let senderName = '不明';

    try {
      if (source.type === 'group') {
        const groupSummary = await client.getGroupSummary(source.groupId);
        groupName = groupSummary.groupName;
        const memberProfile = await client.getGroupMemberProfile(source.groupId, source.userId);
        senderName = memberProfile.displayName;
      } else if (source.type === 'room') {
        const memberProfile = await client.getRoomMemberProfile(source.roomId, source.userId);
        senderName = memberProfile.displayName;
        groupName = 'トークルーム';
      } else {
        groupName = '個人チャット';
        senderName = '';
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
    }

    // @以降のメンション部分を除いたメッセージ
    const cleanMessage = message.replace(/^@\S+\s*/, '').trim() || message;

    // Slackにメイン通知を送信（翻訳も含む）
    await sendToSlack({
      groupName,
      senderName,
      message: cleanMessage,
      translated,
    });
  }
}

module.exports = { handleEvent };