require('dotenv').config();
const { PubSub } = require('@google-cloud/pubsub');
const axios = require('axios');
const path = require('path');

const pubsub = new PubSub({
  keyFilename: path.join(__dirname, process.env.GCP_KEYFILE)
});

const subscriptionName = process.env.GCP_SUB;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramAlert(value) {
  try {
    const text = `⚠️ Alerta: pessoas detectadas acima do limite: ${value}`;

    await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      chat_id: telegramChatId,
      text
    });

    console.log('Notificação enviada ao Telegram.');
  } catch (err) {
    console.error('Erro ao enviar mensagem ao Telegram:', err);
  }
}

function listen() {
  const subscription = pubsub.subscription(subscriptionName);

  subscription.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg.data.toString());
      const value = data.value;

      console.log(`Mensagem recebida: ${value}`);

      if (typeof value === 'number' && value > 0) {
        await sendTelegramAlert(value);
      }

      msg.ack();
    } catch (err) {
      console.error('Erro ao processar mensagem:', err);
    }
  });

  subscription.on('error', (err) => {
    console.error('Erro na assinatura:', err);
  });

  console.log(`Aguardando mensagens da assinatura: ${subscriptionName}`);
}

listen();
