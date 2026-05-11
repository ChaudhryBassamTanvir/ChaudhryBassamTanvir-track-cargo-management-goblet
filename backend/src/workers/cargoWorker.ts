import { consume, QUEUES } from '../queues/rabbitMQ';
import { snsPublish } from '../queues/awsQueues';
import { emit } from '../socket';
import Cargo from '../models/Cargo';
import Truck from '../models/Truck';
import logger from '../config/logger';
import { CargoEvent } from '../types';

export const start = (): void => {
  consume(QUEUES.CARGO_EVENTS, async (raw) => {
    const data = raw as CargoEvent;
    const { type, cargoId, payload } = data;

    if (type === 'STATUS_UPDATE' && cargoId) {
      const status = payload['status'] as string;

      // Update cargo
      const cargo = await Cargo.findByIdAndUpdate(
        cargoId,
        {
          status,
          $push: { events: { action: status, notes: payload['notes'] } },
        },
        { new: true }
      );

      // Sync truck status based on cargo status
      if (cargo?.truck) {
        let truckStatus = 'idle';
        if (status === 'in-transit') truckStatus = 'in-transit';
        if (status === 'loaded')     truckStatus = 'in-transit';
        if (status === 'delivered')  truckStatus = 'idle';
        if (status === 'failed')     truckStatus = 'idle';

        // Update truck location based on cargo route
        const locationMap: Record<string, { lat: number; lng: number }> = {
          karachi:    { lat: 24.86,  lng: 67.01 },
          lahore:     { lat: 31.52,  lng: 74.36 },
          islamabad:  { lat: 33.72,  lng: 73.06 },
          peshawar:   { lat: 34.01,  lng: 71.57 },
          quetta:     { lat: 30.18,  lng: 67.00 },
          multan:     { lat: 30.19,  lng: 71.47 },
          faisalabad: { lat: 31.41,  lng: 73.07 },
          rawalpindi: { lat: 33.60,  lng: 73.04 },
          hyderabad:  { lat: 25.39,  lng: 68.37 },
          sialkot:    { lat: 32.49,  lng: 74.53 },
        };

        // If in-transit → move to origin, if delivered → move to destination
        const originKey    = (cargo.origin      ?? '').toLowerCase().trim();
        const destKey      = (cargo.destination ?? '').toLowerCase().trim();
        const targetCity   = status === 'delivered' ? destKey : originKey;
        const newLocation  = locationMap[targetCity];

        await Truck.findByIdAndUpdate(cargo.truck, {
          status: truckStatus,
          ...(newLocation ? { location: newLocation } : {}),
        });

        emit('truck:update', null, {
          truckId: cargo.truck,
          status: truckStatus,
          location: newLocation,
        });
      }

      // Notify frontend
      emit('cargo:update', `cargo:${cargoId}`, { cargoId, ...payload });

      if (status === 'delivered') {
        await snsPublish('Cargo Delivered', { cargoId, ...payload });
      }
    }

    logger.info(`CargoWorker processed: ${type}`);
  });

  logger.info('CargoWorker started');
};