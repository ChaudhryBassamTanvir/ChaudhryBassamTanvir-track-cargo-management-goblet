import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { sqsSend } from '../queues/awsQueues';

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if ((err.statusCode ?? 500) >= 500) {
    sqsSend({ error: err.message, path: req.path, body: req.body, originalQueue: 'cargo.events' });
  }

  res.status(err.statusCode ?? 500).json({ error: err.message || 'Internal Server Error' });
};