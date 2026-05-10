import mongoose from 'mongoose';

const CargoSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true },
    truck:      { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', default: null },
    origin:     { type: String, required: true },
    destination:{ type: String, required: true },
    weight:     { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'loaded', 'in-transit', 'delivered', 'failed'],
      default: 'pending',
    },
    events: [
      {
        action:    String,
        timestamp: { type: Date, default: Date.now },
        notes:     String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Cargo', CargoSchema);