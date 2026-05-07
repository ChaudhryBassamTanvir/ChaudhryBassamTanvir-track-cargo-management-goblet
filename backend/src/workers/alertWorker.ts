import { consume, QUEUES } from '../queues/rabbitMQ';
import { emit } from '../socket';
import logger from '../config/logger';

export const start = (): void => {
  consume(QUEUES.ALERTS, async (data) => {
    emit('alert', null, data);
    logger.info('Alert dispatched', data as object);
  });

  logger.info('AlertWorker started');
};