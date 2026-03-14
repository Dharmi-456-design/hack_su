import React, { useState, useMemo } from 'react';
import { SAFETY_INCIDENTS, WORKERS, MACHINES } from '../data/dummyData';
import { useLiveEntities } from '../hooks/useLiveEntities';
import LiveChartIndicator from '../components/common/LiveChartIndicator';
import { ShieldCheck, AlertTriangle, Clock, User, CheckCircle, Info, ChevronRight, ShieldAlert, XCircle, AlertCircle, Cpu, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SafetyPage() {
  const liveWorkers = useLiveEntities(WORKERS, { safetyScore: { min: 60, max: 100, variation: 2, isInt: true } }, 2500);
  const liveMachines = useLiveEntities(MACHINES, { temperature: { min: 65, max: 105, variation: 5 }, vibration: { min: 0.1, max: 3.5, variation: 0.4 }, efficiency: { min: 50, max: 100, variation: 2 } }, 2500);
  const avgSafetyScore = Math.round(liveWorkers.reduce((s, w) => s + w.safetyScore, 0) / liveWorkers.length);
  const resolvedCount = SAFETY_INCIDENTS.filter(i => i.status === 'resolved').length;

  const machineRisks = useMemo(() => {
    return liveMachines.map(m => {
      // Simulate operator hours using machine id to keep it deterministic for demo
      const charCodeSum = m.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const operatorHours = (charCodeSum % 5) + 6; // 6 to 10 hours
      
      let riskFactors = 0;
      const causes = [];
      const isHighTemp = m.temperature > 95;
      const isHighVib = m.vibration > 2.5;
      const isHighUsage = m.runtime > 1500;
      const isOperatorFatigue = operatorHours > 8;
      
      if (isHighTemp) { riskFactors++; causes.push('High temperature'); }
      if (isHighVib) { riskFactors++; causes.push('High vibration'); }
      if (isHighUsage) { riskFactors++; causes.push('High usage hours'); }
      if (isOperatorFatigue) { riskFactors++; causes.push('Operator fatigue'); }
      if (m.efficiency < 75) { riskFactors++; causes.push('Efficiency drop'); }
      
      // Calculate realistic score
      let riskScore = 15; // base risk
      if (riskFactors >= 2) riskScore += Math.floor(Math.random() * 20) + 60; // pushes it above 75 if multiple factors
      else riskScore += riskFactors * 20; 
      
      if (riskScore > 98) riskScore = 98;
      
      let level = 'Low';
      let color = '#22C55E';
      
      if (riskScore >= 70) { level = 'High'; color = '#EF4444'; } 
      else if (riskScore >= 40) { level = 'Medium'; color = '#FFB800'; }
      
      let recAction = 'Continue normal operations.';
      if (level === 'High') recAction = 'Stop machine temporarily and inspect.';
      else if (level === 'Medium') recAction = 'Schedule machine inspection soon.';
      
      return {
        ...m,
        operatorHours,
        riskScore,
        level,
        color,
        causes,
        recommendedAction: recAction
      };
    }).sort((a,b) => b.riskScore - a.riskScore);
  }, [liveMachines]);

  const highRiskMachines = machineRisks.filter(m => m.riskScore >= 70);

  const severityConfig = {
    low: { badge: 'badge-operational', color: 'text-factory-green', border: 'border-factory-green/30', bg: 'bg-factory-green/5' },
    medium: { badge: 'badge-warning', color: 'text-factory-amber', border: 'border-factory-amber/30', bg: 'bg-factory-amber/5' },
    high: { badge: 'badge-critical', color: 'text-factory-red', border: 'border-factory-red/30', bg: 'bg-factory-red/5' },
  };

  return (
    <div className="space-y-6">
      <div className="animate-slide-in">
        <h1 className="page-title">SAFETY MONITORING</h1>
        <p className="text-factory-dim font-body text-sm mt-1">Incident tracking, safety scores, and compliance monitoring</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label: 'Avg Safety Score', value: `${avgSafetyScore}/100`, color: 'text-factory-green' },
          { label: 'Total Incidents', value: SAFETY_INCIDENTS.length, color: 'text-factory-amber' },
          { label: 'Resolved', value: resolvedCount, color: 'text-factory-green' },
          { label: 'Days Since Incident', value: 16, color: 'text-factory-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="factory-card text-center">
            <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* AI Accident Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up stagger-2">
        <div className="factory-card !bg-transparent border-none p-0 flex flex-col gap-4">
          <div className="factory-card h-full">
            <div className="section-title mb-6 flex items-center gap-2">
              <Cpu size={18} className="text-[#00D4FF]" />
              AI ACCIDENT PREDICTION
            </div>

            {highRiskMachines.length > 0 ? (
              <div className="mb-6 space-y-3">
                {highRiskMachines.map(m => (
                  <div key={m.id} className="bg-[#111e32]/80 border border-factory-red/30 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-factory-red shadow-[0_0_10px_#EF4444]" />
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-factory-red" />
                        <h4 className="font-display font-bold text-factory-red text-sm">Accident Risk Detected</h4>
                      </div>
                      <div className="font-mono text-xs font-bold leading-none bg-factory-red/20 text-factory-red px-2 py-1 rounded">
                        {m.riskScore}% RISK
                      </div>
                    </div>
                    <div className="font-medium text-white mb-2 text-sm ml-6">{m.name} ({m.id})</div>
                    <div className="space-y-1 mb-3 ml-6">
                      <div className="text-[10px] font-mono text-factory-dim uppercase">Identified Risk Factors:</div>
                      <ul className="list-disc pl-4 text-xs font-mono text-factory-text">
                        {m.causes.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                    <div className="ml-6 bg-factory-bg p-2.5 rounded text-xs font-mono flex items-start gap-2 border border-factory-border">
                      <Info size={14} className="text-[#00D4FF] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-factory-dim block mb-0.5 uppercase">Recommended Action</span>
                        <span className="text-white">{m.recommendedAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-xl border border-factory-green/30 bg-factory-green/5 flex items-center gap-3">
                <CheckCircle size={24} className="text-[#00FF94]" />
                <div>
                  <div className="font-bold text-[#00FF94] text-sm">System Normal</div>
                  <div className="text-xs text-factory-dim font-mono">No high-risk conditions detected</div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="text-[10px] font-mono text-factory-dim uppercase mb-2">Detailed Machine Risk Assessment</div>
              {machineRisks.slice(highRiskMachines.length, highRiskMachines.length + 3).map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-[#111e32]/80 border border-factory-border">
                  <div>
                    <div className="font-medium text-sm text-white">{m.name}</div>
                    <div className="text-xs font-mono text-factory-dim mt-0.5 max-w-[200px] truncate">
                      {m.causes.length > 0 ? m.causes.join(', ') : 'All parameters nominal'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-mono font-bold" style={{ color: m.color }}>{m.riskScore}% RISK</span>
                    <div className="w-20 h-1.5 bg-factory-bg rounded overflow-hidden">
                      <div className="h-full rounded" style={{ width: `${m.riskScore}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="factory-card flex flex-col items-stretch h-auto min-h-[460px]">
          <div className="flex items-center gap-2 mb-6">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px] flex items-center gap-2">
              <Activity size={18} className="text-factory-amber" />
              LIVE ACCIDENT RISK LEVELS
            </div>
          </div>
          <div className="flex-1 w-full relative min-h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineRisks} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#5A7A9A', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#5A7A9A', fontSize: 10, fontFamily: 'Share Tech Mono' }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#1E3A5F', opacity: 0.2 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0f172a] border border-factory-border rounded px-4 py-3 font-mono text-xs shadow-xl min-w-[200px] z-50 relative">
                        <div className="font-bold text-white mb-1.5 border-b border-[#1e293b] pb-1.5">{label}</div>
                        <div className="mb-2 font-bold" style={{ color: data.color }}>Risk Score: {data.riskScore}% ({data.level})</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-factory-text">
                          <span className="text-factory-dim">Temp:</span> <span className={data.temperature > 95 ? 'text-factory-red' : ''}>{data.temperature}°C</span>
                          <span className="text-factory-dim">Vib:</span> <span className={data.vibration > 2.5 ? 'text-factory-red' : ''}>{data.vibration}</span>
                          <span className="text-factory-dim">Usage:</span> <span className={data.runtime > 1500 ? 'text-factory-red' : ''}>{data.runtime}h</span>
                          <span className="text-factory-dim">Op Hrs:</span> <span className={data.operatorHours > 8 ? 'text-factory-red' : ''}>{data.operatorHours}h</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="riskScore" radius={[0, 3, 3, 0]} barSize={20}>
                  {machineRisks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Safety Score Bar Chart */}
      <div className="factory-card animate-fade-up stagger-3">
        <div className="flex items-center gap-2 mb-8">
          <LiveChartIndicator />
          <div className="section-title mb-0 flex items-center gap-2 relative top-[1px]">
            <ShieldCheck size={18} className="text-[#00D4FF]" />
            LIVE WORKER SAFETY SCORES
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 relative border-b border-factory-border/50 bg-[linear-gradient(to_top,rgba(30,58,95,0.1)_1px,transparent_1px)]" style={{ backgroundSize: '100% 32px' }}>
          {/* Y-Axis labels */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-factory-dim -ml-6">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {[...liveWorkers].sort((a, b) => b.safetyScore - a.safetyScore).map((w, i) => {
            let barColor = '';
            let glow = '';
            let statusText = '';
            
            if (w.safetyScore >= 98) {
              barColor = 'bg-[#00FF94]';
              glow = 'group-hover:shadow-[0_0_15px_rgba(0,255,148,0.6)]';
              statusText = 'Excellent';
            } else if (w.safetyScore >= 95) {
              barColor = 'bg-[#00D4FF]';
              glow = 'group-hover:shadow-[0_0_15px_rgba(0,212,255,0.6)]';
              statusText = 'Good';
            } else {
              barColor = 'bg-[#FFB800]';
              glow = 'group-hover:shadow-[0_0_15px_rgba(255,184,0,0.6)]';
              statusText = 'Needs Attention';
            }

            return (
              <div key={w.id} className="relative flex flex-col items-center flex-1 group" style={{ height: '100%' }}>
                <div 
                  className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ease-out absolute bottom-0 ${barColor} ${glow} opacity-80 group-hover:opacity-100 group-hover:scale-y-[1.02] transform origin-bottom cursor-pointer`}
                  style={{ height: `${w.safetyScore}%`, animationDelay: `${i * 50}ms`, animation: 'growUp 0.6s ease-out forwards' }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[#0f172a] border border-[#00D4FF]/30 p-2.5 rounded shadow-xl min-w-[140px] z-50 flex flex-col items-center">
                    <span className="text-white font-medium text-sm whitespace-nowrap mb-1">{w.name}</span>
                    <span className="font-mono text-xs text-factory-dim mb-1">Safety Score: <strong className={barColor.replace('bg-', 'text-')}>{w.safetyScore}</strong></span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-current ${barColor.replace('bg-', 'text-')}`}>
                      {statusText.toUpperCase()}
                    </span>
                  </div>
                </div>
                {/* X-Axis Label */}
                <div className="absolute top-full mt-2 w-full text-center">
                  <span className="text-[10px] md:text-xs font-mono text-factory-dim whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-full -rotate-45 origin-top-left md:rotate-0 translate-y-2 md:translate-y-0 text-center">
                    {w.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents - Professional Cards */}
      <div className="factory-card animate-fade-up stagger-4 bg-transparent border-none p-0">
        <div className="section-title mb-4 flex items-center gap-2 px-1">
          <AlertTriangle size={18} className="text-factory-amber" />
          SAFETY INCIDENT LOG
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAFETY_INCIDENTS.map((incident, i) => {
            const isHigh = incident.severity === 'high';
            const isMedium = incident.severity === 'medium';
            const sColor = isHigh ? '#FF3860' : isMedium ? '#FFB800' : '#00FF94';
            
            return (
              <div key={incident.id} className="bg-[#111e32]/80 border border-factory-border rounded-xl p-5 hover:-translate-y-1 hover:border-factory-accent/40 hover:shadow-[0_4px_20px_rgba(0,212,255,0.05)] transition-all duration-300 group cursor-pointer animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-opacity-10 border border-opacity-30 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${sColor}20`, borderColor: `${sColor}50`, color: sColor }}>
                      {isHigh ? <ShieldAlert size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base leading-tight group-hover:text-factory-accent transition-colors">{incident.type}</h3>
                      <div className="font-mono text-xs text-factory-dim">ID: {incident.id}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-opacity-30 tracking-wider" style={{ color: sColor, borderColor: sColor, backgroundColor: `${sColor}15` }}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded tracking-wider ${incident.status === 'resolved' ? 'bg-[#00FF94]/10 text-[#00FF94]' : incident.status === 'pending' ? 'bg-[#FFB800]/10 text-[#FFB800]' : 'bg-[#a855f7]/10 text-[#a855f7]'}`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm font-body text-factory-dim mb-4 leading-relaxed line-clamp-2">
                  {incident.description}
                </p>
                
                <div className="border-t border-factory-border/50 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-factory-dim">
                    <User size={12} className="text-factory-accent" />
                    <span>Reported by: <span className="text-white">{incident.worker}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-factory-dim">
                    <Clock size={12} className="text-factory-accent" />
                    <span>{incident.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Compliance Checklist */}
      <div className="factory-card animate-fade-up stagger-5 !mt-8">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={18} className="text-[#00FF94]" />
          <div className="section-title text-[#00FF94] mb-0 tracking-widest">SAFETY COMPLIANCE CHECKLIST</div>
        </div>
        <div className="grid gap-3">
          {[
            { title: 'Fire Safety Inspection', status: 'Completed', date: '18 Mar 2026', dept: 'Facilities' },
            { title: 'Emergency Exit Check', status: 'Completed', date: '15 Mar 2026', dept: 'Safety' },
            { title: 'Machine Guard Verification', status: 'Pending', date: 'Upcoming', dept: 'Maintenance' },
            { title: 'Electrical Safety Audit', status: 'Failed', date: '10 Mar 2026', dept: 'Electrical' },
            { title: 'Worker PPE Compliance', status: 'Completed', date: 'Daily', dept: 'Operations' },
          ].map((item, i) => {
            const isCompleted = item.status === 'Completed';
            const isFailed = item.status === 'Failed';
            const statusColor = isCompleted ? 'text-[#00FF94] bg-[#00FF94]/10 border-[#00FF94]/30' : isFailed ? 'text-[#FF3860] bg-[#FF3860]/10 border-[#FF3860]/30' : 'text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30';
            const StatusIcon = isCompleted ? CheckCircle : isFailed ? XCircle : Clock;

            return (
              <div key={item.title} className="bg-factory-bg/40 border border-factory-border rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-factory-bg transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center border ${isCompleted ? 'border-[#00FF94] bg-[#00FF94]/20 text-[#00FF94]' : 'border-factory-dim/50 text-factory-dim'}`}>
                    {isCompleted && <CheckCircle size={14} />}
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm md:text-base mb-1 group-hover:text-factory-accent transition-colors">{item.title}</h4>
                    <div className="flex items-center gap-3 text-xs font-mono text-factory-dim">
                      <span className="flex items-center gap-1"><Info size={12} /> {item.dept}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> Last Check: {item.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-4 ml-10 md:ml-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono tracking-wide ${statusColor}`}>
                    <StatusIcon size={12} />
                    {item.status.toUpperCase()}
                  </div>
                  <button className="text-factory-dim hover:text-factory-accent hover:bg-factory-accent/10 p-1.5 rounded transition-colors hidden md:block">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
