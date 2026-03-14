// routes/productionRoutes.js
const express = require('express');
const router = express.Router();
const { Production } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const entries = await Production.find().populate('machine', 'name machineId location').sort({ date: -1 });
    res.json({ success: true, count: entries.length, data: entries });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, authorize('Admin', 'Manager', 'Operator'), async (req, res) => {
  try {
    const entry = await Production.create(req.body);
    const populated = await Production.findById(entry._id).populate('machine', 'name machineId location');
    req.app.get('io').emit('productionAdded', populated);
    res.status(201).json({ success: true, data: populated });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', protect, authorize('Admin', 'Manager', 'Operator'), async (req, res) => {
  try {
    const entry = await Production.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('machine', 'name machineId location');
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    req.app.get('io').emit('productionUpdated', entry);
    res.json({ success: true, data: entry });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    await Production.findByIdAndDelete(req.params.id);
    req.app.get('io').emit('productionDeleted', req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
