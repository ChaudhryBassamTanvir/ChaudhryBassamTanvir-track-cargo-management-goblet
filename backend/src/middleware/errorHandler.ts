const logger = require('../config/logger');
const { sqsSend } = require('../queues/awsQueues');

// Global error handler — logs + queues failed requests for recovery
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  // Queue recoverable errors to SQS
  if (err.statusCode >= 500) {
    sqsSend({ error: err.message, path: req.path, body: req.body, originalQueue: 'cargo.events' });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;