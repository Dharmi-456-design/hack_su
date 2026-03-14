import React, { useState } from 'react';
import { MACHINES, MACHINE_HISTORY } from '../data/dummyData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wrench, AlertTriangle, Brain, Clock, TrendingUp, CheckCircle } from 'lucide-react';

// Simulated AI prediction logic
function predictFailure(machine) {
  let riskScore = 0;
  if (machine.temperature > 95) riskScore += 40;
  else if (machine.temperature > 80) riskScore += 20;
  else riskScore += 5;
  if (machine.vibration > 2) riskScore += 30;
  else if (machine.vibration > 1) riskScore += 15;
  else riskScore += 2;
  const daysSinceMaint = Math.floor((new Date() - new Date(machine.lastMaintenance)) / (1000 * 60 * 60 * 24));
  if (daysSinceMaint > 90) riskScore += 25;
  else if (daysSinceMaint > 60) riskScore += 15;
  else riskScore += 3;
  if (machine.efficiency < 60) riskScore += 15;
  else if (machine.efficiency < 80) riskScore += 8;
  return Math.min(100, riskScore);
}

function getRiskLevel(score) {
  if (score >= 70) return { label: 'HIGH', color: 'text-factory-red', bg: 'bg-factory-red/10', border: 'border-factory-red/40', badge: 'badge-critical' };
  if (score >= 40) return { label: 'MEDIUM', color: 'text-factory-amber', bg: 'bg-factory-amber/10', border: 'border-factory-amber/40', badge: 'badge-warning' };
  return { label: 'LOW', color: 'text-factory-green', bg: 'bg-factory-green/10', border: 'border-factory-green/30', badge: 'badge-operational' };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const temp = payload.find(p => p.dataKey === 'temperature')?.value;
  const vib = payload.find(p => p.dataKey === 'vibration')?.value;
  let status = 'OPERATIONAL';
  let statusColor = '#22C55E';
  if (temp > 95 || vib > 2) { status = 'CRITICAL'; statusColor = '#EF4444'; }
  else if (temp > 80 || vib > 1) { status = 'WARNING'; statusColor = '#F59E0B'; }

  return (
    <div style={{
      background: '#0c1628ee',
      backdropFilter: 'blur(14px)',
      border: `1px solid #00E5FF44`,
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: `0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,229,255,0.08)`,
      minWidth: '160px',
      animation: 'fadeInUp 0.2s ease-out'
    }}>
      <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        TIME: {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
          <span style={{ color: '#64748b', fontSize: '12px' }}>{p.name}:</span>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginLeft: 'auto' }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #1e293b', marginTop: '8px', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}`, animation: 'pulse-dot 2s infinite' }} />
        <span style={{ color: statusColor, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{status}</span>
      </div>
    </div>
  );
};

export default function MaintenancePage() {
  const [selected, setSelected] = useState(null);
  
  const machinesWithRisk = MACHINES.map(m => ({ ...m, riskScore: predictFailure(m) }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const highRisk = machinesWithRisk.filter(m => m.riskScore >= 70);
  const medRisk = machinesWithRisk.filter(m => m.riskScore >= 40 && m.riskScore < 70);

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
            <div className="font-display text-2xl font-bold text-factory-green">{machinesWithRisk.filter(m => m.riskScore < 40).length}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">LOW RISK</div>
            <div className="text-xs text-factory-dim mt-1">Normal operation</div>
          </div>
        </div>
      </div>

      {/* Risk cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machinesWithRisk.map((m, i) => {
          const risk = getRiskLevel(m.riskScore);
          const daysSinceMaint = Math.floor((new Date() - new Date(m.lastMaintenance)) / (1000 * 60 * 60 * 24));
          const daysUntilMaint = Math.floor((new Date(m.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24));
          return (
            <div key={m.id} className={`factory-card ${risk.bg} border ${risk.border} cursor-pointer hover:scale-105 transition-all duration-200 animate-fade-up`}
              style={{ animationDelay: `${i * 50}ms` }} onClick={() => setSelected(selected?.id === m.id ? null : m)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-factory-text">{m.name}</div>
                  <div className="font-mono text-xs text-factory-dim">{m.id} · {m.department}</div>
                </div>
                <div className="text-right">
                  <div className={`font-display text-2xl font-bold ${risk.color}`}>{m.riskScore}%</div>
                  <span className={risk.badge}>{risk.label} RISK</span>
                </div>
              </div>

              {/* Risk bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-mono text-factory-dim mb-1">
                  <span>Failure Risk Score</span>
                  <span>{m.riskScore}%</span>
                </div>
                <div className="h-2 bg-factory-bg rounded overflow-hidden">
                  <div className={`h-full rounded transition-all duration-700`}
                    style={{ 
                      width: `${m.riskScore}%`,
                      background: m.riskScore >= 70 ? 'linear-gradient(90deg, #EF4444, #FF0055)' : m.riskScore >= 40 ? '#F59E0B' : '#22C55E',
                      boxShadow: m.riskScore >= 70 ? '0 0 10px rgba(239,68,68,0.8)' : 'none',
                      animation: m.riskScore >= 70 ? 'pulse-dot 2s infinite' : 'none'
                    }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-factory-dim" />
                  <span className="text-factory-dim">Last maint: </span>
                  <span className="text-factory-text">{daysSinceMaint}d ago</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wrench size={10} className={daysUntilMaint < 0 ? 'text-factory-red' : 'text-factory-dim'} />
                  <span className="text-factory-dim">Next: </span>
                  <span className={daysUntilMaint < 0 ? 'text-factory-red' : 'text-factory-text'}>{daysUntilMaint < 0 ? `${Math.abs(daysUntilMaint)}d OVERDUE` : `${daysUntilMaint}d`}</span>
                </div>
              </div>

              {/* AI Recommendation */}
              {m.riskScore >= 40 && (
                <div className="mt-3 pt-3 border-t border-factory-border/50">
                  <div className="flex items-start gap-2">
                    <Brain size={12} className="text-factory-accent mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-factory-dim">
                      <span className="text-factory-accent font-medium">AI Recommendation: </span>
                      {m.riskScore >= 70
                        ? `Immediate inspection required. ${m.temperature > 90 ? 'Critical temperature detected. ' : ''}${m.vibration > 1 ? 'Abnormal vibration levels. ' : ''}${daysUntilMaint < 0 ? 'Maintenance overdue.' : ''}`
                        : `Schedule maintenance within 30 days. Monitor ${m.temperature > 75 ? 'temperature' : 'vibration'} closely.`}
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded chart */}
              {selected?.id === m.id && (
                <div className="mt-4 pt-4 border-t border-factory-border" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="section-title mb-0">24-HOUR SENSOR HISTORY</div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div style={{ width: 10, height: 3, background: '#EF4444', borderRadius: 2 }} />
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Temperature</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 10, height: 3, background: '#22C55E', borderRadius: 2 }} />
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Vibration</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={MACHINE_HISTORY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gVib" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} dy={5} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00E5FF', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} fill="url(#gTemp)" name="Temperature" dot={false}
                        activeDot={{ r: 5, fill: '#EF4444', stroke: '#020617', strokeWidth: 2, filter: 'drop-shadow(0 0 6px #EF4444)' }} />
                      <Area type="monotone" dataKey="vibration" stroke="#22C55E" strokeWidth={2} fill="url(#gVib)" name="Vibration" dot={false}
                        activeDot={{ r: 5, fill: '#22C55E', stroke: '#020617', strokeWidth: 2, filter: 'drop-shadow(0 0 6px #22C55E)' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <button className="mt-4 btn-primary w-full text-sm flex items-center justify-center gap-2 hover:-translate-y-1 transition-transform" style={{ boxShadow: '0 4px 15px rgba(0,229,255,0.2)' }}>
                    <CheckCircle size={14} /> SCHEDULE MAINTENANCE
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
