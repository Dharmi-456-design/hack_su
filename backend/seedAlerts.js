const mongoose = require('mongoose');
const { Alert } = require('./models/index');
require('dotenv').config();

const dummyAlerts = [
  {
    title: 'Temperature Critical',
    message: 'Machine temperature exceeded safe threshold (108.5°C)',
    type: 'critical',
    machine: 'Hydraulic Press HP-2',
    category: 'Hardware',
    time: new Date().toLocaleTimeString(),
    date: new Date().toISOString(),
    read: false
  },
  {
    title: 'Vibration Anomaly Detected',
    message: 'Bearing wear indicator triggered. Maintenance required.',
    type: 'warning',
    machine: 'CNC Milling Unit 4',
    category: 'Predictive',
    time: new Date(Date.now() - 3600000).toLocaleTimeString(),
    date: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    title: 'Energy Spike Detected',
    message: 'Power consumption increased by 45% unexpectedly.',
    type: 'warning',
    machine: 'Injection Mold IM1',
    category: 'Energy',
    time: new Date(Date.now() - 7200000).toLocaleTimeString(),
    date: new Date(Date.now() - 7200000).toISOString(),
    read: false
  },
  {
    title: 'Routine Status Check Passed',
    message: 'All sensor diagnostics operating at normal ranges (< 75°C, < 1.0mm/s).',
    type: 'safe',
    machine: 'Laser Cutter LC9',
    category: 'Diagnostics',
    time: new Date(Date.now() - 86400000).toLocaleTimeString(),
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true
  },
  {
    title: 'System Firmware Update Complete',
    message: 'Software patched to v3.12.5. Systems rebooted successfully.',
    type: 'info',
    machine: 'Server Controller A',
    category: 'System',
    time: new Date(Date.now() - 172800000).toLocaleTimeString(),
    date: new Date(Date.now() - 172800000).toISOString(),
    read: true
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartfactory')
  .then(async () => {
    console.log('DB Connected. Seeding alerts...');
    await Alert.deleteMany({});
    await Alert.insertMany(dummyAlerts);
    console.log('✅ Alerts Seeded Successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
