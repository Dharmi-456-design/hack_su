// routes/workerRoutes.js
const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const workers = await Worker.find().populate('assignedMachine', 'name machineId');
    res.json({ success: true, count: workers.length, data: workers });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const worker = await Worker.findOne({ workerId: req.params.id }).populate('assignedMachine');
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json({ success: true, data: worker });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const worker = await Worker.findOneAndUpdate({ workerId: req.params.id }, req.body, { new: true });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const worker = await Worker.findOneAndDelete({ workerId: req.params.id });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
