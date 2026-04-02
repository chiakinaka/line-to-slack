const axios = require('axios');

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// メイン通知を送信してthread_tsを返す
async function sendToSlack({ groupName, senderName, message, translated }) {
  if (!WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL が設定されていません');
    return null;
  }

  const blocks = [
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📣 *Mentioned!*`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `👥 *Group:*\n*${groupName}*`,
        },
        {
          type: 'mrkdwn',
          text: `👤 *From:*\n${senderName}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `💬 *Message:*\n${message}`,
      },
    },
  ];

  // 翻訳がある場合は追加
  if (translated) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🌐 *Translation:*\n${translated}`,
      },
    });
  }

  blocks.push({ type: 'divider' });

  const response = await axios.post(WEBHOOK_URL, { blocks });
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