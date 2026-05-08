import { Router } from 'express';
import Driver from '../models/Driver';
import Truck from '../models/Truck';

const router = Router();
const handle = (fn: any) => (req: any, res: any, next: any) => fn(req, res, next).catch(next);

router.get('/', handle(async (_req: any, res: any) => {
  const drivers = await Driver.find().populate('assignedTruck').sort({ createdAt: -1 });
  res.json(drivers);
}));

router.post('/', handle(async (req: any, res: any) => {
  const driver = await Driver.create(req.body);
  res.status(201).json(driver);
}));

router.patch('/:id', handle(async (req: any, res: any) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (req.body.assignedTruck) {
    await Truck.findByIdAndUpdate(req.body.assignedTruck, { driver: req.params.id });
  }
  res.json(driver);
}));

router.delete('/:id', handle(async (req: any, res: any) => {
  await Driver.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}));

export default router;