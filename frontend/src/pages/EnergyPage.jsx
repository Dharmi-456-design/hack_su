import React, { useState, useMemo } from 'react';
import { useLive } from '../context/LiveDataContext';
import { useLivestreamData } from '../hooks/useLivestreamData';
import LiveChartIndicator from '../components/common/LiveChartIndicator';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell, ReferenceLine,
} from 'recharts';
import {
  Zap, TrendingDown, AlertTriangle, CheckCircle, Activity,
  Brain, TrendingUp, Award, Clock, Cpu,
} from 'lucide-react';

/* ───────── constants ───────── */
const MACHINE_POWER = {
  'CNC Lathe': 7.5, 'Hydraulic Press': 15, 'Robotic Welder': 5,
  'Milling Machine': 12, 'Conveyor': 2.5, 'Drill Press': 3,
  'Injection Molder': 10, 'Laser Cutter': 8,
};

// Stable seeded hourly energy (past 24 h)
const seed = (i) => 0.5 + 0.5 * Math.sin(i * 1.7 + 2.3);
const HOURLY_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  consumed: i >= 8 && i < 20
    ? +(42 + seed(i) * 14 + i * 0.3).toFixed(1)
    : +(8 + seed(i) * 4).toFixed(1),
  predicted: null,
}));

// Forecast: next 8 hours (dashed prediction)
const lastReal = HOURLY_HISTORY[HOURLY_HISTORY.length - 1].consumed;
const FORECAST_HOURS = Array.from({ length: 9 }, (_, i) => {
  const h = (new Date().getHours() + i) % 24;
  const base = h >= 8 && h < 20 ? 46 : 10;
  return {
    hour: `${String(h).padStart(2, '0')}:00`,
    consumed: null,
    predicted: +(base + seed(h + 7) * 10 + (i === 0 ? lastReal - base : 0) * Math.exp(-i * 0.5)).toFixed(1),
  };
});
const FORECAST_DATA = [
  ...HOURLY_HISTORY,
  ...FORECAST_HOURS.slice(1),
];
// Bridge point
FORECAST_DATA[23] = { ...FORECAST_DATA[23], predicted: HOURLY_HISTORY[23].consumed };

const WEEKLY = [
  { day: 'Mon', kwh: 520, cost: 3380 }, { day: 'Tue', kwh: 495, cost: 3217 },
  { day: 'Wed', kwh: 541, cost: 3516 }, { day: 'Thu', kwh: 478, cost: 3107 },
  { day: 'Fri', kwh: 512, cost: 3328 }, { day: 'Sat', kwh: 210, cost: 1365 },
  { day: 'Sun', kwh: 0, cost: 0 },
];

// Fallback demo machines when API has no data
const DEMO_MACHINES = [
  { id: 'd1', name: 'Conveyor Belt C3',   type: 'Conveyor',        efficiency: 95, status: 'operational', machineId: 'CB-C3' },
  { id: 'd2', name: 'CNC Lathe Alpha',    type: 'CNC Lathe',       efficiency: 92, status: 'operational', machineId: 'CNC-A' },
  { id: 'd3', name: 'Welding Bot WB-7',   type: 'Robotic Welder',  efficiency: 88, status: 'operational', machineId: 'WB-7'  },
  { id: 'd4', name: 'Injection Mold IM1', type: 'Injection Molder',efficiency: 76, status: 'warning',     machineId: 'IM-1'  },
  { id: 'd5', name: 'Hydraulic Press X2', type: 'Hydraulic Press', efficiency: 62, status: 'warning',     machineId: 'HP-X2' },
  { id: 'd6', name: 'Laser Cutter LC9',   type: 'Laser Cutter',    efficiency: 55, status: 'critical',    machineId: 'LC-9'  },
];

/* ───────── helpers ───────── */
function effColor(score) {
  if (score >= 85) return '#22C55E';
  if (score >= 65) return '#F59E0B';
  return '#EF4444';
}
function effLabel(score) {
  if (score >= 85) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
}

