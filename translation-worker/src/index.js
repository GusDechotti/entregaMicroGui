const amqp = require('amqplib');
const { connectDB } = require('./database');
const Translation = require('./models/translation');
const { mockTranslate } = require('./translator');

const QUEUE_NAME = 'translation_requests';

const startWorker = async () => {
  await connectDB();
  
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  console.log(`Worker is waiting for messages in queue: ${QUEUE_NAME}`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const { requestId } = JSON.parse(msg.content.toString());
      console.log(`[RECEIVED] requestId: ${requestId}`);

      try {
        await Translation.findByIdAndUpdate(requestId, { $set: { status: 'processing' } });
        const request = await Translation.findById(requestId);

        const translatedText = await mockTranslate(request.originalText, request.sourceLanguage, request.targetLanguage);

        await Translation.findByIdAndUpdate(requestId, { $set: { status: 'completed', translatedText: translatedText } });
        console.log(`[COMPLETED] requestId: ${requestId}`);

      } catch (error) {
        console.error(`[FAILED] requestId: ${requestId}`, error.message);
        await Translation.findByIdAndUpdate(requestId, { $set: { status: 'failed', errorMessage: error.message } });
      } finally {
        channel.ack(msg);
      }
    }
  }, { noAck: false });
};

startWorker();