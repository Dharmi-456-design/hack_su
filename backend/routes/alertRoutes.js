const express = require('express');
const router = express.Router();
const { Alert } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/unread', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ read: false }).sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, data: alert });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    await Alert.updateMany({ read: false }, { read: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    req.app.get('io').emit('alertAdded', alert);
    res.status(201).json({ success: true, data: alert });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

