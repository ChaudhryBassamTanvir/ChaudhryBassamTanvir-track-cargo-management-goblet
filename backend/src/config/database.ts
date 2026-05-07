const mongoose = require('mongoose');
const logger = require('./logger');

let changeStreamEmitter = null;

const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('MongoDB connected');
};

// DB trigger — watches ALL changes and emits to queue/socket
const watchChanges = (onEvent) => {
  const db = mongoose.connection.db;
  const changeStream = db.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', (event) => {
    logger.info(`DB trigger: ${event.operationType} on ${event.ns?.coll}`);
    onEvent(event);
  });

  changeStream.on('error', (err) => {
    logger.error('Change stream error', err);
    setTimeout(() => watchChanges(onEvent), 3000); // auto-restart
  });

  return changeStream;
};

module.exports = { connect, watchChanges };