require("dotenv").config();
const { PubSub } = require("@google-cloud/pubsub");
const path = require("path");

const pubsub = new PubSub({
  keyFilename: path.join(__dirname, process.env.GCP_KEYFILE)
});

const topic = process.env.GCP_TOPIC;

async function publishCounter(value) {
  const dataBuffer = Buffer.from(JSON.stringify({ value }));

  await pubsub.topic(topic).publishMessage({ data: dataBuffer });

  return { ok: true };
}

module.exports = { publishCounter };
