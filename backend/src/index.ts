import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { connect, watchChanges } from './config/database';
import { connect as connectRabbit, publish, QUEUES } from './queues/rabbitMQ';
import * as socket from './socket';
import { errorHandler } from './middleware/errorHandler';
import logger from './config/logger';

import * as cargoWorker    from './workers/cargoWorker';
import * as alertWorker    from './workers/alertWorker';
import * as recoveryWorker from './workers/recoveryWorker';

import cargoRoutes     from './routes/cargo';
import truckRoutes     from './routes/trucks';
import authRoutes      from './routes/auth';
import driverRoutes    from './routes/drivers';
import analyticsRoutes from './routes/analytics';

import { protect } from './middleware/auth';

const app    = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.use('/api/auth',      authRoutes);
app.use('/api/cargo',     protect, cargoRoutes);
app.use('/api/trucks',    protect, truckRoutes);
app.use('/api/drivers',   protect, driverRoutes);
app.use('/api/analytics', protect, analyticsRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date() })
);

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    // 1. Connect MongoDB
    await connect();

    // 2. Try RabbitMQ — warn and continue if not available
    let rabbitConnected = false;
    try {
      await connectRabbit();
      rabbitConnected = true;
      logger.info('RabbitMQ connected');
    } catch {
      logger.warn('RabbitMQ unavailable — queues and workers disabled. API still works.');
    }

    // 3. Init WebSocket
    socket.init(server);

    // 4. MongoDB change stream — works without RabbitMQ
    watchChanges((event) => {
      if (rabbitConnected) {
        publish(QUEUES.CARGO_EVENTS, { type: 'DB_CHANGE', event });
      }
      socket.emit('db:change', null, {
        collection: event.ns?.coll,
        op: event.operationType,
      });
    });

    // 5. Start workers only if RabbitMQ is up
    if (rabbitConnected) {
      cargoWorker.start();
      alertWorker.start();
      recoveryWorker.start();
    }

    const PORT = process.env.PORT ?? 4000;
    server.listen(PORT, () =>
      logger.info(`Server running on port ${PORT}`)
    );

  } catch (err) {
    logger.error('Boot failed', err);
    process.exit(1);
  }
};

start();