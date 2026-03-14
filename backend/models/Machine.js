const mongoose = require('mongoose');

/**
 * Machine Schema — stores machine health and performance data
 */
const MachineSchema = new mongoose.Schema({
  machineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['Running', 'Idle', 'Maintenance'],
    default: 'Idle'
  },
  assignedOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  installationDate: { type: Date, default: Date.now },
  // Keeping additional metric fields for the real-time dynamic dashboard
  sensors: {
    temperature: { type: Number, default: 0 },
    vibration:   { type: Number, default: 0 },
    runtime:     { type: Number, default: 0 },
  },
  efficiency: { type: Number, default: 100, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Machine', MachineSchema);
