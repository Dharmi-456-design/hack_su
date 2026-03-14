// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { Inventory } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/low-stock', protect, async (req, res) => {
  try {
    const items = await Inventory.find({ $expr: { $lte: ['$stock', '$minStock'] } });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate({ itemId: req.params.id }, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({ itemId: req.params.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
