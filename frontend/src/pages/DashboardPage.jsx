import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ANALYTICS, MACHINES, ALERTS, PRODUCTION_DATA, MONTHLY_PERFORMANCE, DEPARTMENT_STATS } from '../data/dummyData';
import { useLive } from '../context/LiveDataContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid
} from 'recharts';
import { Cpu, Users, AlertTriangle, Factory, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg:      '#020617',
  panel:   '#0f172a',
  card:    '#0c1628',
  border:  '#1e293b',
  accent:  '#00E5FF',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#EF4444',
  text:    '#f1f5f9',
  dim:     '#64748b',
  // Typography
  fontHead: "'Orbitron', sans-serif",   // Page titles, section headings, metric numbers
  fontBody: "'Inter', sans-serif",      // Body text, nav, cards, metadata, charts
};

// ─── Shared card style ───────────────────────────────────────────────────────
const cardStyle = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  padding: 20,
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
};

// ─── Modern Glassmorphism Tooltip ─────────────────────────────────────────────
const ModernTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0c1628ee',
      backdropFilter: 'blur(14px)',
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: `0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,229,255,0.08)`,
      minWidth: 150,
    }}>
      {/* Tooltip label — Orbitron uppercase */}
      <div style={{ color: T.dim, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: T.fontHead }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
          {/* Series name — Inter body */}
          <span style={{ color: T.dim, fontSize: 12, fontFamily: T.fontBody }}>{p.name}:</span>
          {/* Value — Orbitron for emphasis */}
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginLeft: 'auto', fontFamily: T.fontHead }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Metric Card ─────────────────────────────────────────────────────────────
const COLORS_MAP = {
  accent: { text: T.accent, bg: 'rgba(0,229,255,0.08)',  border: 'rgba(0,229,255,0.25)', glow: '0 0 30px rgba(0,229,255,0.15)' },
  green:  { text: T.green,  bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)', glow: '0 0 30px rgba(34,197,94,0.15)' },
  amber:  { text: T.amber,  bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', glow: '0 0 30px rgba(245,158,11,0.15)' },
  red:    { text: T.red,    bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)', glow: '0 0 30px rgba(239,68,68,0.15)' },
};

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'accent', trend, delay = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const c = COLORS_MAP[color];
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        boxShadow: hovered ? `${c.glow}, 0 20px 40px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.3)',
        borderColor: hovered ? c.border : T.border,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Top shimmer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${c.text}55, transparent)` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: c.bg, border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hovered ? `0 0 20px ${c.text}33` : 'none',
          transition: 'box-shadow 0.3s ease',
        }}>
          <Icon size={20} color={c.text} />
        </div>
        {trend !== undefined && (
          // Trend badge — Inter (metadata)
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: trend >= 0 ? T.green : T.red, fontFamily: T.fontBody }}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Big metric value — Orbitron bold */}
      <div style={{ fontFamily: T.fontHead, fontSize: 32, fontWeight: 700, color: c.text, marginBottom: 6, textShadow: `0 0 20px ${c.text}55`, lineHeight: 1 }}>
        {value}
      </div>
      {/* Card title — Inter medium */}
      <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{title}</div>
      {/* Subtitle / metadata — Inter light */}
      {subtitle && <div style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 300, color: T.dim }}>{subtitle}</div>}
    </div>
  );
};

