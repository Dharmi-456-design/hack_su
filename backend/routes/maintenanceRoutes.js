// routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const { Maintenance } = require('../models/index');
const Machine = require('../models/Machine');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const records = await Maintenance.find().populate('machine', 'name machineId').sort({ date: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const record = await Maintenance.create(req.body);
    const populated = await Maintenance.findById(record._id).populate('machine', 'name machineId');
    req.app.get('io').emit('maintenanceAdded', populated);
    
    // Auto-update machine status if necessary
    if (record.status === 'In Progress') {
      await Machine.findByIdAndUpdate(record.machine, { status: 'Maintenance' });
      req.app.get('io').emit('machineUpdated', await Machine.findById(record.machine));
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('machine', 'name machineId');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    req.app.get('io').emit('maintenanceUpdated', record);
    
    if (record.status === 'Completed') {
      await Machine.findByIdAndUpdate(record.machine, { status: 'Running' });
      req.app.get('io').emit('machineUpdated', await Machine.findById(record.machine));
    } else if (record.status === 'In Progress') {
      await Machine.findByIdAndUpdate(record.machine, { status: 'Maintenance' });
      req.app.get('io').emit('machineUpdated', await Machine.findById(record.machine));
    }

    res.json({ success: true, data: record });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    req.app.get('io').emit('maintenanceDeleted', req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Predictive maintenance placeholder
router.get('/predict', protect, async (req, res) => {
  try {
    const machines = await Machine.find();
    const predictions = machines.map(m => {
      let riskScore = 0;
      if (m.sensors.temperature > 95) riskScore += 40;
      else if (m.sensors.temperature > 80) riskScore += 20;
      if (m.sensors.vibration > 2) riskScore += 30;
      else if (m.sensors.vibration > 1) riskScore += 15;
      if (m.efficiency < 60) riskScore += 15;
      else if (m.efficiency < 80) riskScore += 8;
      return {
        machineId: m.machineId, name: m.name,
        riskScore: Math.min(100, riskScore),
        riskLevel: riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW',
      };
    });
    res.json({ success: true, data: predictions.sort((a, b) => b.riskScore - a.riskScore) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
