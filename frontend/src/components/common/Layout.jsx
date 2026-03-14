import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLive } from '../../context/LiveDataContext';
import {
  LayoutDashboard, Cpu, BarChart3, Package, Users, Bell, BellOff,
  LineChart, FileText, ShieldCheck, Wrench, LogOut,
  ChevronLeft, ChevronRight, Zap, Factory, Volume2, VolumeX,
  Bot, QrCode, DollarSign, Activity
} from 'lucide-react';

const T = {
  bg:      '#020617',
  panel:   '#080f1f',
  card:    '#0c1628',
  border:  '#1e293b',
  accent:  '#00E5FF',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#EF4444',
  text:    '#f1f5f9',
  dim:     '#475569',
  fontHead: "'Orbitron', sans-serif",
  fontBody: "'Inter', sans-serif",
};

const NAV_ITEMS = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard',     exact: true },
  { path: '/machines',     icon: Cpu,             label: 'Machine Health' },
  { path: '/maintenance',  icon: Wrench,          label: 'Predictive Maint.' },
  { path: '/production',   icon: BarChart3,       label: 'Production' },
  { path: '/inventory',    icon: Package,         label: 'Inventory' },
  { path: '/workers',      icon: Users,           label: 'Workforce' },
  { path: '/alerts',       icon: Bell,            label: 'Smart Alerts' },
  { path: '/analytics',   icon: LineChart,        label: 'Analytics' },
  { path: '/energy',       icon: Zap,             label: 'Energy Monitor' },
  { path: '/cost-revenue', icon: DollarSign,      label: 'Cost & Revenue' },
  { path: '/chatbot',      icon: Bot,             label: 'AI Assistant' },
  { path: '/qr-scanner',  icon: QrCode,           label: 'QR Scanner' },
  { path: '/reports',      icon: FileText,        label: 'Reports' },
  { path: '/safety',       icon: ShieldCheck,     label: 'Safety' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { unreadCount, lastUpdate, soundEnabled, setSoundEnabled, notifEnabled, setNotifEnabled } = useLive();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: T.panel,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 20,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px',
          borderBottom: `1px solid ${T.border}`,
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
        }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: 10,
            background: 'rgba(0,229,255,0.1)', border: `1px solid rgba(0,229,255,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,229,255,0.2)',
          }}>
            <Factory size={18} color={T.accent} />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: 2, textShadow: `0 0 15px ${T.accent}88` }}>SMARTFACTORY</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: T.dim, letterSpacing: 1, marginTop: 1 }}>AI MANAGEMENT SYSTEM</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {sidebarOpen && <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: 2, padding: '4px 10px 10px' }}>Navigation</div>}
          {NAV_ITEMS.map(({ path, icon: Icon, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarOpen ? '9px 12px' : '10px', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 10, marginBottom: 2, textDecoration: 'none', position: 'relative',
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                color: isActive ? T.accent : T.dim,
                background: isActive ? 'rgba(0,229,255,0.07)' : 'transparent',
                borderLeft: isActive ? `3px solid ${T.accent}` : '3px solid transparent',
                boxShadow: isActive ? 'inset 0 0 20px rgba(0,229,255,0.04)' : 'none',
                transition: 'all 0.2s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Icon size={16} color={isActive ? T.accent : T.dim} style={{ filter: isActive ? `drop-shadow(0 0 6px ${T.accent})` : 'none' }} />
                    {label === 'Smart Alerts' && unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: -5, right: -5, width: 14, height: 14,
                        background: T.red, borderRadius: '50%', fontSize: 8, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Orbitron', sans-serif",
                        boxShadow: `0 0 8px ${T.red}`,
                      }}>{unreadCount}</span>
                    )}
                  </div>
                  {sidebarOpen && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: `1px solid ${T.border}`, padding: 12, display: 'flex', alignItems: 'center', gap: 10, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
            background: 'rgba(0,229,255,0.1)', border: `1px solid rgba(0,229,255,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 700, color: T.accent,
          }}>
            {user?.avatar}
          </div>
          {sidebarOpen && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.dim }}>{user?.role}</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.dim, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = T.red}
                onMouseLeave={e => e.currentTarget.style.color = T.dim}>
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28, borderRadius: '50%',
            background: T.panel, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: T.dim, zIndex: 30,
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.accent; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.dim; e.currentTarget.style.borderColor = T.border; }}
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 56, background: T.panel, borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, boxShadow: `0 0 10px ${T.green}`, animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: 2 }}>LIVE</span>
            </div>
            <div style={{ width: 1, height: 20, background: T.border }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.dim }}>
              Updated: {lastUpdate?.toLocaleTimeString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.amber }}>
              <Zap size={13} />
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>SHIFT: MORNING</span>
            </div>

            {/* Sound toggle */}
            <button onClick={() => setSoundEnabled(p => !p)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
              color: soundEnabled ? T.accent : T.dim, transition: 'color 0.2s',
            }}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Notif toggle */}
            <button onClick={() => setNotifEnabled(p => !p)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
              color: notifEnabled ? T.accent : T.dim, transition: 'color 0.2s',
            }}>
              {notifEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>

            {/* Alert bell */}
            <NavLink to="/alerts" style={{ position: 'relative', color: T.dim, display: 'flex', padding: 6, borderRadius: 8, transition: 'color 0.2s', textDecoration: 'none' }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0, width: 16, height: 16,
                  background: T.red, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  fontFamily: "'Orbitron', sans-serif", boxShadow: `0 0 10px ${T.red}`,
                }}>{unreadCount}</span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1, overflowY: 'auto', padding: 24,
          background: T.bg,
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
