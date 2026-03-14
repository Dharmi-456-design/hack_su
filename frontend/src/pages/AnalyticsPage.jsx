import React from 'react';
import { ANALYTICS, MONTHLY_PERFORMANCE, DEPARTMENT_STATS, MACHINES, WORKERS } from '../data/dummyData';
import { useLivestreamData } from '../hooks/useLivestreamData';
import { useLiveEntities } from '../hooks/useLiveEntities';
import LiveChartIndicator from '../components/common/LiveChartIndicator';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, ScatterChart, Scatter } from 'recharts';
import { LineChart, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-factory-panel border border-factory-border rounded p-3 font-mono text-xs">
      <div className="text-factory-dim mb-1">{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

function GaugeChart({ value, max = 100, label, color = '#00D4FF' }) {
  const pct = (value / max) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1E3A5F" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}66)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="font-mono text-xs text-factory-dim mt-1 text-center">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const liveMachines = useLiveEntities(MACHINES, { efficiency: { min: 40, max: 100, variation: 2, isInt: true } }, 2500);
  const liveWorkers = useLiveEntities(WORKERS, { performance: { min: 70, max: 100, variation: 2, isInt: true } }, 2500);
  const liveDepts = useLiveEntities(DEPARTMENT_STATS, { efficiency: { min: 70, max: 100, variation: 3, isInt: true } }, 3000);
  const liveMonthly = useLivestreamData(MONTHLY_PERFORMANCE, { production: { min: 12000, max: 16000, variation: 50, isInt: true } }, 3000, 6);

  const avgMachineEff = Math.round(liveMachines.filter(m => m.status !== 'offline').reduce((s, m) => s + m.efficiency, 0) / Math.max(1, liveMachines.filter(m => m.status !== 'offline').length));
  const avgWorkerPerf = Math.round(liveWorkers.reduce((s, w) => s + w.performance, 0) / Math.max(1, liveWorkers.length));
  const productionEff = Math.round((ANALYTICS.productionToday / ANALYTICS.productionTarget) * 100);

  return (
    <div className="space-y-6">
      <div className="animate-slide-in">
        <h1 className="page-title">ANALYTICS DASHBOARD</h1>
        <p className="text-factory-dim font-body text-sm mt-1">Comprehensive factory intelligence and performance metrics</p>
      </div>

      {/* Gauge row */}
      <div className="factory-card animate-fade-up">
        <div className="section-title mb-6">SYSTEM HEALTH INDICATORS</div>
        <div className="flex justify-around flex-wrap gap-4">
          <GaugeChart value={avgMachineEff} label="Machine Efficiency" color="#00D4FF" />
          <GaugeChart value={avgWorkerPerf} label="Worker Performance" color="#00FF94" />
          <GaugeChart value={productionEff} label="Production Rate" color="#FFB800" />
          <GaugeChart value={ANALYTICS.overallEfficiency} label="Overall Efficiency" color="#00D4FF" />
          <GaugeChart value={87} label="Inventory Health" color="#00FF94" />
          <GaugeChart value={96} label="Safety Score" color="#00FF94" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="factory-card animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px]">LIVE PRODUCTION & EFFICIENCY</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={liveMonthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="timeLabel" tick={{ fill: '#5A7A9A', fontSize: 10, fontFamily: 'Share Tech Mono' }} minTickGap={20} />
              <YAxis tick={{ fill: '#5A7A9A', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
              <Area type="monotone" dataKey="production" stroke="#00D4FF" fill="url(#prodGrad)" strokeWidth={2} name="Production" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="factory-card animate-fade-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px]">LIVE DEPARTMENT RADAR</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={liveDepts}>
              <PolarGrid stroke="#1E3A5F" />
              <PolarAngleAxis dataKey="dept" tick={{ fill: '#5A7A9A', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
              <Radar name="Efficiency" dataKey="efficiency" stroke="#00FF94" fill="#00FF94" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Machine efficiency ranking */}
      <div className="factory-card animate-fade-up stagger-4">
        <div className="flex items-center gap-2 mb-4">
          <LiveChartIndicator />
          <div className="section-title mb-0 relative top-[1px]">LIVE MACHINE EFFICIENCY RANKING</div>
        </div>
        <div className="space-y-3">
          {[...liveMachines].sort((a, b) => b.efficiency - a.efficiency).map((m, i) => (
            <div key={m.id} className="flex items-center gap-4">
              <div className="font-display text-lg font-bold text-factory-dim w-6 text-center">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-factory-text text-sm">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-bold text-sm ${m.efficiency > 80 ? 'text-factory-green' : m.efficiency > 60 ? 'text-factory-amber' : 'text-factory-red'}`}>{m.efficiency}%</span>
                    <span className={`badge-${m.status === 'operational' ? 'operational' : m.status === 'warning' ? 'warning' : m.status === 'critical' ? 'critical' : 'offline'}`}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-factory-bg rounded overflow-hidden">
                  <div className={`h-full rounded transition-all duration-700 ${m.efficiency > 80 ? 'bg-factory-green' : m.efficiency > 60 ? 'bg-factory-amber' : 'bg-factory-red'}`}
                    style={{ width: `${m.efficiency}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
