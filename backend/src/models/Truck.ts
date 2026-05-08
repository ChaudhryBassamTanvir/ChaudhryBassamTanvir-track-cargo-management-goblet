import mongoose from 'mongoose';

const TruckSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  status: { type: String, enum: ['idle', 'in-transit', 'maintenance'], default: 'idle' },
  location: { lat: { type: Number, default: 31.5204 }, lng: { type: Number, default: 74.3587 } },
  capacity: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Truck', TruckSchema);