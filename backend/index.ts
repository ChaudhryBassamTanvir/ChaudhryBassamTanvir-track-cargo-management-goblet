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
import * as cargoWorker from './workers/cargoWorker';
import * as alertWorker from './workers/alertWorker';
import * as recoveryWorker from './workers/recoveryWorker';
import cargoRoutes from './routes/cargo';
import truckRoutes from './routes/trucks';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

app.use('/api/cargo', cargoRoutes);
app.use('/api/trucks', truckRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));
app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await connect();
    await connectRabbit();
    socket.init(server);

    watchChanges((event) => {
      publish(QUEUES.CARGO_EVENTS, { type: 'DB_CHANGE', event });
      socket.emit('db:change', null, { collection: event.ns?.coll, op: event.operationType });
    });

    cargoWorker.start();
    alertWorker.start();
    recoveryWorker.start();

    server.listen(process.env.PORT ?? 4000, () =>
      logger.info(`Server running on port ${process.env.PORT ?? 4000}`)
    );
  } catch (err) {
    logger.error('Boot failed', err);
    process.exit(1);
  }
};

start();