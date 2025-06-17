const amqp = require('amqplib');

let channel = null;

const initBroker = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('translation_requests', { durable: true });
    console.log('API: Message Broker connected and queue asserted.');
  } catch (error) {
    console.error("API: Failed to connect to Message Broker", error);
    process.exit(1);
  }
};

const publishToQueue = async (queueName, message) => {
  if (!channel) {
    throw new Error("Channel is not initialized.");
  }
  channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
};

module.exports = { initBroker, publishToQueue };