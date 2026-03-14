import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { User, Star, CheckCircle, Clock, Shield, Cpu, ArrowLeft, Activity, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-factory-panel border border-factory-border rounded p-3 font-mono text-xs shadow-xl">
      <div className="text-factory-dim mb-1">{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

export default function WorkerProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Try to use passed state data
  const worker = location.state?.worker;

  if (!worker) {
    // Fallback if accessed directly
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64 factory-card">
        <p className="text-factory-dim font-mono mb-4 text-lg">Worker data not found. Please select a worker from the main list.</p>
        <button onClick={() => navigate('/workers')} className="btn-primary flex items-center gap-2">
          <ArrowLeft size={16} /> BACK TO WORKERS
        </button>
      </div>
    );
  }

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

  const trendData = useMemo(() => {
    return [
      { week: 'Week 1', score: Math.max(60, perf - Math.floor(Math.random() * 15)) },
      { week: 'Week 2', score: Math.max(60, perf - Math.floor(Math.random() * 10)) },
      { week: 'Week 3', score: Math.max(60, perf - Math.floor(Math.random() * 5)) },
      { week: 'Week 4', score: perf },
    ];
  }, [perf]);

  const isTopPerformer = perf >= 90;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header section with back button */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/workers')} className="p-2 rounded border border-factory-border bg-factory-bg hover:bg-factory-border/50 hover:text-white transition-colors text-factory-dim">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title mb-0">WORKER PROFILE</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Detailed performance and skill analytics • {worker.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="factory-card text-center relative overflow-hidden">
            {isTopPerformer && (
              <div className="absolute top-3 right-3 bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/30 px-2 py-1 rounded text-xs font-mono flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,148,0.2)]">
                <Star size={12} className="fill-[#00FF94]"/> TOP PERFORMER
              </div>
            )}
            
            <div className="w-24 h-24 mx-auto rounded-2xl bg-factory-accent/10 border-2 border-factory-accent/30 flex items-center justify-center font-display text-3xl font-bold text-factory-accent mb-4 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
              {(worker.name || '?').split(' ').map(n => n[0]).join('')}
            </div>
            
            <h2 className="font-display text-2xl font-bold text-white tracking-wide">{worker.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1 mb-4">
              <span className="font-mono text-sm text-factory-dim">{worker.workerId}</span>
              <span className="text-factory-dim">•</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${worker.status === 'active' ? 'bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/30' : 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30'}`}>
                {(worker.status || 'Unknown').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-factory-bg/50 p-3 rounded border border-factory-border/50">
                <div className="font-mono text-xs text-factory-dim mb-1">DEPARTMENT</div>
                <div className="text-sm font-medium text-white">{worker.department || '—'}</div>
              </div>
              <div className="bg-factory-bg/50 p-3 rounded border border-factory-border/50">
                <div className="font-mono text-xs text-factory-dim mb-1">ROLE</div>
                <div className="text-sm font-medium text-white">{worker.role || '—'}</div>
              </div>
            </div>

            <div className="mt-4 bg-factory-bg/30 p-3 rounded border border-factory-border/30 text-left">
              <div className="font-mono text-xs text-factory-dim mb-2 flex items-center gap-1"><Clock size={12}/> SHIFT & SCHEDULE</div>
              <div className="text-sm font-medium text-white flex justify-between">
                <span>{worker.shift || 'Morning'} Shift</span>
                <span className="text-factory-dim">{worker.joinDate ? new Date(worker.joinDate).toLocaleDateString() : 'Joined 2023'}</span>
              </div>
            </div>
          </div>

          <div className="factory-card !mt-0">
            <div className="section-title mb-4 flex items-center gap-2"><Cpu size={16} className="text-[#00D4FF]"/> ASSIGNED MACHINE</div>
            {machine !== 'None' ? (
              <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 p-4 rounded-lg flex items-center justify-between group hover:border-[#00D4FF]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-[#00D4FF] transition-colors">{machine}</div>
                    <div className="font-mono text-xs text-factory-dim">Current Assignment</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#00FF94] bg-[#00FF94]/10 border border-[#00FF94]/30 px-2 py-1 rounded">Optimal</span>
              </div>
            ) : (
              <div className="text-factory-dim font-mono text-sm justify-center flex py-4">No machine currently assigned.</div>
            )}
          </div>
          
          {skills.length > 0 && (
            <div className="factory-card !mt-6">
              <div className="section-title mb-3">CERTIFICATIONS & SKILLS</div>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill} className="text-xs font-mono px-3 py-1.5 border border-factory-accent/30 bg-factory-accent/10 rounded text-factory-accent hover:bg-factory-accent hover:text-black transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="factory-card bg-gradient-to-br from-factory-panel to-[#00D4FF]/5 !p-4">
              <div className="flex justify-between items-start mb-2">
                <Star size={16} className="text-[#00D4FF]" />
                <span className="text-xs font-mono text-factory-dim">PERFORMANCE</span>
              </div>
              <div className="font-display text-3xl font-bold text-[#00D4FF]">{perf}%</div>
              <div className="h-1 bg-factory-bg mt-2 rounded overflow-hidden">
                <div className="h-full bg-[#00D4FF] rounded" style={{ width: `${perf}%` }}></div>
              </div>
            </div>
            
            <div className="factory-card bg-gradient-to-br from-factory-panel to-[#00FF94]/5 !p-4">
              <div className="flex justify-between items-start mb-2">
                <Shield size={16} className="text-[#00FF94]" />
                <span className="text-xs font-mono text-factory-dim">SAFETY SCORE</span>
              </div>
              <div className="font-display text-3xl font-bold text-[#00FF94]">{safety}</div>
              <div className="h-1 bg-factory-bg mt-2 rounded overflow-hidden">
                <div className="h-full bg-[#00FF94] rounded" style={{ width: `${safety}%` }}></div>
              </div>
            </div>

            <div className="factory-card bg-gradient-to-br from-factory-panel to-[#00FF94]/5 !p-4">
              <div className="flex justify-between items-start mb-2">
                <CheckCircle size={16} className="text-[#00FF94]" />
                <span className="text-xs font-mono text-factory-dim">TASKS DONE</span>
              </div>
              <div className="font-display text-3xl font-bold text-white">{done}</div>
              <div className="text-xs font-mono text-[#00FF94] mt-1">This month</div>
            </div>

            <div className="factory-card bg-gradient-to-br from-factory-panel to-[#FFB800]/5 !p-4">
              <div className="flex justify-between items-start mb-2">
                <Clock size={16} className="text-[#FFB800]" />
                <span className="text-xs font-mono text-factory-dim">PENDING</span>
              </div>
              <div className="font-display text-3xl font-bold text-white">{pend}</div>
              <div className="text-xs font-mono text-[#FFB800] mt-1">Active tasks</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="factory-card flex flex-col h-full !mt-0 lg:!mt-0">
              <div className="section-title mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-[#00D4FF]"/> EFFICIENCY TREND</div>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                    <XAxis dataKey="week" tick={{ fill:'#5A7A9A', fontSize:10 }} />
                    <YAxis domain={[40, 100]} tick={{ fill:'#5A7A9A', fontSize:10 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="#00D4FF" strokeWidth={3} dot={{ fill: '#00D4FF', r: 4 }} activeDot={{ r: 6 }} name="Efficiency %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="factory-card flex flex-col h-full !mt-0">
              <div className="section-title mb-4 flex items-center gap-2"><Activity size={16} className="text-[#00D4FF]"/> SKILL ANALYSIS RADAR</div>
              <div className="flex-1 min-h-[220px] relative">
                <div className="absolute inset-0 bg-factory-accent/5 rounded-full blur-2xl opacity-50 scale-75"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="70%">
                    <PolarGrid stroke="#1E3A5F" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill:'#5A7A9A', fontSize:10 }} />
                    <Radar name="Score" dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.2} strokeWidth={2} />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
