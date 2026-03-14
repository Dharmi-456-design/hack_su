const mongoose = require('mongoose');

// ─── Inventory Item ─────────────────────────────────────────────
const InventorySchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Raw Material', 'Consumable', 'Tool', 'Spare Part', 'Finished Good', 'Safety'],
    required: true
  },
  unit: { type: String, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 1000 },
  unitCost: { type: Number, default: 0 },
  supplier: { type: String },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-check if low stock
InventorySchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minStock;
});

// ─── Production Entry ───────────────────────────────────────────
const ProductionSchema = new mongoose.Schema({
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  productName: { type: String, required: true },
  targetQuantity: { type: Number, required: true },
  producedQuantity: { type: Number, default: 0 },
  shift: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

ProductionSchema.virtual('efficiency').get(function() {
  return ((this.producedQuantity / this.targetQuantity) * 100).toFixed(2);
});

// ─── Maintenance Log ────────────────────────────────────────────
const MaintenanceSchema = new mongoose.Schema({
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  issueDescription: { type: String, required: true },
  technician: { type: String, required: true }, // Or objectId to user if technician is a user
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  date: { type: Date, required: true },
  notes: { type: String }
}, { timestamps: true });

// ─── Activity Log ───────────────────────────────────────────────
const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: String },
  date: { type: Date, default: Date.now }
});

// ─── Alert ──────────────────────────────────────────────────────
const AlertSchema = new mongoose.Schema({
  type: { type: String, enum: ['critical', 'warning', 'info'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Production: mongoose.model('Production', ProductionSchema),
  Maintenance: mongoose.model('Maintenance', MaintenanceSchema),
  ActivityLog: mongoose.model('ActivityLog', ActivityLogSchema),
  Alert: mongoose.model('Alert', AlertSchema),
  Inventory: mongoose.model('Inventory', InventorySchema),
};
