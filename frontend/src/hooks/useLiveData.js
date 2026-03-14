import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

// ─── Web Audio — Alert Sound ───────────────────────────────────
function playAlertSound(type = 'warning') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'critical') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.24);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.36);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.48);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {}
}

function sendBrowserNotification(alert) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const emoji = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵';
  try {
    new Notification(`${emoji} SmartFactory — ${alert.title}`, {
      body: alert.message,
      icon: '/factory-icon.svg',
      tag: alert._id || alert.id,
      requireInteraction: alert.type === 'critical',
    });
  } catch (e) {}
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

const normalizeMachine = (m) => ({
  ...m,
  id: m.machineId || m.id,
  department: m.department || 'Production',
  status: m.status === 'Running' ? 'operational' : (m.status === 'Maintenance' ? 'warning' : 'offline'),
  temperature: m.sensors?.temperature ?? m.temperature ?? 0,
  vibration: m.sensors?.vibration ?? m.vibration ?? 0,
  runtime: m.sensors?.runtime ?? m.runtime ?? 0,
  lastMaintenance: m.lastMaintenance || '2026-02-10',
  nextMaintenance: m.nextMaintenance || '2026-04-10',
  assignedWorker: m.assignedWorker || null,
});

export function useLiveData() {
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [production, setProduction] = useState({ today: 0, target: 500 });
  const [analytics, setAnalytics] = useState({
    OEE: 82, availability: 88, performance: 85, quality: 98,
    productionToday: 0, energyUsage: 1450, costPerUnit: 2.4, revenue: 45000,
    activeAlerts: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (!user) return; // Only fetch data if user is authenticated

    requestNotificationPermission();

    const fetchData = async () => {
      try {
        const [machinesRes, alertsRes, prodRes] = await Promise.all([
          api.get('/machines'),
          api.get('/alerts'),
          api.get('/production')
        ]);
        
        // Ensure machines is array
        if (machinesRes.data.success) {
          setMachines((machinesRes.data.data || []).map(normalizeMachine));
        }
        
        // Alerts
        if (alertsRes.data && alertsRes.data.success) {
          setAlerts(alertsRes.data.data || []);
        }

        // Production calculation
        if (prodRes.data && prodRes.data.success) {
          const today = new Date().setHours(0,0,0,0);
          let todayTotal = 0;
          let targetTotal = 500;
          (prodRes.data.data || []).forEach(p => {
             const pd = new Date(p.date).setHours(0,0,0,0);
             if (pd === today) {
               todayTotal += p.producedQuantity || 0;
               targetTotal += p.targetQuantity || 0;
             }
          });
          setProduction({ today: todayTotal, target: targetTotal === 500 && todayTotal > 0 ? todayTotal + 100 : targetTotal });
        }
      } catch (error) {
        console.error("Error fetching live data", error);
      }
    };
    fetchData();

    // Setup WebSocket
    const socket = io(SOCKET_URL);
    
    socket.on('machineUpdated', (updatedMachine) => {
      const norm = normalizeMachine(updatedMachine);
      setMachines(prev => prev.map(m => m._id === norm._id ? norm : m));
      setLastUpdate(new Date());
    });
    
    socket.on('machineData', (updatedMachine) => {
      const norm = normalizeMachine(updatedMachine);
      setMachines(prev => prev.map(m => m._id === norm._id ? norm : m));
      setLastUpdate(new Date());
    });
    
    socket.on('machineDeleted', (deletedId) => {
      setMachines(prev => prev.filter(m => m._id !== deletedId));
    });

    socket.on('alertAdded', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      if (soundEnabled) playAlertSound(newAlert.type);
      if (notifEnabled) sendBrowserNotification(newAlert);
      setLastUpdate(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, [soundEnabled, notifEnabled, user]);

  const markAlertRead = useCallback(async (id) => {
    try {
      await api.put(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a._id === id || a.id === id ? { ...a, read: true } : a));
    } catch (e) { console.error('Error marking alert read'); }
  }, []);
  
  const markAllRead = useCallback(async () => {
    try {
      // Typically you'd have an endpoint, but local update for UI
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    } catch (e) {}
  }, []);

  return { 
    machines, 
    alerts, 
    production, 
    analytics: { ...analytics, productionToday: production.today, activeAlerts: alerts.filter(a => !a.read).length }, 
    lastUpdate, 
    markAlertRead, 
    markAllRead, 
    unreadCount: alerts.filter(a => !a.read).length, 
    soundEnabled, 
    setSoundEnabled, 
    notifEnabled, 
    setNotifEnabled 
  };
}
