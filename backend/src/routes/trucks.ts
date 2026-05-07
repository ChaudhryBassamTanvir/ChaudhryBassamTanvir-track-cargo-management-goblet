const express = require('express');
const router = express.Router();
const Truck = require('../models/Truck');
const { publish, QUEUES } = require('../queues/rabbitMQ');

const handle = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', handle(async (req, res) => {
  const trucks = await Truck.find().sort({ createdAt: -1 });
  res.json(trucks);
}));

router.post('/', handle(async (req, res) => {
  const truck = await Truck.create(req.body);
  res.status(201).json(truck);
}));

router.patch('/:id', handle(async (req, res) => {
  const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
  publish(QUEUES.ROUTE_EVENTS, { type: 'TRUCK_UPDATE', truckId: truck._id, payload: truck });
  res.json(truck);
}));

module.exports = router;