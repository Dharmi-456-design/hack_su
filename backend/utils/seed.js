/**
 * SmartFactory — Full Database Seed Script
 * Run: node utils/seed.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Machine = require('../models/Machine');
const Worker  = require('../models/Worker');
const User    = require('../models/User');
const { Production, Maintenance, Alert, ActivityLog, Inventory } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartfactory';

const SEED_MACHINES = [
  { machineId:'M001', name:'CNC Lathe Alpha',      location:'Bay A1', status:'Running',     sensors:{ temperature:68, vibration:0.3, runtime:1420 }, efficiency:94 },
  { machineId:'M002', name:'Hydraulic Press X2',   location:'Bay B2', status:'Running',     sensors:{ temperature:89, vibration:1.2, runtime:2100 }, efficiency:71 },
  { machineId:'M003', name:'Welding Bot WB-7',      location:'Bay C1', status:'Idle',        sensors:{ temperature:72, vibration:0.5, runtime: 980 }, efficiency:98 },
  { machineId:'M004', name:'Mill Pro 5000',          location:'Bay A3', status:'Maintenance', sensors:{ temperature:104,vibration:2.8, runtime:3200 }, efficiency:45 },
  { machineId:'M005', name:'Conveyor Belt C3',       location:'Bay D1', status:'Running',     sensors:{ temperature:45, vibration:0.2, runtime:4100 }, efficiency:99 },
  { machineId:'M006', name:'Drill Press DP-2',       location:'Bay A2', status:'Idle',        sensors:{ temperature:25, vibration:0.0, runtime:   0 }, efficiency:0  },
  { machineId:'M007', name:'Injection Mold IM1',     location:'Bay E1', status:'Running',     sensors:{ temperature:78, vibration:0.4, runtime:2300 }, efficiency:91 },
  { machineId:'M008', name:'Laser Cutter LC9',       location:'Bay F1', status:'Running',     sensors:{ temperature:85, vibration:0.9, runtime:1750 }, efficiency:76 },
];

const SEED_USERS = [
  { name:'Rajesh Kumar',  email:'admin@factory.com',   password:'admin123',   role:'Admin',    department:'Management' },
  { name:'Kavya Iyer',    email:'manager@factory.com', password:'manager123', role:'Manager',  department:'Production' },
  { name:'Arjun Sharma',  email:'worker@factory.com',  password:'worker123',  role:'Operator', department:'Machining' },
];

const SEED_INVENTORY = [
  { itemId:'INV001', name:'Steel Rods (Grade A)',  category:'Raw Material', unit:'kg',    stock:1200, minStock:500,  maxStock:5000, unitCost:85,   supplier:'Tata Steel' },
  { itemId:'INV002', name:'Aluminum Sheets',        category:'Raw Material', unit:'sheets',stock:45,   minStock:100,  maxStock:1000, unitCost:320,  supplier:'Hindalco' },
  { itemId:'INV003', name:'Hydraulic Fluid',        category:'Consumable',   unit:'liters',stock:280,  minStock:200,  maxStock:1000, unitCost:45,   supplier:'Castrol' },
  { itemId:'INV004', name:'Cutting Tools Set',      category:'Tool',         unit:'sets',  stock:12,   minStock:20,   maxStock:100,  unitCost:4500, supplier:'Sandvik' },
  { itemId:'INV005', name:'Welding Wire MIG',       category:'Consumable',   unit:'rolls', stock:68,   minStock:30,   maxStock:200,  unitCost:850,  supplier:'ESAB' },
  { itemId:'INV006', name:'Safety Gloves',           category:'Safety',       unit:'pairs', stock:156,  minStock:50,   maxStock:500,  unitCost:120,  supplier:'Honeywell' },
  { itemId:'INV007', name:'Bearing 6205',            category:'Spare Part',   unit:'pcs',   stock:8,    minStock:25,   maxStock:200,  unitCost:750,  supplier:'SKF' },
  { itemId:'INV008', name:'Finished Gears',          category:'Finished Good',unit:'pcs',   stock:342,  minStock:100,  maxStock:1000, unitCost:2200, supplier:'In-house' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear
  await Promise.all([
    Machine.deleteMany(), User.deleteMany(), Worker.deleteMany(),
    Production.deleteMany(), Maintenance.deleteMany(),
    Alert.deleteMany(), ActivityLog.deleteMany(), Inventory.deleteMany()
  ]);
  console.log('🗑️  Cleared existing data');

  // Machines
  const machines = await Machine.insertMany(SEED_MACHINES);
  console.log(`✅ Seeded ${machines.length} machines`);

  // Users
  for (const u of SEED_USERS) await User.create(u);
  console.log(`✅ Seeded ${SEED_USERS.length} users`);

  // Inventory
  await Inventory.insertMany(SEED_INVENTORY);
  console.log(`✅ Seeded ${SEED_INVENTORY.length} inventory items`);

  // Workers
  const workers = await Worker.insertMany([
    { workerId:'W001', name:'Arjun Sharma',   email:'arjun@factory.com',  phone:'+91-98765-43210', department:'Machining',  role:'Senior Operator',        skills:['CNC','Milling','QC'],    shift:'Morning', status:'active',   performance:{ score:92, completedTasks:48, pendingTasks:3 },  safetyScore:98, assignedMachine:machines.find(m=>m.machineId==='M004')?._id },
    { workerId:'W002', name:'Priya Patel',    email:'priya@factory.com',   phone:'+91-98765-43211', department:'Forming',    role:'Machine Operator',       skills:['Hydraulic','Safety'],   shift:'Morning', status:'active',   performance:{ score:87, completedTasks:42, pendingTasks:5 },  safetyScore:100,assignedMachine:machines.find(m=>m.machineId==='M002')?._id },
    { workerId:'W003', name:'Vikram Singh',   email:'vikram@factory.com',  phone:'+91-98765-43212', department:'Machining',  role:'CNC Specialist',         skills:['CNC','CAD','Turning'], shift:'Morning', status:'active',   performance:{ score:96, completedTasks:55, pendingTasks:2 },  safetyScore:95, assignedMachine:machines.find(m=>m.machineId==='M001')?._id },
    { workerId:'W004', name:'Sneha Reddy',    email:'sneha@factory.com',   phone:'+91-98765-43213', department:'Plastics',   role:'Injection Specialist',   skills:['Injection','Polymer'], shift:'Evening', status:'active',   performance:{ score:89, completedTasks:38, pendingTasks:4 },  safetyScore:97, assignedMachine:machines.find(m=>m.machineId==='M007')?._id },
    { workerId:'W005', name:'Rahul Mehta',    email:'rahul@factory.com',   phone:'+91-98765-43214', department:'Assembly',   role:'Welding Expert',         skills:['MIG','TIG','Robotics'],shift:'Morning', status:'active',   performance:{ score:94, completedTasks:52, pendingTasks:1 },  safetyScore:99, assignedMachine:machines.find(m=>m.machineId==='M003')?._id },
    { workerId:'W006', name:'Anita Joshi',    email:'anita@factory.com',   phone:'+91-98765-43215', department:'Logistics',  role:'Logistics Operator',     skills:['Conveyor','Forklift'], shift:'Evening', status:'on-leave', performance:{ score:78, completedTasks:31, pendingTasks:8 },  safetyScore:92, assignedMachine:machines.find(m=>m.machineId==='M005')?._id },
    { workerId:'W007', name:'Deepak Nair',    email:'deepak@factory.com',  phone:'+91-98765-43216', department:'Cutting',    role:'Laser Technician',       skills:['Laser','CAD'],         shift:'Morning', status:'active',   performance:{ score:91, completedTasks:46, pendingTasks:3 },  safetyScore:96, assignedMachine:machines.find(m=>m.machineId==='M008')?._id },
    { workerId:'W008', name:'Kavya Reddy',    email:'kavyar@factory.com',  phone:'+91-98765-43217', department:'Management', role:'Production Supervisor',  skills:['Planning','ERP'],      shift:'Morning', status:'active',   performance:{ score:98, completedTasks:62, pendingTasks:0 },  safetyScore:100,assignedMachine:null },
  ]);
  console.log(`✅ Seeded ${workers.length} workers`);

  // Production (last 8 days)
  const m001 = machines.find(m=>m.machineId==='M001');
  const m002 = machines.find(m=>m.machineId==='M002');
  for (let i = 7; i >= 0; i--) {
    const date = new Date(); date.setDate(date.getDate() - i);
    await Production.insertMany([
      { machine:m001._id, productName:'Auto Components',   targetQuantity:300, producedQuantity:270+Math.floor(Math.random()*40), shift:'Morning', date },
      { machine:m002._id, productName:'Hydraulic Fittings',targetQuantity:200, producedQuantity:160+Math.floor(Math.random()*50), shift:'Evening', date },
    ]);
  }
  console.log(`✅ Seeded production records`);

  // Maintenance
  const m004 = machines.find(m=>m.machineId==='M004');
  await Maintenance.insertMany([
    { machine:m004._id, issueDescription:'Critical temperature overrun — cooling system failure', technician:'Ravi Kumar',   status:'In Progress', date:new Date(), notes:'Replace coolant pump' },
    { machine:m002._id, issueDescription:'High vibration — bearing wear detected',                technician:'Sanjay Mehta', status:'Pending',     date:new Date(Date.now()+86400000*3), notes:'Order SKF bearings 6205' },
  ]);
  console.log(`✅ Seeded maintenance records`);

  // Alerts
  await Alert.insertMany([
    { type:'critical', title:'Mill Pro 5000 — Critical Temperature',  message:'Machine M004 temperature at 104°C. Immediate shutdown recommended.' },
    { type:'warning',  title:'Hydraulic Press X2 — High Vibration',   message:'Vibration 1.2mm/s exceeds threshold. Schedule maintenance.' },
    { type:'warning',  title:'Aluminum Sheets — Low Stock',            message:'Stock at 45 sheets (min: 100). Reorder immediately.' },
    { type:'warning',  title:'Bearing 6205 — Critical Low',            message:'Only 8 pcs remaining. Min threshold is 25. Production may halt.' },
    { type:'info',     title:'Production Target Achieved',             message:'March 5 production exceeded target by 4.2%!' },
  ]);
  console.log(`✅ Seeded alerts`);

  console.log('\n🌱 Database seeded successfully!');
  console.log('──────────────────────────────');
  console.log('Login credentials:');
  console.log('  Admin:   admin@factory.com   / admin123');
  console.log('  Manager: manager@factory.com / manager123');
  console.log('  Worker:  worker@factory.com  / worker123');
  process.exit(0);
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
