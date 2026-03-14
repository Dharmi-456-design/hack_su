import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useLive } from '../context/LiveDataContext';
import { MACHINE_HISTORY } from '../data/dummyData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, Thermometer, Activity, Clock, MapPin, Search } from 'lucide-react';

const statusConfig = {
  operational: { dot: 'bg-factory-green', badge: 'badge-operational', glow: 'glow-green', label: 'OPERATIONAL' },
  warning:     { dot: 'bg-factory-amber', badge: 'badge-warning',     glow: 'glow-amber', label: 'WARNING' },
  critical:    { dot: 'bg-factory-red',   badge: 'badge-critical',    glow: 'glow-red',   label: 'CRITICAL' },
  offline:     { dot: 'bg-gray-500',      badge: 'badge-offline',     glow: '',           label: 'OFFLINE' },
  Running:     { dot: 'bg-factory-green', badge: 'badge-operational', glow: 'glow-green', label: 'RUNNING' },
  Idle:        { dot: 'bg-gray-500',      badge: 'badge-offline',     glow: '',           label: 'IDLE' },
  Maintenance: { dot: 'bg-factory-amber', badge: 'badge-warning',     glow: 'glow-amber', label: 'MAINTENANCE' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const temp = payload.find(p => p.dataKey === 'temperature')?.value;
  const vib  = payload.find(p => p.dataKey === 'vibration')?.value;
  let status = 'OPERATIONAL'; let statusColor = '#22C55E';
  if (temp > 95 || vib > 2) { status = 'CRITICAL'; statusColor = '#EF4444'; }
  else if (temp > 80 || vib > 1) { status = 'WARNING'; statusColor = '#F59E0B'; }
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
      <div style={{ borderTop:'1px solid #1e293b', marginTop:8, paddingTop:8, display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:statusColor }} />
        <span style={{ color:statusColor, fontSize:10, fontWeight:700, textTransform:'uppercase' }}>{status}</span>
      </div>
    </div>
  );
};

function MachineDetail({ machine, onClose }) {
  const temp = machine.sensors?.temperature ?? machine.temperature ?? 0;
  const vib  = machine.sensors?.vibration  ?? machine.vibration  ?? 0;
  const eff  = machine.efficiency ?? 0;
  const rt   = machine.sensors?.runtime    ?? machine.runtime    ?? 0;
  const s    = statusConfig[machine.status] || statusConfig.offline;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="factory-card w-full max-w-2xl max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="status-dot" style={{ width:10, height:10, borderRadius:'50%', display:'inline-block', background: temp > 90 ? '#EF4444' : temp > 75 ? '#F59E0B' : '#22C55E' }} />
              <h2 className="font-display text-lg font-bold text-factory-accent">{machine.name}</h2>
            </div>
            <div className="font-mono text-xs text-factory-dim mt-1">{machine.machineId || machine.id} · {machine.location}</div>
          </div>
          <button onClick={onClose} className="text-factory-dim hover:text-factory-text font-mono text-xl leading-none">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Thermometer, label: 'Temperature', value: `${temp}°C`,    color: temp > 90 ? 'text-factory-red' : temp > 75 ? 'text-factory-amber' : 'text-factory-green' },
            { icon: Activity,    label: 'Vibration',   value: `${vib} mm/s`,  color: vib > 2 ? 'text-factory-red' : vib > 1 ? 'text-factory-amber' : 'text-factory-green' },
            { icon: Clock,       label: 'Runtime',     value: `${rt} hrs`,    color: 'text-factory-accent' },
            { icon: Cpu,         label: 'Efficiency',  value: `${eff}%`,      color: eff > 80 ? 'text-factory-green' : eff > 60 ? 'text-factory-amber' : 'text-factory-red' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-factory-bg border border-factory-border rounded-lg p-3 flex items-center gap-3">
              <Icon size={16} className={color} />
              <div>
                <div className="font-mono text-xs text-factory-dim">{label}</div>
                <div className={`font-display text-lg font-bold ${color}`}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="section-title mb-3">24-HOUR SENSOR DATA</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={MACHINE_HISTORY} margin={{ top:5, right:10, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gTempMach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVibMach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill:'#64748b', fontSize:10 }} tickLine={false} axisLine={false} interval={3} dy={5} />
              <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke:'#00E5FF', strokeWidth:1, strokeDasharray:'4 4' }} />
              <Area type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} fill="url(#gTempMach)" name="Temperature" dot={false} activeDot={{ r:5, fill:'#EF4444', stroke:'#020617', strokeWidth:2 }} />
              <Area type="monotone" dataKey="vibration"   stroke="#22C55E" strokeWidth={2} fill="url(#gVibMach)"  name="Vibration"   dot={false} activeDot={{ r:5, fill:'#22C55E', stroke:'#020617', strokeWidth:2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><div className="font-mono text-xs text-factory-dim mb-1">LOCATION</div><div className="text-factory-text font-medium">{machine.location || '—'}</div></div>
          <div><div className="font-mono text-xs text-factory-dim mb-1">STATUS</div><span className={s.badge}>{s.label}</span></div>
          <div><div className="font-mono text-xs text-factory-dim mb-1">MACHINE ID</div><div className="text-factory-text font-medium font-mono">{machine.machineId || machine.id}</div></div>
          <div><div className="font-mono text-xs text-factory-dim mb-1">EFFICIENCY</div><div className={`font-medium ${eff > 80 ? 'text-factory-green' : eff > 60 ? 'text-factory-amber' : 'text-factory-red'}`}>{eff}%</div></div>
        </div>
      </div>
    </div>
  );
}

