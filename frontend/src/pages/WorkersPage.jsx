import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { User, Star, CheckCircle, Clock, Shield, Cpu, Search, Plus, X, Zap, Activity, AlertTriangle, TrendingUp, Award, Thermometer } from 'lucide-react';
import { WORKER_PERFORMANCE } from '../data/dummyData';
import { useLivestreamData } from '../hooks/useLivestreamData';
import LiveChartIndicator from '../components/common/LiveChartIndicator';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-factory-panel border border-factory-border rounded p-3 font-mono text-xs">
      <div className="text-factory-dim mb-1">{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

const inputCls = "w-full bg-factory-bg/50 border border-factory-border rounded px-3 py-2 text-factory-text font-body text-sm focus:outline-none focus:border-factory-accent transition-colors";

function WorkerCard({ worker, onClick }) {
  const perf = worker.performance?.score ?? worker.performance ?? 0;
  const done = worker.performance?.completedTasks ?? worker.completedTasks ?? 0;
  const safety = worker.safetyScore ?? 100;
  const skills = worker.skills || [];
  return (
    <div className="factory-card cursor-pointer hover:border-factory-accent/50 hover:scale-105 transition-all duration-200 animate-fade-up" onClick={() => onClick(worker)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-factory-accent/10 border border-factory-accent/30 flex items-center justify-center font-display text-base font-bold text-factory-accent flex-shrink-0">
          {(worker.name || '?').split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="status-dot" style={{ width:7, height:7, borderRadius:'50%', display:'inline-block', background: worker.status === 'active' ? '#00FF94' : '#FFB800' }} />
            <span className="font-medium text-factory-text">{worker.name}</span>
          </div>
          <div className="font-mono text-xs text-factory-dim">{worker.workerId} · {worker.role}</div>
          <div className="font-mono text-xs text-factory-dim">{worker.department} · {worker.shift} Shift</div>
        </div>
        <div className={`text-xs font-mono ${worker.status === 'active' ? 'text-factory-green' : 'text-factory-amber'}`}>{(worker.status || '').toUpperCase()}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-factory-bg/50 rounded p-2 text-center">
          <div className="font-display text-lg font-bold text-factory-accent">{perf}%</div>
          <div className="font-mono text-xs text-factory-dim">PERF</div>
        </div>
        <div className="bg-factory-bg/50 rounded p-2 text-center">
          <div className="font-display text-lg font-bold text-factory-green">{done}</div>
          <div className="font-mono text-xs text-factory-dim">DONE</div>
        </div>
        <div className="bg-factory-bg/50 rounded p-2 text-center">
          <div className={`font-display text-lg font-bold ${safety === 100 ? 'text-factory-green' : 'text-factory-amber'}`}>{safety}</div>
          <div className="font-mono text-xs text-factory-dim">SAFE</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-factory-dim">Performance</span>
          <span className="text-factory-text">{perf}%</span>
        </div>
        <div className="h-1.5 bg-factory-bg rounded overflow-hidden">
          <div className={`h-full rounded ${perf > 90 ? 'bg-factory-green' : perf > 75 ? 'bg-factory-amber' : 'bg-factory-red'}`} style={{ width:`${perf}%` }} />
        </div>
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {skills.slice(0, 3).map(skill => (
            <span key={skill} className="text-xs font-mono px-2 py-0.5 bg-factory-border rounded text-factory-dim">{skill}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkerModal({ worker, onClose }) {
  const perf   = worker.performance?.score ?? worker.performance ?? 0;
  const done   = worker.performance?.completedTasks ?? worker.completedTasks ?? 0;
  const pend   = worker.performance?.pendingTasks   ?? worker.pendingTasks   ?? 0;
  const safety = worker.safetyScore ?? 100;
  const skills = worker.skills || [];
  const machine = worker.assignedMachine?.name || worker.assignedMachine || 'None';

  const radarData = [
    { skill: 'Productivity', value: perf },
    { skill: 'Safety',       value: safety },
    { skill: 'Task Comp.',   value: Math.min(100, done * 1.5) },
    { skill: 'Punctuality',  value: 88 },
    { skill: 'Quality',      value: 85 },
  ];
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="factory-card w-full max-w-2xl max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-factory-accent/10 border border-factory-accent/30 flex items-center justify-center font-display text-xl font-bold text-factory-accent">
              {(worker.name || '?').split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-factory-accent">{worker.name}</h2>
              <div className="font-mono text-xs text-factory-dim">{worker.workerId} · {worker.department}</div>
              <div className="font-mono text-xs text-factory-dim">{worker.role} · {worker.shift} Shift</div>
            </div>
          </div>
          <button onClick={onClose} className="text-factory-dim hover:text-factory-text font-mono text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="section-title mb-3">SKILL RADAR</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E3A5F" />
                <PolarAngleAxis dataKey="skill" tick={{ fill:'#5A7A9A', fontSize:10 }} />
                <Radar name="Score" dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {[
              { label:'Performance',     value:`${perf}%`,        icon:Star,         color:'text-factory-accent' },
              { label:'Safety Score',    value:`${safety}/100`,   icon:Shield,       color:'text-factory-green' },
              { label:'Tasks Done',      value:done,              icon:CheckCircle,  color:'text-factory-green' },
              { label:'Pending Tasks',   value:pend,              icon:Clock,        color:pend > 5 ? 'text-factory-amber' : 'text-factory-dim' },
              { label:'Assigned Machine',value:machine,           icon:Cpu,          color:'text-factory-accent' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 bg-factory-bg rounded p-2.5">
                <Icon size={14} className={color} />
                <div className="flex-1">
                  <div className="font-mono text-xs text-factory-dim">{label}</div>
                  <div className={`font-medium text-sm ${color}`}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <div className="section-title mb-3">SKILLS</div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="text-xs font-mono px-3 py-1 border border-factory-accent/30 bg-factory-accent/10 rounded text-factory-accent">{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div><div className="font-mono text-xs text-factory-dim mb-1">CONTACT</div><div className="text-factory-text font-mono text-sm">{worker.phone || '—'}</div></div>
          <div><div className="font-mono text-xs text-factory-dim mb-1">JOIN DATE</div><div className="text-factory-text font-mono text-sm">{worker.joinDate ? new Date(worker.joinDate).toLocaleDateString() : '—'}</div></div>
        </div>
      </div>
    </div>
  );
}

function AddWorkerModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    workerId:'', name:'', email:'', phone:'', department:'Machining',
    role:'Operator', shift:'Morning', status:'active', skills:''
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
    await onCreate(payload);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="factory-card w-full max-w-lg max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-lg font-bold text-factory-accent">ADD WORKER</h2>
          <button onClick={onClose} className="text-factory-dim hover:text-factory-red"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="font-mono text-xs text-factory-dim block mb-1">WORKER ID *</label><input value={form.workerId} onChange={e=>setForm({...form,workerId:e.target.value})} className={inputCls} placeholder="W009" required /></div>
            <div><label className="font-mono text-xs text-factory-dim block mb-1">NAME *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={inputCls} placeholder="Full Name" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="font-mono text-xs text-factory-dim block mb-1">EMAIL</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={inputCls} /></div>
            <div><label className="font-mono text-xs text-factory-dim block mb-1">PHONE</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="font-mono text-xs text-factory-dim block mb-1">DEPARTMENT</label><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} className={inputCls} /></div>
            <div><label className="font-mono text-xs text-factory-dim block mb-1">ROLE</label><input value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-factory-dim block mb-1">SHIFT</label>
              <select value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})} className={inputCls}>
                <option>Morning</option><option>Evening</option><option>Night</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-xs text-factory-dim block mb-1">STATUS</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={inputCls}>
                <option value="active">Active</option><option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
          <div><label className="font-mono text-xs text-factory-dim block mb-1">SKILLS (comma-separated)</label><input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} className={inputCls} placeholder="CNC, Welding, CAD" /></div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded font-mono text-xs text-factory-dim border border-factory-border hover:bg-factory-border/30 transition-colors">CANCEL</button>
            <button type="submit" className="flex-1 py-2.5 rounded font-mono text-xs font-bold bg-factory-accent/10 text-factory-accent border border-factory-accent/50 hover:bg-factory-accent hover:text-black transition-all">ADD WORKER</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const AiInsightsPanel = () => {
  return (
    <div className="factory-card my-6 border-factory-accent/30 bg-factory-accent/5 relative overflow-hidden animate-fade-up">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-factory-accent/20 blur-3xl rounded-full" />
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Zap size={18} className="text-factory-accent" />
        <h2 className="font-display text-base font-bold text-factory-accent tracking-widest">AI WORKFORCE INSIGHTS</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {[
          { icon: Star, title: 'Top Pair This Week', text: 'Vikram Singh on Machine M001 produced 14% higher output than average.', color: 'text-[#00D4FF]' },
          { icon: TrendingUp, title: 'Most Productive Shift', text: 'Morning shift achieved 92% overall efficiency, the highest this month.', color: 'text-[#00FF94]' },
          { icon: AlertTriangle, title: 'Underutilized Workers', text: 'Deepak Nair has high CNC skills but is assigned to manual assembly.', color: 'text-[#FFB800]' },
          { icon: Cpu, title: 'Skill Gap Warning', text: 'Machine M007 requires 2 more certified operators for the night shift.', color: 'text-[#FF3860]' },
        ].map((insight, i) => (
          <div key={i} className="bg-factory-bg/50 border border-factory-border rounded p-3 hover:border-factory-accent/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <insight.icon size={14} className={insight.color} />
              <div className="font-mono text-xs text-factory-dim">{insight.title}</div>
            </div>
            <p className="text-sm font-body text-factory-text">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShiftOptimizationAI = () => {
  const shifts = [
    { name: 'Morning Shift', assignments: [
      { worker: 'Arjun Sharma', machine: 'M004', status: 'optimal' },
      { worker: 'Vikram Singh', machine: 'M001', status: 'optimal' }
    ]},
    { name: 'Afternoon Shift', assignments: [
      { worker: 'Priya Patel', machine: 'M002', status: 'acceptable' },
      { worker: 'Sneha Reddy', machine: 'M007', status: 'fatigue' }
    ]},
    { name: 'Night Shift', assignments: [
      { worker: 'Rahul Mehta', machine: 'M003', status: 'optimal' }
    ]}
  ];

  const getStatusStyle = (status) => {
    if (status === 'optimal') return { border: 'border-[#00FF94]/30', bg: 'bg-[#00FF94]/10', text: 'text-[#00FF94]', icon: Activity, label: 'Optimal Assignment' };
    if (status === 'acceptable') return { border: 'border-[#FFB800]/30', bg: 'bg-[#FFB800]/10', text: 'text-[#FFB800]', icon: CheckCircle, label: 'Acceptable' };
    return { border: 'border-[#FF3860]/30', bg: 'bg-[#FF3860]/10', text: 'text-[#FF3860]', icon: Thermometer, label: 'High Fatigue Risk' };
  };

  return (
    <div className="factory-card h-full flex flex-col animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0 flex items-center gap-2"><Zap size={16} className="text-[#00D4FF]"/> AI SHIFT OPTIMIZATION</h2>
        <span className="text-xs font-mono text-factory-dim bg-factory-bg px-2 py-1 rounded border border-factory-border">+12% EST. EFFICIENCY</span>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {shifts.map(shift => (
          <div key={shift.name} className="space-y-2">
            <div className="font-mono text-xs text-factory-dim border-b border-factory-border/50 pb-1">{shift.name.toUpperCase()}</div>
            <div className="grid gap-2">
              {shift.assignments.map(a => {
                const style = getStatusStyle(a.status);
                const Icon = style.icon;
                return (
                  <div key={a.worker} className={`flex items-center justify-between p-2 rounded border ${style.border} bg-factory-bg/50 hover:bg-factory-bg transition-colors`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${style.bg} ${style.text}`}><Icon size={14} /></div>
                      <div>
                        <div className="text-sm font-medium text-factory-text">{a.worker} <span className="text-factory-dim font-mono text-xs">→ {a.machine}</span></div>
                      </div>
                    </div>
                    <div className={`text-[10px] font-mono ${style.text}`}>{style.label.toUpperCase()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkerMachineHeatmap = () => {
  const workers = ['Arjun S.', 'Vikram S.', 'Priya P.', 'Sneha R.', 'Rahul M.', 'Deepak N.'];
  const machines = ['M001', 'M002', 'M003', 'M004', 'M005'];
  
  const heatmapData = [
    [75, 88, 60, 95, 82],
    [92, 70, 85, 65, 80],
    [80, 98, 75, 88, 90],
    [65, 78, 55, 92, 85],
    [85, 60, 95, 70, 75],
    [90, 85, 88, 80, 92],
  ];

  const getColor = (val) => {
    if (val >= 90) return 'bg-[#00FF94] border-[#00FF94] shadow-[0_0_10px_rgba(0,255,148,0.3)]';
    if (val >= 80) return 'bg-[#00D4FF] border-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.3)]';
    if (val >= 70) return 'bg-[#FFB800] border-[#FFB800] opacity-80';
    return 'bg-[#FF3860] border-[#FF3860] opacity-70';
  };

  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="factory-card h-full flex flex-col animate-fade-up relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0 flex items-center gap-2"><Activity size={16} className="text-[#00D4FF]"/> WORKER–MACHINE PRODUCTIVITY HEATMAP</h2>
      </div>
      <div className="relative flex-1 flex flex-col justify-center">
        <div className="flex">
          <div className="w-20"></div>
          <div className="flex-1 flex justify-between px-2">
            {machines.map(m => <div key={m} className="font-mono text-xs text-factory-dim w-8 text-center">{m}</div>)}
          </div>
        </div>
        <div className="space-y-3 mt-2">
          {workers.map((w, wIdx) => (
            <div key={w} className="flex items-center">
              <div className="w-20 font-mono text-xs text-factory-dim truncate pr-2 text-right">{w}</div>
              <div className="flex-1 flex justify-between px-2">
                {machines.map((m, mIdx) => {
                  const val = heatmapData[wIdx][mIdx];
                  return (
                    <div 
                      key={m} 
                      className={`w-8 h-8 rounded border ${getColor(val)} transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer relative group`}
                      onMouseEnter={(e) => {
                        const rect = e.target.getBoundingClientRect();
                        setTooltip({ x: rect.left + 20, y: rect.top - 20, worker: w, machine: m, val });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-factory-dim"><div className="w-2.5 h-2.5 rounded bg-[#00FF94]"></div>VERY HIGH</div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-factory-dim"><div className="w-2.5 h-2.5 rounded bg-[#00D4FF]"></div>GOOD</div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-factory-dim"><div className="w-2.5 h-2.5 rounded bg-[#FFB800]"></div>AVERAGE</div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-factory-dim"><div className="w-2.5 h-2.5 rounded bg-[#FF3860]"></div>LOW</div>
        </div>
      </div>

      {tooltip && (
        <div 
          className="fixed z-50 bg-[#0f172a] border border-[#00D4FF]/50 p-3 rounded shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full tracking-wider min-w-[200px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-medium text-white mb-1.5 flex justify-between">
            <span>{tooltip.worker}</span>
            <span className="text-factory-dim font-mono text-xs">{tooltip.machine}</span>
          </div>
          <div className="flex justify-between items-center bg-[#1e293b] p-1.5 rounded mb-1">
            <span className="font-mono text-xs text-factory-dim">Efficiency</span>
            <span className="font-mono text-sm font-bold text-[#00D4FF]">{tooltip.val}%</span>
          </div>
          <div className="flex justify-between items-center bg-[#1e293b] p-1.5 rounded">
            <span className="font-mono text-xs text-factory-dim">Tasks Done</span>
            <span className="font-mono text-xs font-bold text-[#00FF94]">{Math.floor(tooltip.val * 1.5)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CompatibilityAI = () => {
  const scores = [
    { worker: 'Arjun Sharma', machine: 'M004', score: 91, label: 'AI Recommended', labelColor: 'text-[#00D4FF] border-[#00D4FF]/50 bg-[#00D4FF]/10' },
    { worker: 'Deepak Nair', machine: 'M008', score: 86, label: 'High Efficiency', labelColor: 'text-[#00FF94] border-[#00FF94]/50 bg-[#00FF94]/10' },
    { worker: 'Priya Patel', machine: 'M002', score: 80, label: 'Good Match', labelColor: 'text-[#FFB800] border-[#FFB800]/50 bg-[#FFB800]/10' },
    { worker: 'Rahul Mehta', machine: 'M005', score: 62, label: 'Needs Training', labelColor: 'text-[#FF3860] border-[#FF3860]/50 bg-[#FF3860]/10' },
  ];

  return (
    <div className="factory-card h-full flex flex-col animate-fade-up mt-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0 flex items-center gap-2"><Award size={16} className="text-[#00D4FF]"/> COMPATIBILITY LEADERBOARD</h2>
      </div>
      <div className="space-y-4 flex-1 mt-2">
        {scores.map((s, i) => (
          <div key={i} className="bg-factory-bg/30 border border-factory-border rounded p-3 flex flex-col gap-2 hover:border-[#00D4FF]/30 transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-factory-text group-hover:text-white transition-colors">{s.worker}</div>
                <div className="font-mono text-xs text-factory-dim flex items-center gap-1 mt-0.5"><Cpu size={12}/> Machine {s.machine}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold" style={{ color: s.score >= 90 ? '#00D4FF' : s.score >= 80 ? '#00FF94' : s.score >= 70 ? '#FFB800' : '#FF3860' }}>
                  {s.score}%
                </div>
                <div className="font-mono text-[10px] text-factory-dim -mt-1">SCORE</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="h-1.5 flex-1 bg-factory-bg rounded overflow-hidden mr-4">
                <div className="h-full rounded transition-all duration-1000" style={{ backgroundColor: s.score >= 90 ? '#00D4FF' : s.score >= 80 ? '#00FF94' : s.score >= 70 ? '#FFB800' : '#FF3860', width: `${s.score}%` }}></div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${s.labelColor} whitespace-nowrap`}>{s.label.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function WorkersPage() {
  const { data: workers, loading, reload, create } = useApi('/workers');
  const [search, setSearch] = useState('');
  const [dept, setDept]     = useState('all');
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const departments = [...new Set(workers.map(w => w.department).filter(Boolean))];
  const filtered = workers.filter(w => {
    const matchSearch = (w.name || '').toLowerCase().includes(search.toLowerCase())
      || (w.role || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'all' || w.department === dept;
    return matchSearch && matchDept;
  });

  const workerPerformanceLive = useLivestreamData(
    WORKER_PERFORMANCE,
    {
      arjun: { min: 70, max: 100, variation: 3 },
      vikram: { min: 75, max: 100, variation: 2.5 },
      priya: { min: 65, max: 98, variation: 4 },
      sneha: { min: 70, max: 95, variation: 3.5 }
    },
    3000,
    15
  );

  const avgPerf = workers.length
    ? Math.round(workers.reduce((s, w) => s + (w.performance?.score ?? w.performance ?? 0), 0) / workers.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">WORKFORCE MANAGEMENT</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Worker profiles, performance tracking, and skill-based assignments</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 hover:-translate-y-1 transition-transform">
          <Plus size={14} /> ADD WORKER
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label:'Total Workers',    value: workers.length,                                    color:'text-factory-accent' },
          { label:'Active',           value: workers.filter(w => w.status === 'active').length, color:'text-factory-green' },
          { label:'On Leave',         value: workers.filter(w => w.status === 'on-leave').length,color:'text-factory-amber' },
          { label:'Avg Performance',  value: `${avgPerf}%`,                                     color:'text-factory-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="factory-card text-center">
            <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* AI Insights & Performance */}
      <AiInsightsPanel />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up stagger-2">
        <div className="lg:col-span-2 factory-card flex flex-col justify-center h-full">
          <div className="flex items-center gap-2 mb-4">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px]">LIVE PERFORMANCE TREND</div>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workerPerformanceLive} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="timeLabel" tick={{ fill:'#5A7A9A', fontSize:10 }} minTickGap={20} />
                <YAxis domain={[60, 100]} tick={{ fill:'#5A7A9A', fontSize:10 }} />
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                <Line type="monotone" dataKey="arjun"  stroke="#00D4FF" strokeWidth={2} dot={false} name="Arjun" isAnimationActive={false} />
                <Line type="monotone" dataKey="vikram" stroke="#00FF94" strokeWidth={2} dot={false} name="Vikram" isAnimationActive={false} />
                <Line type="monotone" dataKey="priya"  stroke="#FFB800" strokeWidth={2} dot={false} name="Priya" isAnimationActive={false} />
                <Line type="monotone" dataKey="sneha"  stroke="#FF3860" strokeWidth={2} dot={false} name="Sneha" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ShiftOptimizationAI />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up stagger-3 mb-6">
        <WorkerMachineHeatmap />
        <CompatibilityAI />
      </div>

      {/* Filters */}
      <div className="flex gap-3 animate-fade-up stagger-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-factory-dim" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search workers..." />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} className="input-field w-44">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Worker grid */}
      {loading ? (
        <div className="text-center py-12 text-factory-dim font-mono animate-pulse">Loading workforce data...</div>
      ) : workers.length === 0 ? (
        <div className="factory-card text-center py-12 text-factory-dim font-mono">No workers found. Click ADD WORKER to add team members.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((w, i) => (
            <div key={w._id || w.workerId} style={{ animationDelay:`${i * 50}ms` }}>
              <WorkerCard worker={w} onClick={(worker) => navigate(`/workers/${worker._id || worker.workerId}`, { state: { worker } })} />
            </div>
          ))}
        </div>
      )}

      {/* Worker-Machine table */}
      {workers.filter(w => w.assignedMachine).length > 0 && (
        <div className="factory-card animate-fade-up">
          <div className="section-title mb-4">WORKER–MACHINE CORRELATION</div>
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  {['WORKER','MACHINE','DEPT','PERFORMANCE','MATCH SCORE'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workers.filter(w => w.assignedMachine).map(w => {
                  const perf = w.performance?.score ?? w.performance ?? 0;
                  const safety = w.safetyScore ?? 100;
                  const pend = w.performance?.pendingTasks ?? w.pendingTasks ?? 0;
                  const matchScore = Math.round(perf * 0.4 + safety * 0.35 + Math.max(0, 100 - pend * 10) * 0.25);
                  const machineName = w.assignedMachine?.name || w.assignedMachine || '—';
                  return (
                    <tr key={w._id || w.workerId} className="border-b border-factory-border/30 hover:bg-factory-border/20 transition-colors">
                      <td className="py-2.5 text-factory-text">{w.name}</td>
                      <td className="py-2.5 text-factory-accent">{machineName}</td>
                      <td className="py-2.5 text-factory-dim">{w.department}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-factory-bg rounded overflow-hidden">
                            <div className={`h-full rounded ${perf > 90 ? 'bg-factory-green' : 'bg-factory-amber'}`} style={{ width:`${perf}%` }} />
                          </div>
                          <span className={perf > 90 ? 'text-factory-green' : 'text-factory-amber'}>{perf}%</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${matchScore > 85 ? 'bg-factory-green/10 text-factory-green border border-factory-green/30' : 'bg-factory-amber/10 text-factory-amber border border-factory-amber/30'}`}>
                          {matchScore}/100
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adding   && <AddWorkerModal onClose={() => setAdding(false)} onCreate={create} />}
    </div>
  );
}
