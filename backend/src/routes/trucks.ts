import { Router, Request, Response, NextFunction } from 'express';
import Truck from '../models/Truck';
import { publish, QUEUES } from '../queues/rabbitMQ';

const router = Router();

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
const handle = (fn: Handler) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res, next).catch(next);

router.get('/', handle(async (_req, res) => {
  const trucks = await Truck.find().sort({ createdAt: -1 });
  res.json(trucks);
}));

router.post('/', handle(async (req, res) => {
  const truck = await Truck.create(req.body);
  res.status(201).json(truck);
}));

router.patch('/:id', handle(async (req, res) => {
  const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
  publish(QUEUES.ROUTE_EVENTS, { type: 'TRUCK_UPDATE', truckId: req.params.id, payload: truck });
  res.json(truck);
}));

export default router;