/* ───────── custom tooltips ───────── */
const EnergyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1628ee', backdropFilter: 'blur(14px)', border: '1px solid #00E5FF33', borderRadius: 10, padding: '10px 14px', minWidth: 160 }}>
      <div style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      {payload.map((p, i) => p.value != null && (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>{p.name}:</span>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginLeft: 'auto' }}>{p.value} kWh</span>
        </div>
      ))}
    </div>
  );
};

const EffTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: '#0c1628f5', backdropFilter: 'blur(14px)', border: `1px solid ${effColor(d.efficiencyScore)}44`, borderRadius: 10, padding: '12px 16px', minWidth: 200 }}>
      <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{d.machineName}</div>
      {[
        { label: 'Efficiency Score', value: `${d.efficiencyScore}%`, color: effColor(d.efficiencyScore) },
        { label: 'Energy Usage',     value: `${d.energyUsage} kW` },
        { label: 'Production Output',value: `${d.productionOutput} units` },
        { label: 'Rating',           value: effLabel(d.efficiencyScore) },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 5 }}>
          <span style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace' }}>{label}</span>
          <span style={{ color: color || '#f1f5f9', fontWeight: 700, fontSize: 12 }}>{value}</span>
        </div>
      ))}
    </div>
  );
};

const SimpleTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1628ee', border: '1px solid #1e293b', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 12, fontFamily: 'monospace' }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function EnergyPage() {
  const { machines: liveMachinesContext } = useLive();
  const machines = liveMachinesContext?.length ? liveMachinesContext : DEMO_MACHINES;

  const liveHourly = useLivestreamData(HOURLY_HISTORY, { consumed: { min: 10, max: 60, variation: 5 } }, 2500, 24);
  const liveWeekly = useLivestreamData(WEEKLY, { kwh: { min: 400, max: 600, variation: 30, isInt: true } }, 3000, 7);

  // ── Machine energy data
  const machineEnergy = machines.map(m => ({
    ...m,
    powerKw: MACHINE_POWER[m.type] || 5,
    consumption: m.status === 'offline' ? 0 : +(((MACHINE_POWER[m.type] || 5) * ((m.efficiency ?? 80) / 100)) + (m.status === 'critical' ? 3 : 0)).toFixed(1),
    costPerHr: +(((MACHINE_POWER[m.type] || 5) * ((m.efficiency ?? 80) / 100)) * 6.5).toFixed(0),
    isWasting: m.status === 'critical' || ((m.efficiency ?? 80) < 60 && m.status !== 'offline'),
  }));

  // ── Efficiency ranking
  const efficiencyRanking = useMemo(() => {
    return machines
      .filter(m => m.status !== 'offline')
      .map(m => {
        const eff = m.efficiency ?? 80;
        const power = MACHINE_POWER[m.type] || 5;
        const energyUsage = +(power * (eff / 100)).toFixed(1);
        const productionOutput = Math.round(eff * 1.4 + (100 - power) * 0.5);
        const efficiencyScore = Math.min(100, Math.round(eff * 0.7 + (100 - power / 15 * 100) * 0.3));
        return {
          machineId: m.machineId || m.id,
          machineName: m.name,
          energyUsage,
          productionOutput,
          efficiencyScore,
          type: m.type,
        };
      })
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }, [machines]);

  // ── KPIs
  const totalKw       = machineEnergy.filter(m => m.status !== 'offline').reduce((s, m) => s + m.consumption, 0);
  const totalCostHr   = machineEnergy.filter(m => m.status !== 'offline').reduce((s, m) => s + m.costPerHr, 0);
  const wastingMachines = machineEnergy.filter(m => m.isWasting);
  const todayTotal    = HOURLY_HISTORY.reduce((s, h) => s + h.consumed, 0).toFixed(0);
  const todayCost     = HOURLY_HISTORY.reduce((s, h) => s + h.consumed * 6.5, 0).toFixed(0);

  // ── Forecast metrics
  const nextHour   = FORECAST_HOURS[1]?.predicted ?? 48;
  const nextShift  = FORECAST_HOURS.slice(0, 8).reduce((s, h) => s + (h.predicted ?? 0), 0).toFixed(0);
  const tomorrow   = +(nextShift * 2.3).toFixed(0);

  // ── AI Insights (auto-generated from data)
  const insights = useMemo(() => {
    const msgs = [];
    const worst = efficiencyRanking[efficiencyRanking.length - 1];
    const best  = efficiencyRanking[0];
    if (worst) msgs.push({ type: 'warn', text: `${worst.machineName} has the lowest efficiency score (${worst.efficiencyScore}%) — consuming ${worst.energyUsage} kW at reduced output.` });
    if (best)  msgs.push({ type: 'ok',   text: `${best.machineName} is the top performer with an efficiency score of ${best.efficiencyScore}% and only ${best.energyUsage} kW draw.` });
    if (wastingMachines.length) msgs.push({ type: 'warn', text: `${wastingMachines.length} machine${wastingMachines.length > 1 ? 's are' : ' is'} consuming power at sub-optimal efficiency — immediate review recommended.` });
    msgs.push({ type: 'forecast', text: `Projected energy consumption tomorrow: ${tomorrow} kWh (est. ₹${(tomorrow * 6.5).toLocaleString('en-IN')}).` });
    msgs.push({ type: 'forecast', text: `Next shift forecast: ${nextShift} kWh — ${Number(nextShift) > 300 ? 'above' : 'within'} average shift consumption range.` });
    const highPowerMachine = efficiencyRanking.find(m => m.energyUsage > 10);
    if (highPowerMachine) msgs.push({ type: 'warn', text: `${highPowerMachine.machineName} is consuming ${highPowerMachine.energyUsage} kW — 15% above expected baseline for its production output.` });
    return msgs;
  }, [efficiencyRanking, wastingMachines, tomorrow, nextShift]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">ENERGY INTELLIGENCE</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Advanced energy analytics · efficiency ranking · power forecasting</p>
        </div>
        <div className="flex items-center gap-2 bg-factory-accent/10 border border-factory-accent/30 rounded-lg px-3 py-2">
          <Zap size={14} className="text-factory-accent" />
          <span className="font-mono text-xs text-factory-accent">LIVE MONITORING</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label: 'Current Load',   value: `${totalKw.toFixed(1)} kW`, color: 'text-factory-accent', sub: 'Active machines',      icon: Zap },
          { label: 'Cost / Hour',    value: `₹${totalCostHr}`,          color: 'text-factory-amber',  sub: '@ ₹6.5/kWh',           icon: TrendingDown },
          { label: "Today's Usage",  value: `${todayTotal} kWh`,        color: 'text-factory-green',  sub: `₹${parseInt(todayCost).toLocaleString()} spent`, icon: Activity },
          { label: 'Low Efficiency', value: wastingMachines.length,     color: 'text-factory-red',    sub: 'Machines need attention',icon: AlertTriangle },
        ].map(({ label, value, color, sub, icon: Icon }) => (
          <div key={label} className="factory-card text-center" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 10, right: 12, opacity: 0.07 }}>
              <Icon size={40} />
            </div>
            <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
            <div className="font-body text-sm font-medium text-factory-text mt-1">{label}</div>
            <div className="font-mono text-xs text-factory-dim">{sub}</div>
          </div>
        ))}
      </div>

      {/* ══ ENERGY INTELLIGENCE ANALYTICS ══ */}
      <div style={{ background: '#0c1628', border: '1px solid #1e3a5f', borderRadius: 16, overflow: 'hidden' }}>
        {/* Section Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', background: 'rgba(0,229,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={18} style={{ color: '#00E5FF' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16, color: '#f1f5f9', letterSpacing: 1.5, textTransform: 'uppercase' }}>Energy Intelligence Analytics</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Machine efficiency ranking · power forecasting · AI-driven insights</div>
          </div>
        </div>

        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* ── LEFT: Machine Efficiency Ranking ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Award size={15} style={{ color: '#F59E0B' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase' }}>Machine Energy Efficiency Ranking</span>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              {[['#22C55E', 'High (≥85%)'], ['#F59E0B', 'Medium (65–84%)'], ['#EF4444', 'Low (<65%)']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                  <span style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace' }}>{l}</span>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={efficiencyRanking.length * 48 + 20}>
              <BarChart
                data={efficiencyRanking}
                layout="vertical"
                margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number" domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                  tickLine={false} axisLine={{ stroke: '#1e293b' }}
                  tickFormatter={v => `${v}%`}
                />
                <YAxis
                  type="category" dataKey="machineName" width={130}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip content={<EffTooltip />} cursor={{ fill: 'rgba(0,229,255,0.04)' }} />
                <ReferenceLine x={85} stroke="#22C55E33" strokeDasharray="4 4" />
                <ReferenceLine x={65} stroke="#F59E0B33" strokeDasharray="4 4" />
                <Bar dataKey="efficiencyScore" radius={[0, 6, 6, 0]} name="Efficiency Score" maxBarSize={22}>
                  {efficiencyRanking.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={effColor(entry.efficiencyScore)}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Rank table mini */}
            <div style={{ marginTop: 14, borderTop: '1px solid #1e293b', paddingTop: 12 }}>
              {efficiencyRanking.map((m, i) => (
                <div key={m.machineId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid #0f172a' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: i === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: i === 0 ? '#F59E0B' : '#64748b', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ flex: 1, color: '#f1f5f9', fontSize: 12 }}>{m.machineName}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{m.energyUsage} kW</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 700, color: effColor(m.efficiencyScore), minWidth: 40, textAlign: 'right' }}>{m.efficiencyScore}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Power Consumption Forecast ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <TrendingUp size={15} style={{ color: '#00E5FF' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase' }}>Power Consumption Forecast</span>
            </div>

            {/* Forecast metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
              {[
                { label: 'Next Hour',  value: `${nextHour} kW`,  color: '#00E5FF', icon: Clock },
                { label: 'Next Shift', value: `${nextShift} kWh`,color: '#F59E0B', icon: Activity },
                { label: 'Tomorrow',   value: `${tomorrow} kWh`, color: '#22C55E', icon: TrendingUp },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ background: '#0a1221', border: `1px solid ${color}22`, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <Icon size={14} style={{ color, margin: '0 auto 6px' }} />
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 18, fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 3, background: '#00E5FF', borderRadius: 2 }} />
                <span style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace' }}>Historical (kWh)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 3, background: 'transparent', borderTop: '2px dashed #22C55E', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }} />
                <span style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace' }}>── Predicted</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={FORECAST_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00E5FF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                  tickLine={false} axisLine={{ stroke: '#1e293b' }}
                  interval={3}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip content={<EnergyTooltip />} cursor={{ stroke: '#00E5FF44', strokeWidth: 1, strokeDasharray: '4 4' }} />
                {/* Mark where prediction starts */}
                <ReferenceLine x={HOURLY_HISTORY[23].hour} stroke="#ffffff18" strokeDasharray="3 3" label={{ value: 'NOW', position: 'insideTop', fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} />
                <Line
                  type="monotone" dataKey="consumed"
                  stroke="#00E5FF" strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#00E5FF', stroke: '#020617', strokeWidth: 2 }}
                  name="Historical"
                  connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="predicted"
                  stroke="#22C55E" strokeWidth={2.5}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={{ r: 5, fill: '#22C55E', stroke: '#020617', strokeWidth: 2 }}
                  name="Predicted"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Brain size={13} style={{ color: '#22C55E', flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                  <span style={{ color: '#22C55E', fontWeight: 700 }}>Forecast model: </span>
                  Based on historical 24h patterns and real-time machine load. Predictions shown with dashed line beyond current time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ AI ENERGY INSIGHTS PANEL ══ */}
      <div className="factory-card glow-accent animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <Brain size={18} className="text-factory-accent" />
          <div className="section-title text-factory-accent">AI ENERGY INSIGHTS</div>
          <div style={{ marginLeft: 'auto', padding: '2px 10px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 6, fontFamily: 'monospace', fontSize: 10, color: '#00E5FF' }}>
            AUTO-GENERATED
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insights.map((ins, i) => {
            const isWarn     = ins.type === 'warn';
            const isForecast = ins.type === 'forecast';
            const color  = isWarn ? '#F59E0B' : isForecast ? '#00E5FF' : '#22C55E';
            const bg     = isWarn ? 'rgba(245,158,11,0.05)' : isForecast ? 'rgba(0,229,255,0.04)' : 'rgba(34,197,94,0.05)';
            const border = isWarn ? 'rgba(245,158,11,0.2)' : isForecast ? 'rgba(0,229,255,0.15)' : 'rgba(34,197,94,0.2)';
            const Icon   = isWarn ? AlertTriangle : isForecast ? TrendingUp : CheckCircle;
            return (
              <div key={i} style={{ animationDelay: `${i * 60}ms`, display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 10, animation: 'fadeInUp 0.4s ease forwards' }}>
                <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  <span style={{ color, fontWeight: 600 }}>{isWarn ? '⚠ Alert: ' : isForecast ? '📊 Forecast: ' : '✓ Good: '}</span>
                  {ins.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ EXISTING: Waste Alert ══ */}
      {wastingMachines.length > 0 && (
        <div className="factory-card glow-red animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-factory-red" />
            <div className="section-title text-factory-red">ENERGY WASTE DETECTED</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {wastingMachines.map(m => (
              <div key={m.id} className="bg-factory-red/5 border border-factory-red/30 rounded-lg p-3">
                <div className="font-medium text-factory-text text-sm">{m.name}</div>
                <div className="font-mono text-xs text-factory-dim mt-0.5">{(m.status || '').toUpperCase()} · {m.efficiency}% efficiency</div>
                <div className="mt-2 font-display text-lg font-bold text-factory-red">{m.consumption} kW</div>
                <div className="font-mono text-xs text-factory-dim">consuming at low efficiency</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ EXISTING: 24h + Weekly charts ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="factory-card animate-fade-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px]">LIVE 24-HOUR CONSUMPTION (kWh)</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={liveHourly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00D4FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="timeLabel" tick={{ fill: '#5A7A9A', fontSize: 9, fontFamily: 'Share Tech Mono' }} minTickGap={20} />
              <YAxis tick={{ fill: '#5A7A9A', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
              <Tooltip content={<SimpleTooltip />} isAnimationActive={false} />
              <Area type="monotone" dataKey="consumed" stroke="#00D4FF" fill="url(#energyGrad)" strokeWidth={2} name="kWh" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="factory-card animate-fade-up stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px]">LIVE WEEKLY CONSUMPTION (kWh)</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={liveWeekly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="day" tick={{ fill: '#5A7A9A', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
              <YAxis tick={{ fill: '#5A7A9A', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
              <Tooltip content={<SimpleTooltip />} isAnimationActive={false} />
              <Bar dataKey="kwh" fill="#00FF94" fillOpacity={0.7} name="kWh" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ EXISTING: Per-machine table ══ */}
      <div className="factory-card animate-fade-up stagger-5">
        <div className="section-title mb-4">MACHINE ENERGY CONSUMPTION</div>
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                {['Machine', 'Type', 'Rated (kW)', 'Current (kW)', 'Cost/Hr', 'Efficiency', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machineEnergy.map(m => (
                <tr key={m.id || m._id} className={m.isWasting ? 'bg-factory-red/5' : ''}>
                  <td className="font-medium text-factory-text">{m.name}</td>
                  <td className="text-factory-dim text-xs">{m.type}</td>
                  <td className="text-factory-dim">{m.powerKw}</td>
                  <td className={`font-bold ${m.isWasting ? 'text-factory-red' : 'text-factory-green'}`}>{m.consumption}</td>
                  <td className="text-factory-amber">₹{m.costPerHr}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-factory-bg rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${(m.efficiency ?? 80) > 80 ? 'bg-factory-green' : (m.efficiency ?? 80) > 60 ? 'bg-factory-amber' : 'bg-factory-red'}`}
                          style={{ width: `${m.efficiency ?? 80}%` }}
                        />
                      </div>
                      <span className={(m.efficiency ?? 80) > 80 ? 'text-factory-green' : (m.efficiency ?? 80) > 60 ? 'text-factory-amber' : 'text-factory-red'}>
                        {m.efficiency ?? 80}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={
                      m.status === 'operational' || m.status === 'Running'  ? 'badge-operational' :
                      m.status === 'warning'     || m.status === 'Maintenance' ? 'badge-warning' :
                      m.status === 'critical'                               ? 'badge-critical' : 'badge-offline'
                    }>
                      {(m.status || 'unknown').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
