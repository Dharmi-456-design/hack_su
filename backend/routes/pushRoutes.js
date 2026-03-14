const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// For Demo/Hackathon purposes, generate on the fly and hold in memory.
// REAL APP: Store these securely and reuse.
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto:support@smartfactory.in',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];
let logs = [];

// 1. Get Vapid Public Key
router.get('/public-key', (req, res) => {
  res.status(200).json({ publicKey: vapidKeys.publicKey });
});

// 2. Subscribe a user
router.post('/subscribe', (req, res) => {
  const { userId, token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token (subscription) is required' });

  // Store subscription (mock)
  const existing = subscriptions.find(s => s.token.endpoint === token.endpoint);
  if (!existing) {
    subscriptions.push({ userId, token });
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});

// 3. Send Notification
router.post('/send', async (req, res) => {
  const { title, message, machine, alertType } = req.body;
  
  const payload = JSON.stringify({
    title: title || 'Smart Factory Alert',
    body: message || 'Critical problem detected.',
    icon: '/vite.svg',
    data: { machine, alertType }
  });

  const logEntry = {
    _id: Date.now().toString(), // Mock ID
    date: new Date().toISOString(),
    machine: machine || 'System',
    alertType: alertType || 'Alert',
    status: 'Pending',
    title,
    message
  };
  
  logs.push(logEntry);
  const currentLogIndex = logs.length - 1;
  
  let successCount = 0;
  
  const pushPromises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(sub.token, payload);
      successCount++;
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Clean up dead subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        subscriptions = subscriptions.filter(s => s.token.endpoint !== sub.token.endpoint);
      }
    }
  });

  await Promise.all(pushPromises);
  
  logs[currentLogIndex].status = successCount > 0 ? 'Sent' : 'Failed';
  
  // also emit socket event if possible, but Web Push covers strictly the mobile/OS level payload.
  res.status(200).json({ message: 'Notifications fired', successCount, log: logs[currentLogIndex] });
});

// 4. Get Push Logs
router.get('/logs', (req, res) => {
  // Return logs reversed (newest first)
  res.status(200).json({ data: [...logs].reverse() });
});

module.exports = router;