// ─── Machine Status Row ───────────────────────────────────────────────────────
const statusCfg = {
  operational: { dot: T.green,   label: 'OPERATIONAL', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)' },
  warning:     { dot: T.amber,   label: 'WARNING',     bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  critical:    { dot: T.red,     label: 'CRITICAL',    bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)' },
  offline:     { dot: '#475569', label: 'OFFLINE',     bg: 'rgba(71,85,105,0.08)', border: 'rgba(71,85,105,0.2)' },
};

const MachineRow = ({ m }) => {
  const s = statusCfg[m.status];
  const effColor = m.efficiency > 80 ? T.green : m.efficiency > 60 ? T.amber : T.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.border}22` }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.dot, boxShadow: `0 0 8px ${s.dot}`, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Machine name — Inter medium */}
        <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
        {/* Location — Inter light metadata */}
        <div style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 300, color: T.dim }}>{m.location}</div>
      </div>
      <div style={{ textAlign: 'right', marginRight: 8 }}>
        {/* Temperature — Inter */}
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.dim }}>{m.temperature}°C</div>
        {/* Status badge — Orbitron for industrial feel */}
        <div style={{ display: 'inline-block', marginTop: 3, padding: '2px 8px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 8, fontWeight: 700, color: s.dot, fontFamily: T.fontHead, letterSpacing: 1, textTransform: 'uppercase' }}>
          {s.label}
        </div>
      </div>
      <div style={{ width: 60 }}>
        {/* Efficiency % — Orbitron */}
        <div style={{ fontFamily: T.fontHead, fontSize: 10, color: effColor, textAlign: 'right', marginBottom: 4 }}>{m.efficiency}%</div>
        <div style={{ height: 4, background: T.border, borderRadius: 99 }}>
          <div style={{ height: '100%', width: `${m.efficiency}%`, background: effColor, borderRadius: 99, boxShadow: `0 0 8px ${effColor}88`, transition: 'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
};

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
const SectionCard = ({ children, style = {} }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0,229,255,0.05)' : '0 4px 20px rgba(0,0,0,0.3)',
        borderColor: hovered ? 'rgba(0,229,255,0.2)' : T.border,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)' }} />
      {children}
    </div>
  );
};

// ─── Section Heading helper ───────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div style={{ fontFamily: T.fontHead, fontSize: 10, fontWeight: 600, color: T.dim, textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16 }}>
    {children}
  </div>
);

// ─── View-All Link helper ─────────────────────────────────────────────────────
const ViewAll = ({ to }) => (
  <NavLink to={to} style={{ fontFamily: T.fontHead, fontSize: 9, color: T.accent, border: `1px solid ${T.accent}44`, padding: '4px 12px', borderRadius: 6, textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}>
    View All ›
  </NavLink>
);

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const { machines, alerts, production, analytics } = useLive();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const unread = alerts.filter(a => !a.read);
  const axisStyle = { fill: T.dim, fontSize: 11, fontFamily: T.fontBody };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '0 0 40px 0' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          {/* Page title — Orbitron bold, uppercase, neon glow */}
          <h1 style={{
            fontFamily: T.fontHead, fontSize: 22, fontWeight: 900,
            color: T.accent, letterSpacing: 3, margin: 0, textTransform: 'uppercase',
            textShadow: `0 0 25px ${T.accent}66, 0 0 50px ${T.accent}22`,
          }}>
            Command Center
          </h1>
          {/* Subtitle — Inter light */}
          <p style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 300, color: T.dim, margin: '6px 0 0 0' }}>
            Real-time AI-powered factory intelligence dashboard
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* Live clock — Orbitron */}
          <div style={{ fontFamily: T.fontHead, fontSize: 26, fontWeight: 700, color: T.accent, textShadow: `0 0 20px ${T.accent}66` }}>
            {time.toLocaleTimeString('en-IN')}
          </div>
          {/* Date — Inter light metadata */}
          <div style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 300, color: T.dim, marginTop: 3 }}>
            {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── Status Banner ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        background: T.panel, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '10px 20px', marginBottom: 24,
      }}>
        {[
          { dot: T.green,  text: 'All Systems Monitored',                                       textColor: T.green },
          { icon: <Zap size={13} color={T.amber} />, text: `${machines.filter(m=>m.status!=='Running').length} Machines Non-Operational`, textColor: T.amber },
          { icon: <AlertTriangle size={13} color={T.red} />, text: `${unread.length} Unread Alerts`, textColor: T.red },
        ].map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: 1, height: 20, background: T.border }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.dot
                ? <div style={{ width: 9, height: 9, borderRadius: '50%', background: item.dot, boxShadow: `0 0 10px ${item.dot}`, animation: 'pulse 2s infinite' }} />
                : item.icon}
              {/* Status labels — Inter medium */}
              <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 500, color: item.textColor }}>{item.text}</span>
            </div>
          </React.Fragment>
        ))}
        {/* Shift info — Orbitron small */}
        <div style={{ marginLeft: 'auto', fontFamily: T.fontHead, fontSize: 9, fontWeight: 600, color: T.dim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Shift: 08:00 — 16:00
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard title="Total Machines"  value={machines.length}
          subtitle={`${machines.filter(m => m.status === 'Running').length} running · ${machines.filter(m => m.status === 'Maintenance').length} maintenance`}
          icon={Cpu} color="accent" trend={0} delay={0} />
        <MetricCard title="Today's Output"   value={production.today}
          subtitle={`Target: ${production.target} units`}
          icon={Factory} color="green" trend={-2.3} delay={60} />
        <MetricCard title="Efficiency %"   value={machines.length > 0 ? Math.round(machines.reduce((a,b)=>a+b.efficiency,0)/machines.length) : 0}
          subtitle="Overall Equipment Effectiveness"
          icon={Users} color="amber" trend={1.2} delay={120} />
        <MetricCard title="Active Alerts"    value={unread.length}
          subtitle={"Real-time system alerts"}
          icon={AlertTriangle} color="red" delay={180} />
      </div>

      {/* ── Production Chart + Radar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>

        <SectionCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <SectionTitle>Production Overview</SectionTitle>
              {/* Chart subtitle — Inter */}
              <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 400, color: T.text, marginTop: -8 }}>March 2026 — Daily Output vs Target</div>
            </div>
            <ViewAll to="/production" />
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={PRODUCTION_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.accent} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.green} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={T.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} dy={8} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip content={<ModernTooltip />} cursor={{ stroke: `${T.accent}30`, strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="target" stroke={T.accent} strokeWidth={1.5} strokeDasharray="6 3" fill="url(#gTarget)" name="Target" dot={false} />
              <Area type="monotone" dataKey="actual" stroke={T.green} strokeWidth={2.5} fill="url(#gActual)" name="Actual" dot={false}
                activeDot={{ r: 6, fill: T.green, stroke: T.bg, strokeWidth: 2, filter: `drop-shadow(0 0 8px ${T.green})` }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            {[{ color: T.accent, label: 'Target', dash: true }, { color: T.green, label: 'Actual' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 2, borderRadius: 2, background: l.color, opacity: 0.85 }} />
                {/* Legend labels — Inter */}
                <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.dim }}>{l.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Dept Efficiency</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={DEPARTMENT_STATS}>
              <PolarGrid stroke={T.border} />
              <PolarAngleAxis dataKey="dept" tick={{ fill: T.dim, fontSize: 10, fontFamily: T.fontBody }} />
              <Radar name="Efficiency" dataKey="efficiency" stroke={T.accent} fill={T.accent} fillOpacity={0.12} strokeWidth={2}
                dot={{ r: 4, fill: T.accent, stroke: T.bg, strokeWidth: 2 }} />
              <Tooltip content={<ModernTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Machine Status + Alerts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        <SectionCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>Machine Status</SectionTitle>
            <ViewAll to="/machines" />
          </div>
          <div>
            {machines.slice(0, 6).map(m => <MachineRow key={m.id} m={m} />)}
          </div>
        </SectionCard>

        <SectionCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>Recent Alerts</SectionTitle>
            <ViewAll to="/alerts" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {unread.slice(0, 5).map(alert => {
              const ac = alert.type === 'critical' ? T.red : alert.type === 'warning' ? T.amber : T.green;
              return (
                <div key={alert.id} style={{
                  background: `${ac}08`, border: `1px solid ${ac}25`,
                  borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${ac}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Alert title — Inter medium */}
                      <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</div>
                      {/* Alert message — Inter light */}
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 300, color: T.dim, marginTop: 2 }}>{alert.message?.substring(0, 65)}...</div>
                    </div>
                    {/* Badge — Orbitron */}
                    <div style={{ padding: '2px 8px', borderRadius: 20, background: `${ac}15`, border: `1px solid ${ac}30`, fontSize: 8, fontWeight: 700, color: ac, fontFamily: T.fontHead, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>
                      {alert.type}
                    </div>
                  </div>
                  {/* Timestamp — Inter light */}
                  <div style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 300, color: T.dim, marginTop: 6 }}>{alert.time}</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ── 6-Month Bar Chart ── */}
      <SectionCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <SectionTitle>6-Month Production Trend</SectionTitle>
            {/* Subtitle — Inter */}
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 400, color: T.text, marginTop: -8 }}>Production units vs efficiency %</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ color: T.accent, label: 'Production' }, { color: T.green, label: 'Efficiency %' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.dim }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MONTHLY_PERFORMANCE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} dy={8} />
            <YAxis yAxisId="left"  tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={axisStyle} tickLine={false} axisLine={false} />
            <Tooltip content={<ModernTooltip />} cursor={{ fill: 'rgba(0,229,255,0.04)' }} />
            <Bar yAxisId="left"  dataKey="production" fill={T.accent} fillOpacity={0.85} name="Production"   radius={[6, 6, 0, 0]}
              activeBar={{ fill: T.accent, fillOpacity: 1, stroke: T.accent, strokeWidth: 1, filter: `drop-shadow(0 0 12px ${T.accent})` }} />
            <Bar yAxisId="right" dataKey="efficiency"  fill={T.green}  fillOpacity={0.85} name="Efficiency %"  radius={[6, 6, 0, 0]}
              activeBar={{ fill: T.green, fillOpacity: 1, stroke: T.green, strokeWidth: 1, filter: `drop-shadow(0 0 12px ${T.green})` }} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

    </div>
  );
}
