const { consume, QUEUES } = require('../queues/rabbitMQ');
const { emit } = require('../socket');
const logger = require('../config/logger');

const start = () => {
  consume(QUEUES.ALERTS, async (data) => {
    // Broadcast alert to all connected clients
    emit('alert', null, data);
    logger.info('Alert dispatched', data);
  });

  logger.info('AlertWorker started');
};

module.exports = { start };