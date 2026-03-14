import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Package, Cpu, Users } from 'lucide-react';
import { INVENTORY, WORKERS, ANALYTICS } from '../data/dummyData';
import { useLive } from '../context/LiveDataContext';
import { useLivestreamData } from '../hooks/useLivestreamData';
import LiveChartIndicator from '../components/common/LiveChartIndicator';

const MONTHLY_REVENUE = [
  { month: 'Oct', revenue: 4200000, cost: 2800000, profit: 1400000 },
  { month: 'Nov', revenue: 3900000, cost: 2700000, profit: 1200000 },
  { month: 'Dec', revenue: 4800000, cost: 3100000, profit: 1700000 },
  { month: 'Jan', revenue: 3600000, cost: 2600000, profit: 1000000 },
  { month: 'Feb', revenue: 4500000, cost: 2900000, profit: 1600000 },
  { month: 'Mar', revenue: 1200000, cost: 750000, profit: 450000 },
];

const COST_BREAKDOWN = [
  { name: 'Raw Materials', value: 42, color: '#00D4FF' },
  { name: 'Labor', value: 28, color: '#00FF94' },
  { name: 'Energy', value: 12, color: '#FFB800' },
  { name: 'Maintenance', value: 10, color: '#FF3860' },
  { name: 'Overhead', value: 8, color: '#8B5CF6' },
];

const PRODUCT_REVENUE = [
  { product: 'Auto Parts', revenue: 1800000, units: 1200, margin: 35 },
  { product: 'Hydraulic Comp.', revenue: 1100000, units: 430, margin: 42 },
  { product: 'Welded Assy.', revenue: 900000, units: 680, margin: 28 },
  { product: 'Plastic Molds', revenue: 600000, units: 950, margin: 22 },
];

/* ── Colour & style constants for the 3 financial metrics ── */
const METRIC_CFG = {
  revenue: { color: '#00E5FF', label: 'Revenue', dash: '',    fill: 'url(#revGrad)',  width: 2.5 },
  cost:    { color: '#FF4D4D', label: 'Cost',    dash: '8 4', fill: 'none',           width: 2   },
  profit:  { color: '#00FF9C', label: 'Profit',  dash: '',    fill: 'url(#profGrad)', width: 2.5 },
};

const FinancialTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0c1628f0', backdropFilter: 'blur(16px)',
      border: '1px solid #1e3a5f', borderRadius: 12,
      padding: '12px 16px', minWidth: 190,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Month: {label}
      </div>
      {payload.map((p, i) => {
        const cfg = Object.values(METRIC_CFG).find(c => c.label === p.name) || {};
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
            {/* Coloured indicator matching line style */}
            <div style={{ width: 18, height: 3, borderRadius: 2, flexShrink: 0, background: cfg.dash ? 'none' : cfg.color, border: cfg.dash ? `2px dashed ${cfg.color}` : 'none', opacity: 0.9 }} />
            <span style={{ color: '#64748b', fontSize: 12, flex: 1 }}>{p.name}</span>
            <span style={{ color: cfg.color, fontSize: 13, fontWeight: 700 }}>
              ₹{(Number(p.value) / 100000).toFixed(1)}L
            </span>
          </div>
        );
      })}
      {/* Margin derived from payload */}
      {(() => {
        const rev  = payload.find(p => p.dataKey === 'revenue')?.value || 1;
        const prof = payload.find(p => p.dataKey === 'profit')?.value  || 0;
        const pct  = ((prof / rev) * 100).toFixed(1);
        return (
          <div style={{ borderTop: '1px solid #1e293b', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace' }}>MARGIN</span>
            <span style={{ color: '#00FF9C', fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>{pct}%</span>
          </div>
        );
      })()}
    </div>
  );
};

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="factory-card">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg bg-factory-bg border border-factory-border flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-mono ${trend >= 0 ? 'text-factory-green' : 'text-factory-red'}`}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm font-medium text-factory-text mt-0.5">{label}</div>
      <div className="font-mono text-xs text-factory-dim">{sub}</div>
    </div>
  );
}

export default function CostRevenuePage() {
  const { analytics } = useLive();

  const todayRevenue = Math.round(analytics.productionToday * 2200);
  const todayCost = Math.round(todayRevenue * 0.63);
  const todayProfit = todayRevenue - todayCost;
  const inventoryValue = INVENTORY.reduce((s, i) => s + i.stock * i.unitCost, 0);
  const avgWorkerCost = 35000;
  const monthlyLabor = WORKERS.length * avgWorkerCost;

  const liveRevenue = useLivestreamData(
    MONTHLY_REVENUE,
    {
      revenue: { min: 2000000, max: 6000000, variation: 200000, isInt: true },
      cost: { min: 1000000, max: 4000000, variation: 100000, isInt: true },
    },
    3000,
    6
  );

  // We explicitly compute profit in the hook data, but `useLivestreamData` walks independently. 
  // Let's ensure profit is dynamically accurate for each new frame:
  const liveRevenueWithProfit = liveRevenue.map(d => ({
    ...d,
    profit: d.revenue - d.cost
  }));

  return (
    <div className="space-y-6">
      <div className="animate-slide-in">
        <h1 className="page-title">COST & REVENUE ANALYTICS</h1>
        <p className="text-factory-dim font-body text-sm mt-1">Financial performance, cost breakdown, and profitability tracking</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        <StatCard icon={TrendingUp} label="Today's Revenue" value={`₹${(todayRevenue / 1000).toFixed(0)}K`} sub={`${analytics.productionToday} units × avg ₹2,200`} color="text-factory-green" trend={4.2} />
        <StatCard icon={DollarSign} label="Today's Profit" value={`₹${(todayProfit / 1000).toFixed(0)}K`} sub={`${Math.round((todayProfit / todayRevenue) * 100)}% margin`} color="text-factory-accent" trend={2.1} />
        <StatCard icon={Package} label="Inventory Value" value={`₹${(inventoryValue / 100000).toFixed(1)}L`} sub="Current stock worth" color="text-factory-amber" />
        <StatCard icon={Users} label="Monthly Labor" value={`₹${(monthlyLabor / 100000).toFixed(1)}L`} sub={`${WORKERS.length} workers × ₹35K avg`} color="text-factory-dim" />
      </div>

      {/* Revenue vs Cost vs Profit — improved chart */}
      <div className="factory-card animate-fade-up stagger-2" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Subtle top glow strip */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#00E5FF33,transparent)' }} />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px]">LIVE REVENUE vs COST vs PROFIT</div>
          </div>
          {/* Updated legend – matching line styles */}
          <div style={{ display: 'flex', gap: 18 }}>
            {Object.entries(METRIC_CFG).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {cfg.dash
                  ? /* dashed indicator for Cost */
                    <svg width="22" height="10" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="5" x2="22" y2="5"
                        stroke={cfg.color} strokeWidth="2.5"
                        strokeDasharray="6 3" strokeLinecap="round" />
                    </svg>
                  : /* solid indicator for Revenue & Profit */
                    <span style={{ display: 'inline-block', width: 22, height: 3, borderRadius: 2, background: cfg.color, boxShadow: key === 'profit' ? `0 0 6px ${cfg.color}88` : 'none' }} />
                }
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={liveRevenueWithProfit} margin={{ top: 8, right: 14, left: 10, bottom: 0 }}>
            <defs>
              {/* Revenue gradient — cyan */}
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00E5FF" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
              {/* Profit gradient — green */}
              <linearGradient id="profGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00FF9C" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#00FF9C" stopOpacity={0} />
              </linearGradient>
              {/* Profit glow filter */}
              <filter id="profitGlow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              tick={{ fill: '#5A7A9A', fontSize: 11, fontFamily: 'Share Tech Mono' }}
              tickLine={false} axisLine={{ stroke: '#1e293b' }}
              minTickGap={20}
            />
            <YAxis
              tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`}
              tick={{ fill: '#5A7A9A', fontSize: 10, fontFamily: 'Share Tech Mono' }}
              tickLine={false} axisLine={false}
            />
            <Tooltip
              content={<FinancialTooltip />}
              cursor={{ stroke: '#ffffff18', strokeWidth: 1, strokeDasharray: '4 4' }}
              isAnimationActive={false}
            />

            {/* ① Revenue — solid cyan line + gradient fill */}
            <Area
              type="monotone" dataKey="revenue"
              stroke="#00E5FF" strokeWidth={2.5}
              fill="url(#revGrad2)"
              name="Revenue"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 5, fill: '#00E5FF', stroke: '#020617', strokeWidth: 2 }}
            />

            {/* ② Cost — dashed red, no fill */}
            <Area
              type="monotone" dataKey="cost"
              stroke="#FF4D4D" strokeWidth={2}
              strokeDasharray="8 4"
              fill="none"
              name="Cost"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 5, fill: '#FF4D4D', stroke: '#020617', strokeWidth: 2 }}
            />

            {/* ③ Profit — solid green + gradient fill + glow filter on stroke */}
            <Area
              type="monotone" dataKey="profit"
              stroke="#00FF9C" strokeWidth={2.5}
              fill="url(#profGrad2)"
              name="Profit"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 5, fill: '#00FF9C', stroke: '#020617', strokeWidth: 2 }}
              style={{ filter: 'drop-shadow(0 0 4px #00FF9C66)' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Month summary bar */}
        <div style={{ display: 'flex', gap: 0, marginTop: 12, borderTop: '1px solid #1e293b', paddingTop: 12 }}>
          {liveRevenueWithProfit.map(d => {
            const margin = ((d.profit / d.revenue) * 100).toFixed(0);
            return (
              <div key={d.timeLabel} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#64748b' }}>{d.timeLabel}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: '#00FF9C', marginTop: 2 }}>{margin}%</div>
                <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace' }}>margin</div>
              </div>
            );
          })}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Breakdown Pie */}
        <div className="factory-card animate-fade-up stagger-3">
          <div className="section-title mb-4">COST BREAKDOWN</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={COST_BREAKDOWN} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {COST_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                </Pie>
                <Tooltip formatter={v => `${v}%`} contentStyle={{ background: '#111E32', border: '1px solid #1E3A5F', fontFamily: 'Share Tech Mono', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {COST_BREAKDOWN.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: item.color }}></div>
                    <span className="font-mono text-xs text-factory-dim">{item.name}</span>
                  </div>
                  <span className="font-display font-bold text-sm text-factory-text">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Revenue */}
        <div className="factory-card animate-fade-up stagger-4">
          <div className="section-title mb-4">REVENUE BY PRODUCT</div>
          <div className="space-y-3">
            {PRODUCT_REVENUE.map(p => (
              <div key={p.product}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-factory-text text-sm">{p.product}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-factory-green">{p.margin}% margin</span>
                    <span className="font-display font-bold text-sm text-factory-accent">₹{(p.revenue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
                <div className="h-2 bg-factory-bg rounded overflow-hidden">
                  <div className="h-full rounded bg-factory-accent transition-all duration-700"
                    style={{ width: `${(p.revenue / PRODUCT_REVENUE[0].revenue) * 100}%`, opacity: 0.7 }}></div>
                </div>
                <div className="font-mono text-xs text-factory-dim mt-0.5">{p.units} units sold</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI of AI/Automation */}
      <div className="factory-card glow-green animate-fade-up stagger-5">
        <div className="section-title mb-4 text-factory-green">AI & AUTOMATION ROI CALCULATOR</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Downtime Reduction', saving: '₹2.1L/month', how: 'Predictive maintenance prevents failures', icon: Cpu, color: 'text-factory-accent' },
            { label: 'Inventory Savings', saving: '₹85K/month', how: 'Auto-alerts prevent overstocking/stockouts', icon: Package, color: 'text-factory-amber' },
            { label: 'Productivity Gain', saving: '₹1.4L/month', how: 'Skill-based worker assignment (+12% efficiency)', icon: Users, color: 'text-factory-green' },
          ].map(({ label, saving, how, icon: Icon, color }) => (
            <div key={label} className="bg-factory-bg border border-factory-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span className="font-medium text-factory-text text-sm">{label}</span>
              </div>
              <div className={`font-display text-xl font-bold ${color}`}>{saving}</div>
              <div className="font-mono text-xs text-factory-dim mt-1">{how}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-factory-border flex items-center justify-between">
          <div>
            <div className="font-mono text-xs text-factory-dim">TOTAL MONTHLY SAVINGS WITH AI AUTOMATION</div>
            <div className="font-display text-2xl font-bold text-factory-green mt-1">₹3.95L / month</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-factory-dim">ESTIMATED ROI PAYBACK PERIOD</div>
            <div className="font-display text-2xl font-bold text-factory-accent mt-1">4.2 months</div>
          </div>
        </div>
      </div>
    </div>
  );
}