export default function MachinesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  // Use live machines from context (already normalized and real-time)
  const { machines } = useLive();

  const filtered = machines.filter(m => {
    const statusKey = (m.status || '').toLowerCase();
    const matchSearch = (m.name || '').toLowerCase().includes(search.toLowerCase())
      || (m.location || '').toLowerCase().includes(search.toLowerCase())
      || (m.machineId || '').toLowerCase().includes(search.toLowerCase());
    const filterMap = { running:'operational', operational:'operational', idle:'offline', maintenance:'warning', warning:'warning', critical:'critical', offline:'offline' };
    const normalized = filterMap[statusKey] || statusKey;
    const matchFilter = filter === 'all' || normalized === filter;
    return matchSearch && matchFilter;
  });

  const counts = machines.reduce((acc, m) => {
    const s = (m.status || '').toLowerCase();
    const map = { running:'operational', operational:'operational', idle:'offline', maintenance:'warning', warning:'warning', critical:'critical', offline:'offline' };
    const key = map[s] || s;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">MACHINE HEALTH MONITORING</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Real-time status and performance of all factory machines</p>
        </div>
        <div className="font-mono text-xs text-factory-dim bg-factory-panel border border-factory-border px-3 py-2 rounded-lg">
          {machines.length} machines tracked
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label: 'Operational', key:'operational', color: 'text-factory-green', bg: 'bg-factory-green/10', border: 'border-factory-green/30' },
          { label: 'Warning',     key:'warning',     color: 'text-factory-amber', bg: 'bg-factory-amber/10', border: 'border-factory-amber/30' },
          { label: 'Critical',    key:'critical',    color: 'text-factory-red',   bg: 'bg-factory-red/10',   border: 'border-factory-red/30' },
          { label: 'Offline',     key:'offline',     color: 'text-gray-500',      bg: 'bg-gray-900/30',      border: 'border-gray-700/30' },
        ].map(({ label, key, color, bg, border }) => (
          <div key={label} className={`factory-card ${bg} border ${border} text-center cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => setFilter(filter === key ? 'all' : key)}>
            <div className={`font-display text-3xl font-bold ${color}`}>{counts[key] || 0}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 animate-fade-up stagger-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-factory-dim" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search machines..." />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-40">
          <option value="all">All Status</option>
          <option value="operational">Operational</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Machine grid */}
      {machines.length === 0 ? (
        <div className="factory-card text-center py-12 text-factory-dim font-mono">
          No machines found. Add machines from the Admin Panel.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const s = statusConfig[m.status] || statusConfig.offline;
            const temp = m.sensors?.temperature ?? m.temperature ?? 0;
            const vib  = m.sensors?.vibration  ?? m.vibration  ?? 0;
            const eff  = m.efficiency ?? 0;
            const rt   = m.sensors?.runtime    ?? m.runtime    ?? 0;
            return (
              <div key={m._id || m.id || i} className={`factory-card ${s.glow} cursor-pointer hover:scale-105 transition-all duration-200 animate-fade-up`}
                style={{ animationDelay:`${i * 50}ms` }} onClick={() => setSelected(m)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`status-dot ${s.dot}`} />
                      <span className="font-medium text-factory-text">{m.name}</span>
                    </div>
                    <div className="font-mono text-xs text-factory-dim mt-0.5">{m.machineId || m.id} · {m.location}</div>
                  </div>
                  <span className={s.badge}>{s.label}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-factory-bg/50 rounded p-2 text-center">
                    <div className={`font-display text-lg font-bold ${temp > 90 ? 'text-factory-red' : temp > 75 ? 'text-factory-amber' : 'text-factory-accent'}`}>{temp}°</div>
                    <div className="font-mono text-xs text-factory-dim">TEMP</div>
                  </div>
                  <div className="bg-factory-bg/50 rounded p-2 text-center">
                    <div className={`font-display text-lg font-bold ${vib > 2 ? 'text-factory-red' : vib > 1 ? 'text-factory-amber' : 'text-factory-green'}`}>{vib}</div>
                    <div className="font-mono text-xs text-factory-dim">VIB</div>
                  </div>
                  <div className="bg-factory-bg/50 rounded p-2 text-center">
                    <div className={`font-display text-lg font-bold ${eff > 80 ? 'text-factory-green' : eff > 60 ? 'text-factory-amber' : 'text-factory-red'}`}>{eff}%</div>
                    <div className="font-mono text-xs text-factory-dim">EFF</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-factory-dim">Efficiency</span>
                    <span className="font-mono text-xs text-factory-text">{eff}%</span>
                  </div>
                  <div className="h-1.5 bg-factory-bg rounded overflow-hidden">
                    <div className={`h-full rounded transition-all duration-700 ${eff > 80 ? 'bg-factory-green' : eff > 60 ? 'bg-factory-amber' : 'bg-factory-red'}`} style={{ width:`${eff}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-factory-border/50 text-xs text-factory-dim font-mono">
                  <div className="flex items-center gap-1"><MapPin size={10} />{m.location}</div>
                  <div className="flex items-center gap-1"><Clock size={10} />{rt}h</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <MachineDetail machine={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
