const amqp = require('amqplib');
const logger = require('../config/logger');

let channel = null;

const QUEUES = {
  CARGO_EVENTS: 'cargo.events',
  ROUTE_EVENTS: 'route.events',
  ALERTS: 'alerts',
  DEAD_LETTER: 'dead.letter'
};

const connect = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();

  // Declare all queues with dead-letter routing
  for (const q of Object.values(QUEUES)) {
    await channel.assertQueue(q, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': QUEUES.DEAD_LETTER
      }
    });
  }

  logger.info('RabbitMQ connected');
  return channel;
};

// Reusable publish
const publish = (queue, message) => {
  if (!channel) throw new Error('RabbitMQ not connected');
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  logger.info(`Published to ${queue}`, message);
};

// Reusable consume
const consume = (queue, handler) => {
  if (!channel) throw new Error('RabbitMQ not connected');
  channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      channel.ack(msg);
    } catch (err) {
      logger.error(`Worker error on ${queue}`, err);
      channel.nack(msg, false, false); // send to dead-letter
    }
  });
};

module.exports = { connect, publish, consume, QUEUES };