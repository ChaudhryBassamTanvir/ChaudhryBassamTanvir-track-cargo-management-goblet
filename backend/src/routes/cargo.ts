import { Router, Request, Response, NextFunction } from 'express';
import Cargo from '../models/Cargo';
import Truck from '../models/Truck';
import { publish, QUEUES } from '../queues/rabbitMQ';
import { emit } from '../socket';

const router = Router();

const handle =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

const LOCATION_MAP: Record<string, { lat: number; lng: number }> = {
  karachi:    { lat: 24.86, lng: 67.01 },
  lahore:     { lat: 31.52, lng: 74.36 },
  islamabad:  { lat: 33.72, lng: 73.06 },
  peshawar:   { lat: 34.01, lng: 71.57 },
  quetta:     { lat: 30.18, lng: 67.00 },
  multan:     { lat: 30.19, lng: 71.47 },
  faisalabad: { lat: 31.41, lng: 73.07 },
  rawalpindi: { lat: 33.60, lng: 73.04 },
  hyderabad:  { lat: 25.39, lng: 68.37 },
  sialkot:    { lat: 32.49, lng: 74.53 },
};

const getTruckStatus = (cargoStatus: string) => {
  if (cargoStatus === 'in-transit') return 'in-transit';
  if (cargoStatus === 'loaded')     return 'in-transit';
  if (cargoStatus === 'delivered')  return 'idle';
  if (cargoStatus === 'failed')     return 'idle';
  return 'idle';
};

router.get(
  '/',
  handle(async (req, res) => {
    const { status, search, page = '1', limit = '20', truckId } =
      req.query as Record<string, string>;

    const filter: Record<string, any> = {};
    if (status)  filter.status = status;
    if (truckId) filter.truck  = truckId;
    if (search)
      filter.$or = [
        { trackingId:  { $regex: search, $options: 'i' } },
        { origin:      { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
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

    // 1. Update cargo status
    const cargo = await Cargo.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { events: { action: status, notes } },
      },
      { new: true }
    );

    if (!cargo) {
      res.status(404).json({ error: 'Cargo not found' });
      return;
    }

    // 2. Update truck status + location immediately
    if (cargo.truck) {
      const truckStatus = getTruckStatus(status);

      // Pick city based on cargo status
      const cityKey =
        status === 'delivered'
          ? (cargo.destination ?? '').toLowerCase().trim()
          : (cargo.origin ?? '').toLowerCase().trim();

      const location = LOCATION_MAP[cityKey];

      const updatedTruck = await Truck.findByIdAndUpdate(
        cargo.truck,
        {
          status: truckStatus,
          ...(location ? { location } : {}),
        },
        { new: true }
      );

      // 3. Emit truck update to all connected clients
      emit('truck:update', null, {
        truckId:  cargo.truck,
        status:   truckStatus,
        location: location ?? updatedTruck?.location,
      });
    }

    // 4. Publish to RabbitMQ for workers
    publish(QUEUES.CARGO_EVENTS, {
      type:    'STATUS_UPDATE',
      cargoId: req.params.id,
      payload: { status, notes },
    });

    // 5. Emit cargo update to socket
    emit('cargo:update', `cargo:${req.params.id}`, { cargoId: req.params.id, status, notes });

    res.json(cargo);
  })
);

router.delete(
  '/:id',
  handle(async (req, res) => {
    const cargo = await Cargo.findByIdAndDelete(req.params.id);

    // Reset truck to idle if this cargo was assigned
    if (cargo?.truck) {
      await Truck.findByIdAndUpdate(cargo.truck, { status: 'idle' });
    }

    res.json({ success: true });
  })
);

export default router;