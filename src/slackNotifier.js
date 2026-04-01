const axios = require('axios');

async function sendToSlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL が設定されていません');
    return;
  }

  await axios.post(webhookUrl, { text: message });
}

module.exports = { sendToSlack }; 
