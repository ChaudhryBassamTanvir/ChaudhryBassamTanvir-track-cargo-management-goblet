require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connect, watchChanges } = require('./config/database');
const { connect: connectRabbit, publish, QUEUES } = require('./queues/rabbitMQ');
const socket = require('./socket');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Workers
const cargoWorker = require('./workers/cargoWorker');
const alertWorker = require('./workers/alertWorker');
const recoveryWorker = require('./workers/recoveryWorker');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

// Routes
app.use('/api/cargo', require('./routes/cargo'));
app.use('/api/trucks', require('./routes/trucks'));

// Health check — visibility endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Error handler
app.use(errorHandler);

// Boot
const start = async () => {
  try {
    await connect();
    await connectRabbit();

    // Init socket
    socket.init(server);

    // MongoDB change stream → RabbitMQ (DB triggering)
    watchChanges((event) => {
      publish(QUEUES.CARGO_EVENTS, { type: 'DB_CHANGE', event });
      socket.emit('db:change', null, { collection: event.ns?.coll, op: event.operationType });
    });

    // Start all workers
    cargoWorker.start();
    alertWorker.start();
    recoveryWorker.start();

    server.listen(process.env.PORT, () =>
      logger.info(`Server running on port ${process.env.PORT}`)
    );
  } catch (err) {
    logger.error('Boot failed', err);
    process.exit(1);
  }
};

start();