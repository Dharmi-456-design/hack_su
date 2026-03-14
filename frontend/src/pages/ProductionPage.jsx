import React, { useState } from 'react';
import { PRODUCTION_DATA, PRODUCTION_CATEGORIES, MONTHLY_PERFORMANCE } from '../data/dummyData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Sector, Rectangle } from 'recharts';
import { TrendingUp, Target, CheckCircle, BarChart3, X as CloseIcon } from 'lucide-react';
import { useLivestreamData } from '../hooks/useLivestreamData';
import LiveChartIndicator from '../components/common/LiveChartIndicator';

const COLORS = ['#2563EB', '#22C55E', '#6366F1', '#14B8A6', '#F59E0B', '#EF4444'];

const ModernTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const hasTarget = payload.some(p => p.dataKey === 'target');
  const hasActual = payload.some(p => p.dataKey === 'actual');

  return (
    <div style={{
      background: '#0c1628ee',
      backdropFilter: 'blur(14px)',
      border: `1px solid #1e293b`,
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: `0 16px 40px rgba(0,0,0,0.6)`,
      animation: 'fadeInUp 0.2s ease-out',
      minWidth: '160px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {label || 'DETAILS'}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
          <span style={{ color: '#64748b', fontSize: '12px' }}>{p.name}:</span>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginLeft: 'auto' }}>
            {p.value}
          </span>
        </div>
      ))}
      {hasTarget && hasActual && (
        <div style={{ borderTop: '1px solid #1e293b', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>PERFORMANCE</span>
          <span style={{ 
            color: payload.find(p=>p.dataKey==='actual').value >= payload.find(p=>p.dataKey==='target').value ? '#22C55E' : '#F59E0B',
            fontSize: '12px', fontWeight: 700 
          }}>
            {((payload.find(p=>p.dataKey==='actual').value / payload.find(p=>p.dataKey==='target').value)*100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 12px ${fill}AA)`, transition: 'all 0.3s ease' }}
      />
    </g>
  );
};

export default function ProductionPage() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedPie, setSelectedPie] = useState(null);

  const productionLive = useLivestreamData(
    PRODUCTION_DATA,
    {
      target: { min: 480, max: 520, variation: 5 },
      actual: { min: 400, max: 530, variation: 15 },
      efficiency: { min: 80, max: 105, variation: 2 }
    },
    2000,
    15
  );

  const todayData = productionLive[productionLive.length - 1] || PRODUCTION_DATA[PRODUCTION_DATA.length - 1];
  const weekTotal = productionLive.reduce((s, d) => s + d.actual, 0);
  const weekTarget = productionLive.reduce((s, d) => s + d.target, 0);
  const avgEfficiency = (productionLive.reduce((s, d) => s + d.efficiency, 0) / (productionLive.length || 1)).toFixed(1);

  const onPieClick = (data, index) => {
    setActiveIndex(index);
    setSelectedPie({ ...data, index });
  };

  return (
    <div className="space-y-6">
      <div className="animate-slide-in">
        <h1 className="page-title">PRODUCTION TRACKING SYSTEM</h1>
        <p className="text-factory-dim font-body text-sm mt-1">Daily targets, actual output, and efficiency analysis</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label: "Today's Output", value: todayData.actual, sub: `Target: ${todayData.target}`, color: 'text-factory-green', icon: CheckCircle },
          { label: "Today's Efficiency", value: `${todayData.efficiency}%`, sub: todayData.efficiency >= 100 ? '✓ TARGET MET' : '↓ BELOW TARGET', color: todayData.efficiency >= 100 ? 'text-factory-green' : 'text-factory-amber', icon: TrendingUp },
          { label: 'Week Total', value: weekTotal, sub: `Target: ${weekTarget}`, color: 'text-factory-accent', icon: BarChart3 },
          { label: 'Week Efficiency', value: `${avgEfficiency}%`, sub: 'Average this week', color: 'text-factory-accent', icon: Target },
        ].map(({ label, value, sub, color, icon: Icon }, i) => (
          <div key={label} className="factory-card animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="font-mono text-xs text-factory-dim">{label.toUpperCase()}</span>
            </div>
            <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 factory-card animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <LiveChartIndicator />
            <div className="section-title mb-0 relative top-[1px]">LIVE PRODUCTION TRACKING</div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productionLive} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="timeLabel" tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} dy={5} minTickGap={20} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ModernTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} isAnimationActive={false} />
              <Bar dataKey="target" fill="#2563EB" fillOpacity={0.4} name="Target" radius={[4, 4, 0, 0]} isAnimationActive={false} activeBar={<Rectangle fill="#2563EB" fillOpacity={0.8} stroke="#2563EB" strokeWidth={1} style={{ filter: 'drop-shadow(0 0 6px #2563EBAA)' }}/>} />
              <Bar dataKey="actual" fill="#22C55E" fillOpacity={0.9} name="Actual" radius={[4, 4, 0, 0]} isAnimationActive={false} activeBar={<Rectangle fill="#22C55E" fillOpacity={1} stroke="#22C55E" strokeWidth={1} style={{ filter: 'drop-shadow(0 0 6px #22C55EAA)' }}/>} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="factory-card animate-fade-up stagger-3" style={{ position: 'relative' }}>
          <div className="section-title mb-4">PRODUCTION BY CATEGORY</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie 
                data={PRODUCTION_CATEGORIES} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value"
                activeIndex={activeIndex} activeShape={renderActiveShape} onClick={onPieClick} style={{ cursor: 'pointer' }}
              >
                {PRODUCTION_CATEGORIES.map((entry, i) => (
                  <Cell 
                    key={i} 
                    fill={COLORS[i % COLORS.length]} 
                    fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.3} 
                    style={{ transition: 'opacity 0.3s ease' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<ModernTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PRODUCTION_CATEGORIES.map((cat, i) => (
              <div 
                key={cat.name} 
                className="flex items-center justify-between cursor-pointer hover:bg-factory-border/20 p-1.5 rounded transition-colors"
                onClick={() => onPieClick(cat, i)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i], opacity: activeIndex === null || activeIndex === i ? 1 : 0.3, transition: 'opacity 0.3s ease' }}></div>
                  <span className={`font-mono text-xs ${activeIndex === i ? 'text-factory-text font-bold' : 'text-factory-dim'} transition-colors`}>{cat.name}</span>
                </div>
                <span className={`font-mono text-xs ${activeIndex === i ? 'text-factory-text font-bold' : 'text-factory-dim'} transition-colors`}>{cat.value}%</span>
              </div>
            ))}
          </div>

          {/* Floating Details Panel */}
          {selectedPie && (
            <div 
              style={{
                position: 'absolute', top: 56, right: '50%', transform: 'translateX(50%)',
                background: '#0c1628f5', backdropFilter: 'blur(10px)',
                border: `1px solid ${COLORS[selectedPie.index % COLORS.length]}88`,
                borderRadius: '12px', padding: '16px', minWidth: '220px',
                boxShadow: `0 20px 40px rgba(0,0,0,0.8), 0 0 20px ${COLORS[selectedPie.index % COLORS.length]}33`,
                animation: 'zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 10
              }}
            >
              <button onClick={() => { setSelectedPie(null); setActiveIndex(null); }} style={{ position: 'absolute', top: 12, right: 12, color: '#64748b', cursor: 'pointer' }} className="hover:text-factory-red transition-colors">
                <CloseIcon size={14} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[selectedPie.index % COLORS.length], boxShadow: `0 0 10px ${COLORS[selectedPie.index % COLORS.length]}` }} />
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: '#f8fafc' }}>{selectedPie.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Contribution</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedPie.value}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Est. Units</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{Math.round((weekTotal * selectedPie.value) / 100).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Status</span>
                  <span style={{ color: '#22C55E', fontWeight: 600 }}>ACTIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Efficiency trend */}
      <div className="factory-card animate-fade-up stagger-4">
        <div className="flex items-center gap-2 mb-4">
          <LiveChartIndicator />
          <div className="section-title mb-0 relative top-[1px]">LIVE EFFICIENCY TREND (%)</div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={productionLive} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
            <XAxis dataKey="timeLabel" tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} dy={5} minTickGap={20} />
            <YAxis domain={[80, 110]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} />
            <Tooltip content={<ModernTooltip />} cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }} isAnimationActive={false} />
            <Line type="monotone" dataKey="efficiency" stroke="#6366F1" strokeWidth={3} isAnimationActive={false} dot={{ fill: '#6366F1', r: 4, stroke: '#020617', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#6366F1', stroke: '#020617', strokeWidth: 2, filter: 'drop-shadow(0 0 8px #6366F1AA)' }} name="Efficiency %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily production table */}
      <div className="factory-card animate-fade-up stagger-5">
        <div className="section-title mb-4">DAILY PRODUCTION REPORT</div>
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                {['Date', 'Target', 'Actual', 'Variance', 'Efficiency', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productionLive.map((d, i) => {
                const variance = Math.round(d.actual - d.target);
                const isAbove = variance >= 0;
                return (
                  <tr key={d.timeLabel + i}>
                    <td>{d.timeLabel}</td>
                    <td>{d.target}</td>
                    <td className={`font-bold ${isAbove ? 'text-factory-green' : 'text-factory-amber'}`}>{d.actual}</td>
                    <td className={isAbove ? 'text-factory-green' : 'text-factory-red'}>{isAbove ? '+' : ''}{variance}</td>
                    <td className={d.efficiency >= 100 ? 'text-factory-green' : 'text-factory-amber'}>{d.efficiency}%</td>
                    <td>
                      <span className={d.efficiency >= 100 ? 'badge-operational' : 'badge-warning'}>
                        {d.efficiency >= 100 ? 'EXCEEDED' : d.efficiency >= 90 ? 'ON TRACK' : 'BELOW'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
