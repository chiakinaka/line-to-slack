const axios = require('axios');

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// メイン通知を送信してthread_tsを返す
async function sendToSlack({ groupName, senderName, message }) {
  if (!WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL が設定されていません');
    return null;
  }

  const body = {
    blocks: [
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📣 *メンションされました！*`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `👥 *グループ:*\n*${groupName}*`,
          },
          {
            type: 'mrkdwn',
            text: `👤 *送信者:*\n${senderName}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💬 *メッセージ:*\n${message}`,
        },
      },
      {
        type: 'divider',
      },
    ],
  };

  const response = await axios.post(WEBHOOK_URL, body);
  return response;
}

// スレッドに翻訳を送信
async function sendTranslationToThread({ channelId, threadTs, translated }) {
  if (!WEBHOOK_URL) return;

  await axios.post(WEBHOOK_URL, {
    thread_ts: threadTs,
    text: `🌐 *翻訳:* ${translated}`,
  });
}

module.exports = { sendToSlack, sendTranslationToThread };
