import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    phone:         { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['available', 'on-trip', 'off-duty'],
      default: 'available',
    },
    assignedTruck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      default: null,
    },
    totalTrips: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Driver', DriverSchema);