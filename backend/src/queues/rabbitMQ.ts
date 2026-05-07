import amqp, { Channel } from 'amqplib';
import logger from '../config/logger';

let channel: Channel | null = null;

export const QUEUES = {
  CARGO_EVENTS: 'cargo.events',
  ROUTE_EVENTS: 'route.events',
  ALERTS: 'alerts',
  DEAD_LETTER: 'dead.letter'
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];

export const connect = async (): Promise<Channel> => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL as string);
  channel = await conn.createChannel();

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

export const publish = (queue: QueueName, message: unknown): void => {
  if (!channel) throw new Error('RabbitMQ not connected');
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  logger.info(`Published to ${queue}`);
};

export const consume = (queue: QueueName, handler: (data: unknown) => Promise<void>): void => {
  if (!channel) throw new Error('RabbitMQ not connected');
  channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const data: unknown = JSON.parse(msg.content.toString());
      await handler(data);
      channel!.ack(msg);
    } catch (err) {
      logger.error(`Worker error on ${queue}`, err);
      channel!.nack(msg, false, false);
    }
  });
};