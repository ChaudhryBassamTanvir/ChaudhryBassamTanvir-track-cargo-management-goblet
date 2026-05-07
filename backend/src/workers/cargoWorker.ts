import { consume, QUEUES } from '../queues/rabbitMQ';
import { snsPublish } from '../queues/awsQueues';
import { emit } from '../socket';
import Cargo from '../models/Cargo';
import logger from '../config/logger';
import { CargoEvent } from '../types';

export const start = (): void => {
  consume(QUEUES.CARGO_EVENTS, async (raw) => {
    const data = raw as CargoEvent;
    const { type, cargoId, payload } = data;

    if (type === 'STATUS_UPDATE' && cargoId) {
      await Cargo.findByIdAndUpdate(cargoId, {
        status: payload['status'],
        $push: { events: { action: payload['status'], notes: payload['notes'] } }
      });

      emit('cargo:update', `cargo:${cargoId}`, { cargoId, ...payload });

      if (payload['status'] === 'delivered') {
        await snsPublish('Cargo Delivered', { cargoId, ...payload });
      }
    }

    logger.info(`CargoWorker processed: ${type}`);
  });

  logger.info('CargoWorker started');
};