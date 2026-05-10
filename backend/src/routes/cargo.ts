import { Router, Request, Response, NextFunction } from 'express';
import Cargo from '../models/Cargo';
import { publish, QUEUES } from '../queues/rabbitMQ';

const router = Router();

const handle =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

router.get(
  '/',
  handle(async (req, res) => {
    const { status, search, page = '1', limit = '20', truckId } =
      req.query as Record<string, string>;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (truckId) filter.truck = truckId;
    if (search)
      filter.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { origin:     { $regex: search, $options: 'i' } },
        { destination:{ $regex: search, $options: 'i' } },
      ];

    const [data, total] = await Promise.all([
      Cargo.find(filter)
        .populate('truck')
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort({ createdAt: -1 }),
      Cargo.countDocuments(filter),
    ]);

    res.json({ data, total, page: +page, pages: Math.ceil(total / +limit) });
  })
);

router.post(
  '/',
  handle(async (req, res) => {
    const cargo = await Cargo.create(req.body);
    publish(QUEUES.CARGO_EVENTS, {
      type: 'CREATED',
      cargoId: cargo._id,
      payload: cargo,
    });
    res.status(201).json(cargo);
  })
);

router.patch(
  '/:id/status',
  handle(async (req, res) => {
    const { status, notes } = req.body as { status: string; notes?: string };
    const cargo = await Cargo.findByIdAndUpdate(
      req.params.id,
      { status, $push: { events: { action: status, notes } } },
      { new: true }
    );
    publish(QUEUES.CARGO_EVENTS, {
      type: 'STATUS_UPDATE',
      cargoId: req.params.id,
      payload: { status, notes },
    });
    res.json(cargo);
  })
);

router.delete(
  '/:id',
  handle(async (req, res) => {
    await Cargo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  })
);

export default router;