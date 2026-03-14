import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Filter, X, Clock } from 'lucide-react';
import { useLive } from '../context/LiveDataContext';
import api from '../api';

const typeConfig = {
  safe:     { icon: CheckCircle,   color: 'text-[#00FF9C]', bg: 'bg-[#00FF9C]/5', border: 'border-[#00FF9C]/50 shadow-[0_0_10px_rgba(0,255,156,0.2)] hover:shadow-[0_0_15px_rgba(0,255,156,0.4)]', badge: 'bg-[#00FF9C]/10 text-[#00FF9C] border-[#00FF9C]/30 border px-2 py-0.5 rounded text-[10px]' },
  warning:  { icon: AlertTriangle, color: 'text-[#FF4D4D]', bg: 'bg-[#FF4D4D]/5', border: 'border-[#FF4D4D]/50 shadow-[0_0_10px_rgba(255,77,77,0.2)] hover:shadow-[0_0_15px_rgba(255,77,77,0.4)]', badge: 'bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/30 border px-2 py-0.5 rounded text-[10px]' },
  critical: { icon: AlertTriangle, color: 'text-[#FFC857]', bg: 'bg-[#FFC857]/5', border: 'border-[#FFC857]/50 shadow-[0_0_10px_rgba(255,200,87,0.2)] hover:shadow-[0_0_15px_rgba(255,200,87,0.4)]', badge: 'bg-[#FFC857]/10 text-[#FFC857] border-[#FFC857]/30 border px-2 py-0.5 rounded text-[10px]' },
  info:     { icon: Info,          color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/5', border: 'border-[#00E5FF]/30 shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]', badge: 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30 border px-2 py-0.5 rounded text-[10px]' },
};

export default function AlertsPage() {
  const { alerts: liveAlerts, markAlertRead, markAllRead, removeAlert: liveRemoveAlert } = useLive();
  const [alerts, setAlerts] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');
  const [pushLogs, setPushLogs] = useState([]);

  useEffect(() => {
    const fetchPushLogs = async () => {
      try {
        const { data } = await api.get('/push/logs');
        setPushLogs(data.data || []);
      } catch (e) {
        console.error('Failed to fetch push logs', e);
      }
    };
    fetchPushLogs();
  }, []);

  // Sync to display our local array structure, allowing smooth dismissal animation
  useEffect(() => {
    // Only bring in alerts that haven't been removed locally
    setAlerts(liveAlerts.filter(a => !removedIds.includes(a.id || a._id)));
  }, [liveAlerts, removedIds]);

  // Dismiss function
  function removeAlert(id) {
    // Stage 1: Add to local "removing" list to trigger CSS fade-out transition
    document.getElementById(`alert-${id}`)?.classList.add('opacity-0', '-translate-x-4');
    
    setTimeout(() => {
      // Stage 2: Actually remove from the array after 300ms transition finishes
      setAlerts(prevAlerts => prevAlerts.filter(alert => {
        const uid = alert.id || alert._id;
        return uid !== id;
      }));
      setRemovedIds(prev => [...prev, id]);
      if (liveRemoveAlert) liveRemoveAlert(id);
    }, 300);
  }

  const categories = [...new Set(alerts.map(a => a.category))];
  const filtered = alerts.filter(a => {
    const matchFilter = filter === 'all' || (filter === 'unread' ? !a.read : a.read);
    const matchCat = category === 'all' || a.category === category;
    return matchFilter && matchCat;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">SMART ALERT SYSTEM</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Automated alerts for machines, inventory, and production</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-xs flex items-center gap-2">
            <CheckCircle size={12} /> MARK ALL READ
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label: 'Total Alerts', value: alerts.length, color: 'text-factory-accent' },
          { label: 'Unread', value: unreadCount, color: 'text-[#00D4FF]' },
          { label: 'Critical', value: alerts.filter(a => a.type === 'critical').length, color: 'text-[#FFB800]' },
          { label: 'Warnings', value: alerts.filter(a => a.type === 'warning').length, color: 'text-[#FF3860]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="factory-card text-center">
            <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap animate-fade-up stagger-2">
        {['all', 'unread', 'critical', 'warning'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors ${filter === f ? 'border-factory-accent text-factory-accent bg-factory-accent/10' : 'border-factory-border text-factory-dim hover:border-factory-accent/50'}`}>
            {f.toUpperCase()}
          </button>
        ))}
        <div className="h-4 w-px bg-factory-border self-center"></div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field w-36 py-1.5">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Alert list */}
      <div className="space-y-3 animate-fade-up stagger-3">
        {filtered.length === 0 && (
          <div className="factory-card text-center py-12 text-factory-dim font-mono">
            No alerts found for current filters
          </div>
        )}
        {filtered.map((alert, i) => {
          // Fallback missing/invalid types dynamically
          const normalizedType = alert.type === 'info' ? 'info' : (alert.type === 'critical' ? 'critical' : (alert.type === 'warning' ? 'warning' : 'safe')); 
          const { icon: Icon, color, bg, border, badge } = typeConfig[normalizedType];
          const uid = alert.id || alert._id || `temp-${i}`;
          
          return (
            <div 
              id={`alert-${uid}`} 
              key={uid} 
              className={`${bg} border ${border} rounded-lg p-4 transition-all duration-300 ease-in-out transform ${!alert.read ? 'opacity-100' : 'opacity-60'} animate-fade-up`} 
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} border ${border} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-current opacity-10 blur-md rounded-lg"></div>
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                     <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white tracking-wide">{alert.title || alert.machine}</span>
                        {!alert.read && <span className="w-2 h-2 bg-factory-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]"></span>}
                      </div>
                      <div className="text-sm text-factory-dim mt-1 font-body">{alert.message}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={badge}>{normalizedType.toUpperCase()}</span>
                      
                      {/* Cross Dismiss Button Feature */}
                      <button 
                        onClick={() => removeAlert(uid)} 
                        className="text-factory-dim hover:text-white hover:bg-factory-accent/10 p-1.5 rounded-full transition-colors relative group"
                        title="Dismiss Alert"
                      >
                        <X size={16} className="group-hover:text-factory-accent" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-mono text-xs text-factory-dim/70 flex items-center gap-1"><Clock size={10} /> {alert.time || alert.date || new Date().toLocaleTimeString()}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 border border-factory-border bg-factory-bg rounded text-factory-dim uppercase">{alert.category || 'System'}</span>
                    {alert.machine && <span className="font-mono text-[10px] text-[#00D4FF] uppercase bg-[#00D4FF]/10 px-2 py-0.5 rounded border border-[#00D4FF]/30">{alert.machine}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="factory-card mt-8 animate-fade-up stagger-4">
        <div className="section-title mb-6 flex items-center gap-2">
          <Bell size={18} className="text-[#00D4FF]" />
          PUSH NOTIFICATION LOG
        </div>
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Machine</th>
                <th>Alert Type</th>
                <th>Notification Status</th>
              </tr>
            </thead>
            <tbody>
              {pushLogs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-6 text-factory-dim font-mono">No push notifications dispatched yet.</td></tr>
              ) : (
                pushLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td>{log.machine}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${log.alertType === 'critical' ? 'bg-[#FF3860]/10 text-[#FF3860] border-[#FF3860]/30' : log.alertType === 'warning' ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30' : 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30'}`}>
                        {log.alertType.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${log.status === 'Sent' ? 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30' : log.status === 'Failed' ? 'bg-[#FF3860]/10 text-[#FF3860] border-[#FF3860]/30' : 'bg-factory-border/30 text-factory-dim border-factory-dim/30'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
