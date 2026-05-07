import mongoose from 'mongoose';
import logger from './logger';
import { DbChangeEvent } from '../types';

export const connect = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  logger.info('MongoDB connected');
};

export const watchChanges = (onEvent: (event: DbChangeEvent) => void): void => {
  const db = mongoose.connection.db;
  const changeStream = db.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', (event: DbChangeEvent) => {
    logger.info(`DB trigger: ${event.operationType} on ${event.ns?.coll}`);
    onEvent(event);
  });

  changeStream.on('error', (err: Error) => {
    logger.error('Change stream error', err);
    setTimeout(() => watchChanges(onEvent), 3000);
  });
};