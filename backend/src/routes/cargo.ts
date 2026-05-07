const express = require('express');
const router = express.Router();
const Cargo = require('../models/Cargo');
const { publish, QUEUES } = require('../queues/rabbitMQ');
const logger = require('../config/logger');

// Reusable error handler
const handle = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', handle(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const cargo = await Cargo.find(filter).populate('truck')
    .skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 });
  res.json({ data: cargo, page: +page });
}));

router.post('/', handle(async (req, res) => {
  const cargo = await Cargo.create(req.body);
  publish(QUEUES.CARGO_EVENTS, { type: 'CREATED', cargoId: cargo._id, payload: cargo });
  res.status(201).json(cargo);
}));

router.patch('/:id/status', handle(async (req, res) => {
  const { status, notes } = req.body;
  const cargo = await Cargo.findByIdAndUpdate(
    req.params.id,
    { status, $push: { events: { action: status, notes } } },
    { new: true }
  );
  publish(QUEUES.CARGO_EVENTS, { type: 'STATUS_UPDATE', cargoId: cargo._id, payload: { status, notes } });
  res.json(cargo);
}));

router.delete('/:id', handle(async (req, res) => {
  await Cargo.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}));

module.exports = router;