// routes/machineRoutes.js
const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');
const { protect, authorize } = require('../middleware/auth');

// GET /api/machines — get all machines
router.get('/', protect, async (req, res) => {
  try {
    const { status, location } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (location) filter.location = location;
    const machines = await Machine.find(filter).populate('assignedOperator', 'name email');
    res.json({ success: true, count: machines.length, data: machines });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/machines/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id).populate('assignedOperator', 'name email');
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    res.json({ success: true, data: machine });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/machines — create machine (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const machine = await Machine.create(req.body);
    req.app.get('io').emit('machineUpdated', machine);
    res.status(201).json({ success: true, data: machine });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/machines/:id — update machine
router.put('/:id', protect, authorize('Admin', 'Manager', 'Operator'), async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedOperator', 'name email');
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    req.app.get('io').emit('machineUpdated', machine);
    res.json({ success: true, data: machine });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/machines/:id/sensors — update sensor readings
router.put('/:id/sensors', protect, async (req, res) => {
  try {
    const { temperature, vibration, runtime, efficiency } = req.body;
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { 'sensors.temperature': temperature, 'sensors.vibration': vibration, 'sensors.runtime': runtime, efficiency },
      { new: true }
    );
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    req.app.get('io').emit('machineData', machine);
    res.json({ success: true, data: machine });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/machines/:id
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    req.app.get('io').emit('machineDeleted', req.params.id);
    res.json({ success: true, message: 'Machine deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
