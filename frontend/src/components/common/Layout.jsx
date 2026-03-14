import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLive } from '../../context/LiveDataContext';
import api from '../../api';
import {
  LayoutDashboard, Cpu, BarChart3, Package, Users, Bell, BellOff,
  LineChart, FileText, ShieldCheck, Wrench, LogOut,
  ChevronLeft, ChevronRight, Zap, Factory, Volume2, VolumeX,
  Bot, DollarSign, Activity, Shield
} from 'lucide-react';

const T = {
  bg:      '#0B1420',
  panel:   '#111C2D',
  card:    '#111C2D',
  border:  '#1F2F46',
  accent:  '#00E5FF',
  green:   '#00FF9C',
  amber:   '#FFC857',
  red:     '#FF4D4D',
  text:    '#FFFFFF',
  dim:     '#A0B3C6',
  fontHead: "'Inter', sans-serif",
  fontBody: "'Inter', sans-serif",
};

const NAV_ITEMS = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard',     exact: true },
  { path: '/admin',        icon: ShieldCheck,     label: 'Admin Panel',   adminOnly: true },
  { path: '/machines',     icon: Cpu,             label: 'Machine Health' },
  { path: '/maintenance',  icon: Wrench,          label: 'Predictive Maint.' },
  { path: '/production',   icon: BarChart3,       label: 'Production' },
  { path: '/inventory',    icon: Package,         label: 'Inventory' },
  { path: '/workers',      icon: Users,           label: 'Workforce' },
  { path: '/safety',       icon: Shield,          label: 'Safety Controls' },
  { path: '/alerts',       icon: Bell,            label: 'Smart Alerts' },
  { path: '/analytics',    icon: LineChart,       label: 'Analytics' },
  { path: '/energy',       icon: Zap,             label: 'Energy Monitor' },
  { path: '/cost-revenue', icon: DollarSign,      label: 'Cost & Revenue' },
  { path: '/chatbot',      icon: Bot,             label: 'AI Assistant' },

  { path: '/reports',      icon: FileText,        label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { unreadCount, lastUpdate, soundEnabled, setSoundEnabled, notifEnabled, setNotifEnabled } = useLive();
  const [pushLogs, setPushLogs] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const fetchPushLogs = useCallback(async () => {
    try {
      const { data } = await api.get('/push/logs');
      setPushLogs(data.data || []);
    } catch (e) {
      console.error('Failed to fetch push logs', e);
    }
  }, []);

  useEffect(() => {
    const requestPushPermission = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const swReg = await navigator.serviceWorker.register('/sw.js');
          const { data } = await api.get('/push/public-key');
          
          const padding = '='.repeat((4 - data.publicKey.length % 4) % 4);
          const base64 = (data.publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const convertedVapidKey = new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
          
          let subscription = await swReg.pushManager.getSubscription();
          if (!subscription) {
            subscription = await swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey
            });
          }
          await api.post('/push/subscribe', { userId: user?._id || 'admin', token: subscription });
        }
      } catch (error) { console.error('Push setup failed', error); }
    };
    
    if (user && notifEnabled) requestPushPermission();
    fetchPushLogs();

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'PUSH_RECEIVED') fetchPushLogs();
    };
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
  }, [user, notifEnabled, fetchPushLogs]);

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
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: 1 }}>SMARTFACTORY.<span style={{color: T.accent}}>AI</span></div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.dim, letterSpacing: 0.5, marginTop: 2 }}>MANAGEMENT SYSTEM</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {NAV_ITEMS.filter(item => !item.adminOnly || user?.role === 'Admin').map(({ path, icon: Icon, label, exact }) => (
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
                        background: T.red, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Inter', sans-serif",
                        boxShadow: `0 2px 4px rgba(239, 68, 68, 0.4)`,
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
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.text,
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
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, boxShadow: `0 0 4px ${T.green}` }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: 1 }}>LIVE</span>
            </div>
            <div style={{ width: 1, height: 20, background: T.border }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.dim }}>
              Updated: {lastUpdate?.toLocaleTimeString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.amber }}>
              <Zap size={13} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>SHIFT: MORNING</span>
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
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: T.dim, transition: 'color 0.2s', display: 'flex' }}
              >
                <Bell size={18} />
                {(pushLogs.length > 0 || unreadCount > 0) && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0, width: 16, height: 16,
                    background: T.red, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    fontFamily: "'Inter', sans-serif", boxShadow: `0 2px 4px rgba(239, 68, 68, 0.4)`,
                  }}>{Math.max(pushLogs.length, unreadCount)}</span>
                )}
              </button>
              
              {isNotifOpen && (
                <div style={{
                  position: 'absolute', top: 40, right: 0, width: 340, background: '#0B1420',
                  border: `1px solid rgba(0,229,255,0.3)`, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                  zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'Inter', sans-serif" }}>Notifications</span>
                    <button onClick={() => { setIsNotifOpen(false); navigate('/alerts'); }} style={{ background:'none', border:'none', color: T.accent, fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>View All</button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {pushLogs.length === 0 ? (
                      <div style={{ padding: 30, textAlign: 'center', color: T.dim, fontSize: 12, fontFamily: "'Inter', sans-serif" }}>No recent alerts</div>
                    ) : (
                      pushLogs.slice(0, 10).map((log, i) => (
                        <div key={log._id || i} onClick={() => { setIsNotifOpen(false); navigate('/machines'); }} style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(0,229,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <div style={{ display: 'flex',justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ color: log.alertType === 'critical' ? T.red : log.alertType === 'warning' ? T.amber : T.accent, fontSize: 12, fontWeight: 600 }}>{log.title}</div>
                            <div style={{ color: T.dim, fontSize: 9, flexShrink: 0 }}>{new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                          <div style={{ color: T.dim, fontSize: 11, marginBottom: 8, lineHeight: 1.4 }}>{log.message}</div>
                          {log.machine && (
                            <div style={{ color: T.accent, fontSize: 10, background: 'rgba(0,229,255,0.1)', display: 'inline-block', padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(0,229,255,0.2)` }}>{log.machine}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
