import { sqsPoll } from '../queues/awsQueues';
import { publish, QUEUES, QueueName } from '../queues/rabbitMQ';
import logger from '../config/logger';

export const start = (): void => {
  const poll = async (): Promise<void> => {
    await sqsPoll(async (msg) => {
      const m = msg as { originalQueue?: QueueName };
      logger.info('Recovery: retrying failed message');
      publish(m.originalQueue ?? QUEUES.CARGO_EVENTS, msg);
    });
    setTimeout(poll, 15000);
  };

  poll();
  logger.info('RecoveryWorker started');
};