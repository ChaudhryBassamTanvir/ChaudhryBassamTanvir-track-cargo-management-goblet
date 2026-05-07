const { consume, QUEUES } = require('../queues/rabbitMQ');
const { snsPublish } = require('../queues/awsQueues');
const { emit } = require('../socket');
const Cargo = require('../models/Cargo');
const logger = require('../config/logger');

const start = () => {
  consume(QUEUES.CARGO_EVENTS, async (data) => {
    const { type, cargoId, payload } = data;

    if (type === 'STATUS_UPDATE') {
      await Cargo.findByIdAndUpdate(cargoId, {
        status: payload.status,
        $push: { events: { action: payload.status, notes: payload.notes } }
      });

      // Notify frontend via socket
      emit('cargo:update', `cargo:${cargoId}`, { cargoId, ...payload });

      // SNS notification for delivery
      if (payload.status === 'delivered') {
        await snsPublish('Cargo Delivered', { cargoId, ...payload });
      }
    }

    logger.info(`CargoWorker processed: ${type}`);
  });

  logger.info('CargoWorker started');
};

module.exports = { start };