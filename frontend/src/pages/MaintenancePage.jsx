import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { MACHINE_HISTORY } from '../data/dummyData';
import { useLivestreamData } from '../hooks/useLivestreamData';
import LiveChartIndicator from '../components/common/LiveChartIndicator';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wrench, Brain, Clock, CheckCircle, CalendarPlus, ClipboardList, X } from 'lucide-react';

const LS_KEY = 'factory_maintenance_schedule';
function loadSchedule() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

const PRIORITIES = [
  { value: 'Low',      color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.4)'    },
  { value: 'Medium',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.4)'   },
  { value: 'High',     color: '#EF4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.4)'    },
  { value: 'Critical', color: '#FF0055', bg: 'rgba(255,0,85,0.08)',    border: 'rgba(255,0,85,0.5)'     },
];
const statusColors = { Scheduled: '#00E5FF', 'In Progress': '#F59E0B', Completed: '#22C55E', Cancelled: '#EF4444' };

function getRiskLevel(days) {
  if (days <= 7)  return { label:'HIGH',   color:'text-factory-red',   bg:'bg-factory-red/10',   border:'border-factory-red/40',   badge:'badge-critical' };
  if (days <= 30) return { label:'MEDIUM', color:'text-factory-amber', bg:'bg-factory-amber/10', border:'border-factory-amber/40', badge:'badge-warning' };
  return           { label:'LOW',    color:'text-factory-green', bg:'bg-factory-green/10', border:'border-factory-green/30', badge:'badge-operational' };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const temp = payload.find(p => p.dataKey === 'temperature')?.value;
  const vib  = payload.find(p => p.dataKey === 'vibration')?.value;
  let status = 'OPERATIONAL'; let statusColor = '#22C55E';
  if (temp > 95 || vib > 2)  { status = 'CRITICAL'; statusColor = '#EF4444'; }
  else if (temp > 80 || vib > 1) { status = 'WARNING';  statusColor = '#F59E0B'; }
  return (
    <div style={{ background:'#0c1628ee', backdropFilter:'blur(14px)', border:'1px solid #00E5FF44', borderRadius:12, padding:'12px 16px', minWidth:160 }}>
      <div style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>TIME: {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:p.color }} />
          <span style={{ color:'#64748b', fontSize:12 }}>{p.name}:</span>
          <span style={{ color:'#fff', fontSize:13, fontWeight:700, marginLeft:'auto' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #1e293b', marginTop:8, paddingTop:8, display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:statusColor }} />
        <span style={{ color:statusColor, fontSize:10, fontWeight:700, textTransform:'uppercase' }}>{status}</span>
      </div>
    </div>
  );
};

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [scheduleList, setScheduleList] = useState(loadSchedule);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMachine, setModalMachine] = useState(null);
  const [formData, setFormData] = useState({
    technician: '', date: '', time: '', type: 'Preventive', cost: '', duration: '', priority: 'Medium', notes: ''
  });

  const { data: apiMachines, loading } = useApi('/machines');
  const [liveMachines, setLiveMachines] = useState([]);

  useEffect(() => {
    if (loading) return;

    let baseMachines = apiMachines || [];
    if (baseMachines.length === 0) {
      baseMachines = Array.from({ length: 10 }, (_, i) => ({
        _id: `M-DEF-${i+1}`,
        id: `M-DEF-${i+1}`,
        machineId: `M-DEF-${i+1}`,
        name: `Industrial Unit ${String.fromCharCode(65 + i)}${i + 1}`,
        location: `Bay ${String.fromCharCode(65 + (i % 5))}${i + 1}`,
        temperature: 45 + Math.random() * 50,
        vibration: 0.2 + Math.random() * 4.3,
        pressure: 2 + Math.random() * 6,
        status: 'Running',
        lastMaintenance: '2026-02-10',
        predictedFailureDays: Math.floor(Math.random() * 60) + 1,
      }));
    } else {
      baseMachines = baseMachines.map(m => ({
        ...m,
        temperature: m.sensors?.temperature ?? m.temperature ?? 45 + Math.random() * 50,
        vibration: m.sensors?.vibration ?? m.vibration ?? 0.2 + Math.random() * 4.3,
        pressure: m.pressure ?? 2 + Math.random() * 6,
        predictedFailureDays: m.predictedFailureDays ?? Math.floor(Math.random() * 60) + 1,
      }));
    }

    setLiveMachines(baseMachines);

    const interval = setInterval(() => {
      setLiveMachines(prev => prev.map(m => {
        let newTemp = m.temperature + (Math.random() * 6 - 3);
        if (newTemp < 45) newTemp = 45; if (newTemp > 95) newTemp = 95;

        let newVib = m.vibration + (Math.random() * 0.6 - 0.3);
        if (newVib < 0.2) newVib = 0.2; if (newVib > 4.5) newVib = 4.5;
        
        let newPres = m.pressure + (Math.random() * 1.0 - 0.5);
        if (newPres < 2) newPres = 2; if (newPres > 8) newPres = 8;
        
        let days = m.predictedFailureDays;
        
        // dynamically adjust days based on conditions
        if (newTemp > 85 || newVib > 3.5 || newPres > 7) days -= 1;
        else if (newTemp < 60 && newVib < 1 && newPres < 5) days += 1;
        
        if (days < 1) days = 1;

        return {
          ...m,
          temperature: parseFloat(newTemp.toFixed(1)),
          vibration: parseFloat(newVib.toFixed(2)),
          pressure: parseFloat(newPres.toFixed(1)),
          predictedFailureDays: days
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [apiMachines, loading]);

  const liveHistory = useLivestreamData(
    MACHINE_HISTORY,
    {
      temperature: { min: 45, max: 95, variation: 2.5 },
      vibration: { min: 0.2, max: 4.5, variation: 0.2 }
    },
    2000,
    20
  );

  const machinesWithRisk = liveMachines.map(m => {
    // Determine risk percentage solely for UI bars based on typical 60 day scale
    const riskPercentage = Math.max(0, Math.min(100, Math.round(100 - (m.predictedFailureDays / 60) * 100)));
    return { ...m, riskPercentage };
  }).sort((a, b) => a.predictedFailureDays - b.predictedFailureDays);

  const highRisk = machinesWithRisk.filter(m => m.predictedFailureDays <= 7);
  const medRisk  = machinesWithRisk.filter(m => m.predictedFailureDays > 7 && m.predictedFailureDays <= 30);
  const lowRisk  = machinesWithRisk.filter(m => m.predictedFailureDays > 30);

  function handleSchedule(e, machine) {
    e.stopPropagation();
    setModalMachine(machine);
    setIsModalOpen(true);
  }

  function handleScheduleSubmit(e) {
    e.preventDefault();
    const newEntry = {
      id: Date.now().toString(),
      machineId: modalMachine.machineId || modalMachine.id || modalMachine._id,
      machineName: modalMachine.name,
      technician: formData.technician,
      scheduledDateDisplay: formData.date,
      scheduledTimeDisplay: formData.time,
      maintenanceType: formData.type,
      estimatedCost: formData.cost,
      duration: formData.duration,
      priority: formData.priority,
      status: 'Scheduled',
      notes: formData.notes
    };
    
    const updated = [newEntry, ...scheduleList];
    setScheduleList(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    
    setIsModalOpen(false);
    setModalMachine(null);
    setFormData({ technician: '', date: '', time: '', type: 'Preventive', cost: '', duration: '', priority: 'Medium', notes: '' });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="font-mono text-factory-dim animate-pulse">Loading predictive data...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">PREDICTIVE MAINTENANCE</h1>
          <p className="text-factory-dim font-body text-sm mt-1">AI-powered failure prediction and maintenance scheduling</p>
        </div>
        <div className="flex items-center gap-2 bg-factory-accent/10 border border-factory-accent/30 rounded-lg px-3 py-2">
          <Brain size={14} className="text-factory-accent" />
          <span className="font-mono text-xs text-factory-accent">AI ENGINE ACTIVE</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="factory-card glow-accent animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <Brain size={18} className="text-factory-accent" />
          <div className="section-title text-factory-accent">AI ANALYSIS SUMMARY</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-factory-red/5 border border-factory-red/30 rounded-lg p-3 text-center">
            <div className="font-display text-2xl font-bold text-factory-red">{highRisk.length}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">HIGH RISK MACHINES</div>
            <div className="text-xs text-factory-dim mt-1">Maintenance required within 7 days</div>
          </div>
          <div className="bg-factory-amber/5 border border-factory-amber/30 rounded-lg p-3 text-center">
            <div className="font-display text-2xl font-bold text-factory-amber">{medRisk.length}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">MEDIUM RISK</div>
            <div className="text-xs text-factory-dim mt-1">Schedule within 30 days</div>
          </div>
          <div className="bg-factory-green/5 border border-factory-green/30 rounded-lg p-3 text-center">
            <div className="font-display text-2xl font-bold text-factory-green">{lowRisk.length}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">LOW RISK</div>
            <div className="text-xs text-factory-dim mt-1">Normal operation</div>
          </div>
        </div>
      </div>

      {/* Risk cards — key fix: position:relative + isolate on the grid, z-index managed per card */}
      <div className="machine-card-container">
        {machinesWithRisk.map((m, i) => {
          const risk = getRiskLevel(m.predictedFailureDays);
          const isSelected = selected?._id === m._id;
          return (
            <div
              key={m._id || m.id}
              className={`${risk.bg} border ${risk.border} rounded-xl p-5 cursor-pointer machine-card`}
              style={{
                zIndex: isSelected ? 10 : 1,
                animationDelay: `${i * 50}ms`,
                background: undefined,
              }}
              onClick={() => setSelected(isSelected ? null : m)}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(0,229,255,0.3),transparent)' }} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-factory-text">{m.name}</div>
                  <div className="font-mono text-xs text-factory-dim">{m.machineId || m.id} · {m.location}</div>
                </div>
                <div className="text-right">
                  <div className={`font-display text-2xl font-bold ${risk.color}`}>{m.predictedFailureDays} DAYS</div>
                  <span className={risk.badge}>{risk.label} RISK</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs font-mono text-factory-dim mb-1">
                  <span>Predicted Failure In</span><span>{m.predictedFailureDays} Days</span>
                </div>
                <div className="h-2 bg-factory-bg rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-700"
                    style={{ width:`${m.riskPercentage}%`, background: risk.label === 'HIGH' ? 'linear-gradient(90deg,#EF4444,#FF0055)' : risk.label === 'MEDIUM' ? '#F59E0B' : '#22C55E' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-3">
                <div className="bg-factory-bg/50 rounded p-2 text-center">
                  <div className={m.temperature > 85 ? 'text-factory-red font-bold' : 'text-factory-text'}>{m.temperature}°C</div>
                  <div className="text-factory-dim">TEMP</div>
                </div>
                <div className="bg-factory-bg/50 rounded p-2 text-center">
                  <div className={m.vibration > 3.5 ? 'text-factory-red font-bold' : m.vibration > 2.0 ? 'text-factory-amber font-bold' : 'text-factory-text'}>{m.vibration}</div>
                  <div className="text-factory-dim">VIBR</div>
                </div>
                <div className="bg-factory-bg/50 rounded p-2 text-center">
                  <div className={m.pressure > 7 ? 'text-factory-amber font-bold' : 'text-factory-text'}>{m.pressure}</div>
                  <div className="text-factory-dim">PRES</div>
                </div>
              </div>

              {m.predictedFailureDays <= 30 && (
                <div className="mt-3 pt-3 border-t border-factory-border/50">
                  <div className="flex items-start gap-2">
                    <Brain size={12} className="text-factory-accent mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-factory-dim">
                      <span className="text-factory-accent font-medium">AI Recommendation: </span>
                      {m.predictedFailureDays <= 7
                        ? `Immediate inspection required. ${m.temperature > 85 ? 'Critical temperature detected. ' : ''}${m.vibration > 3.5 ? 'Abnormal vibration levels. ' : ''}Check machine ${m.machineId || m.id}.`
                        : `Schedule maintenance within 30 days. Monitor ${m.temperature > 75 ? 'temperature' : 'vibration'} closely.`}
                    </div>
                  </div>
                </div>
              )}

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-factory-border" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <LiveChartIndicator />
                      <div className="section-title mb-0 relative top-[1px]">LIVE SENSOR STREAM</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div style={{ width:10, height:3, background:'#EF4444', borderRadius:2 }} /><span style={{ fontSize:10, color:'#64748b' }}>Temperature</span></div>
                      <div className="flex items-center gap-2"><div style={{ width:10, height:3, background:'#22C55E', borderRadius:2 }} /><span style={{ fontSize:10, color:'#64748b' }}>Vibration</span></div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={liveHistory} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                      <defs>
                        <linearGradient id={`gTemp-${m._id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                        <linearGradient id={`gVib-${m._id}`}  x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="timeLabel" tick={{ fill:'#64748b', fontSize:10 }} tickLine={false} axisLine={false} minTickGap={20} dy={5} />
                      <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke:'#00E5FF', strokeWidth:1, strokeDasharray:'4 4' }} isAnimationActive={false} />
                      <Area type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} fill={`url(#gTemp-${m._id})`} name="Temperature" dot={false} isAnimationActive={false} activeDot={{ r:5, fill:'#EF4444', stroke:'#020617', strokeWidth:2 }} />
                      <Area type="monotone" dataKey="vibration"   stroke="#22C55E" strokeWidth={2} fill={`url(#gVib-${m._id})`}  name="Vibration"   dot={false} isAnimationActive={false} activeDot={{ r:5, fill:'#22C55E', stroke:'#020617', strokeWidth:2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <button
                    className="mt-4 btn-primary w-full text-sm flex items-center justify-center gap-2"
                    onClick={(e) => handleSchedule(e, m)}
                    style={{ boxShadow:'0 4px 15px rgba(0,229,255,0.2)' }}
                  >
                    <CalendarPlus size={14} /> SCHEDULE MAINTENANCE
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Maintenance Schedule Summary */}
      {scheduleList.length > 0 && (
        <div className="factory-card animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ClipboardList size={18} className="text-factory-accent" />
              <div className="section-title text-factory-accent">UPCOMING MAINTENANCE SCHEDULE</div>
            </div>
            <div className="font-mono text-xs text-factory-dim">{scheduleList.length} RECORD{scheduleList.length !== 1 ? 'S' : ''}</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  {['Machine', 'Date', 'Time', 'Technician', 'Type', 'Cost', 'Priority', 'Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleList.slice(0, 8).map((r, i) => {
                  const pDef = PRIORITIES.find(p => p.value === r.priority);
                  return (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap">
                        <div className="font-semibold text-factory-text">{r.machineName}</div>
                        <div className="text-[10px] text-factory-accent font-mono">{r.machineId}</div>
                      </td>
                      <td className="text-factory-dim font-mono text-xs whitespace-nowrap">{r.scheduledDateDisplay}</td>
                      <td className="text-factory-dim font-mono text-xs whitespace-nowrap">{r.scheduledTimeDisplay}</td>
                      <td className="text-factory-text text-sm whitespace-nowrap">{r.technician}</td>
                      <td className="whitespace-nowrap">
                        <span className="bg-factory-accent/10 border border-factory-accent/20 rounded px-2 py-0.5 text-factory-accent text-xs font-mono">{r.maintenanceType}</span>
                      </td>
                      <td className="text-factory-green font-mono text-sm font-bold whitespace-nowrap">₹{Number(r.estimatedCost).toLocaleString('en-IN')}</td>
                      <td className="whitespace-nowrap">
                        <span className="rounded px-2 py-0.5 text-xs font-mono font-bold" style={{ background: pDef?.bg, border: `1px solid ${pDef?.border}`, color: pDef?.color }}>{r.priority}</span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="rounded px-2 py-0.5 text-xs font-mono" style={{ background: `${statusColors[r.status]}15`, border: `1px solid ${statusColors[r.status]}44`, color: statusColors[r.status] }}>{r.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {scheduleList.length > 8 && (
            <div style={{ textAlign:'center', marginTop:12, color:'#64748b', fontSize:12, fontFamily:'monospace' }}>
              + {scheduleList.length - 8} more records — stored in local schedule history
            </div>
          )}
        </div>
      )}

      {/* Schedule Maintenance Modal Form */}
      {isModalOpen && modalMachine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1420]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="factory-card glow-accent w-full max-w-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-factory-border pb-4">
              <div className="flex items-center gap-3">
                <Wrench className="text-factory-accent" />
                <h3 className="text-xl font-display font-bold text-white tracking-widest">SCHEDULE MAINTENANCE</h3>
              </div>
              <button className="text-factory-dim hover:text-white transition-colors" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-factory-dim mb-1">MACHINE</label>
                  <input type="text" className="input-field bg-[#111e32] opacity-80" value={`${modalMachine.name} (${modalMachine.machineId || modalMachine.id || modalMachine._id})`} readOnly />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono text-factory-dim mb-1">TECHNICIAN NAME</label>
                  <input type="text" className="input-field" required value={formData.technician} onChange={e => setFormData(p => ({ ...p, technician: e.target.value }))} placeholder="e.g. Rahul Sharma" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono text-factory-dim mb-1">MAINTENANCE TYPE</label>
                  <select className="input-field" required value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}>
                    <option>Preventive</option>
                    <option>Emergency</option>
                    <option>Inspection</option>
                    <option>Repair</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono text-factory-dim mb-1">DATE</label>
                  <input type="date" className="input-field" required value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono text-factory-dim mb-1">TIME</label>
                  <input type="time" className="input-field" required value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono text-factory-dim mb-1">ESTIMATED COST (₹)</label>
                  <input type="number" className="input-field" required min="0" value={formData.cost} onChange={e => setFormData(p => ({ ...p, cost: e.target.value }))} placeholder="e.g. 5000" />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono text-factory-dim mb-1">DURATION (HOURS)</label>
                  <input type="number" className="input-field" required min="1" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 3" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono text-factory-dim mb-1">PRIORITY</label>
                  <select className="input-field" required value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-mono text-factory-dim mb-1">NOTES</label>
                  <textarea className="input-field min-h-[80px]" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Provide details..."></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-factory-border">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>CANCEL</button>
                <button type="submit" className="btn-primary flex items-center gap-2 glow-accent"><CheckCircle size={16} /> CONFIRM SCHEDULE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
