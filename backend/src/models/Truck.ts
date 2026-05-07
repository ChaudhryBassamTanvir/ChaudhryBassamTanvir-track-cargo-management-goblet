const mongoose = require('mongoose');

const TruckSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  status: { type: String, enum: ['idle', 'in-transit', 'maintenance'], default: 'idle' },
  location: { lat: Number, lng: Number },
  capacity: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Truck', TruckSchema);