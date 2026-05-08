import { Router } from 'express';
import Cargo from '../models/Cargo';
import Truck from '../models/Truck';
import Driver from '../models/Driver';

const router = Router();

router.get('/summary', async (_req, res, next) => {
  try {
    const [cargoByStatus, truckByStatus, totalCargo, totalTrucks, totalDrivers, recentCargo] = await Promise.all([
      Cargo.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Truck.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Cargo.countDocuments(),
      Truck.countDocuments(),
      Driver.countDocuments(),
      Cargo.find().sort({ createdAt: -1 }).limit(5).populate('truck')
    ]);
    res.json({ cargoByStatus, truckByStatus, totalCargo, totalTrucks, totalDrivers, recentCargo });
  } catch (err) { next(err); }
});

router.get('/timeline', async (_req, res, next) => {
  try {
    const data = await Cargo.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    res.json(data);
  } catch (err) { next(err); }
});

export default router;