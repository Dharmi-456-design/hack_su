import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import {
  Wrench, Calendar, Clock, User, DollarSign, AlertTriangle,
  CheckCircle, ArrowLeft, ClipboardList, ChevronDown, X, Zap
} from 'lucide-react';

const MAINTENANCE_TYPES = ['Preventive', 'Emergency', 'Inspection', 'Corrective', 'Calibration'];
const PRIORITIES = [
  { value: 'Low',      color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.4)'    },
  { value: 'Medium',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.4)'   },
  { value: 'High',     color: '#EF4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.4)'    },
  { value: 'Critical', color: '#FF0055', bg: 'rgba(255,0,85,0.08)',    border: 'rgba(255,0,85,0.5)'     },
];

const TECHNICIANS = [
  'Rahul Sharma', 'Priya Patel', 'Arjun Mehta', 'Sneha Desai', 'Vikram Singh',
  'Pooja Iyer', 'Rohan Gupta', 'Manish Kumar', 'Anjali Nair', 'Deepak Reddy',
];

const LS_KEY = 'factory_maintenance_schedule';

function loadSchedule() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function saveSchedule(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function InputLabel({ children, icon: Icon }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
      {Icon && <Icon size={11} style={{ color: '#00E5FF' }} />}
      {children}
    </label>
  );
}

function FieldBox({ children, style = {} }) {
  return (
    <div style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 10, padding: '10px 14px', transition: 'border-color 0.2s', ...style }}>
      {children}
    </div>
  );
}

export default function ScheduleMaintenancePage() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const { data: machines, loading } = useApi('/machines');

  const machine = machines.find(m => (m.machineId || m.id || m._id) === machineId) || null;

  const today = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const nowTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  const [form, setForm] = useState({
    technician: '',
    maintenanceType: 'Preventive',
    scheduledDate: todayStr,
    scheduledTime: nowTime,
    estimatedCost: '',
    estimatedDuration: '',
    priority: 'Medium',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scheduleList, setScheduleList] = useState(loadSchedule);
  const [focusedField, setFocusedField] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  function validate() {
    const e = {};
    if (!form.technician.trim()) e.technician = 'Technician name is required';
    if (!form.scheduledDate) e.scheduledDate = 'Date is required';
    if (!form.scheduledTime) e.scheduledTime = 'Time is required';
    if (!form.estimatedCost || isNaN(form.estimatedCost)) e.estimatedCost = 'Enter a valid cost';
    if (!form.estimatedDuration.trim()) e.estimatedDuration = 'Duration is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const dateObj = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const record = {
      id: Date.now(),
      machineId: machine?.machineId || machine?.id || machineId,
      machineName: machine?.name || machineId,
      technician: form.technician,
      maintenanceType: form.maintenanceType,
      scheduledDate: form.scheduledDate,
      scheduledDateDisplay: dateObj.toLocaleDateString('en-IN', options),
      scheduledTime: form.scheduledTime,
      scheduledTimeDisplay: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      estimatedCost: Number(form.estimatedCost),
      estimatedDuration: form.estimatedDuration,
      priority: form.priority,
      notes: form.notes,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    const updated = [record, ...scheduleList];
    setScheduleList(updated);
    saveSchedule(updated);
    setSubmitted(true);
  }

  function removeRecord(id) {
    const updated = scheduleList.filter(r => r.id !== id);
    setScheduleList(updated);
    saveSchedule(updated);
  }

  const selectedPriority = PRIORITIES.find(p => p.value === form.priority);
  const inputStyle = (field) => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f1f5f9',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    padding: 0,
  });
  const fieldWrapStyle = (field) => ({
    background: '#0a1628',
    border: `1px solid ${focusedField === field ? '#00E5FF66' : errors[field] ? '#EF444466' : '#1e293b'}`,
    borderRadius: 10,
    padding: '10px 14px',
    transition: 'border-color 0.2s',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(0,229,255,0.07)' : 'none',
  });

  const statusColors = { Scheduled: '#00E5FF', 'In Progress': '#F59E0B', Completed: '#22C55E', Cancelled: '#EF4444' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#64748b', fontFamily: 'monospace', fontSize: 13 }}>
      <div style={{ animation: 'pulse 1.5s infinite' }}>Loading machine data...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }} className="animate-slide-in">
        <button
          onClick={() => navigate('/maintenance')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, padding: '8px 14px', color: '#00E5FF', fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.07)'; }}
        >
          <ArrowLeft size={14} /> BACK
        </button>
        <div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 26, fontWeight: 700, color: '#00E5FF', letterSpacing: 2, textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,229,255,0.3)', margin: 0 }}>
            Schedule Maintenance
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, fontFamily: 'Inter, sans-serif', margin: '4px 0 0' }}>
            Plan and log maintenance for <span style={{ color: '#00E5FF' }}>{machine?.name || machineId}</span>
          </p>
        </div>
      </div>

      {/* Success State */}
      {submitted && (
        <div className="animate-fade-up" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle size={22} style={{ color: '#22C55E' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#22C55E', fontSize: 16, letterSpacing: 1 }}>MAINTENANCE SCHEDULED SUCCESSFULLY</div>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>The maintenance record has been added to the schedule below.</div>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '7px 16px', color: '#22C55E', fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
          >
            SCHEDULE ANOTHER
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ background: '#0c1628', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
            {/* Form Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e293b', background: 'rgba(0,229,255,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={16} style={{ color: '#00E5FF' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, color: '#f1f5f9', letterSpacing: 1 }}>MAINTENANCE DETAILS</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>Fill in all required fields</div>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {/* Machine Info Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <InputLabel icon={Zap}>Machine ID</InputLabel>
                  <FieldBox>
                    <span style={{ color: '#00E5FF', fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}>
                      {machine?.machineId || machine?.id || machineId}
                    </span>
                  </FieldBox>
                </div>
                <div>
                  <InputLabel icon={Zap}>Machine Name</InputLabel>
                  <FieldBox>
                    <span style={{ color: '#f1f5f9', fontSize: 14 }}>{machine?.name || '—'}</span>
                  </FieldBox>
                </div>
              </div>

              {/* Technician */}
              <div style={{ marginBottom: 20 }}>
                <InputLabel icon={User}>Technician Name *</InputLabel>
                <div style={fieldWrapStyle('technician')}>
                  <input
                    list="technician-list"
                    value={form.technician}
                    onChange={e => set('technician', e.target.value)}
                    onFocus={() => setFocusedField('technician')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter technician name..."
                    style={inputStyle('technician')}
                  />
                  <datalist id="technician-list">
                    {TECHNICIANS.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>
                {errors.technician && <div style={{ color: '#EF4444', fontSize: 11, marginTop: 5, fontFamily: 'monospace' }}>⚠ {errors.technician}</div>}
              </div>

              {/* Maintenance Type */}
              <div style={{ marginBottom: 20 }}>
                <InputLabel icon={Wrench}>Maintenance Type</InputLabel>
                <div style={{ ...fieldWrapStyle('maintenanceType'), position: 'relative' }}>
                  <select
                    value={form.maintenanceType}
                    onChange={e => set('maintenanceType', e.target.value)}
                    onFocus={() => setFocusedField('maintenanceType')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('maintenanceType'), appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                  >
                    {MAINTENANCE_TYPES.map(t => <option key={t} value={t} style={{ background: '#0c1628' }}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <InputLabel icon={Calendar}>Scheduled Date *</InputLabel>
                  <div style={fieldWrapStyle('scheduledDate')}>
                    <input
                      type="date"
                      value={form.scheduledDate}
                      onChange={e => set('scheduledDate', e.target.value)}
                      onFocus={() => setFocusedField('scheduledDate')}
                      onBlur={() => setFocusedField(null)}
                      style={{ ...inputStyle('scheduledDate'), colorScheme: 'dark' }}
                    />
                  </div>
                  {errors.scheduledDate && <div style={{ color: '#EF4444', fontSize: 11, marginTop: 5, fontFamily: 'monospace' }}>⚠ {errors.scheduledDate}</div>}
                </div>
                <div>
                  <InputLabel icon={Clock}>Scheduled Time *</InputLabel>
                  <div style={fieldWrapStyle('scheduledTime')}>
                    <input
                      type="time"
                      value={form.scheduledTime}
                      onChange={e => set('scheduledTime', e.target.value)}
                      onFocus={() => setFocusedField('scheduledTime')}
                      onBlur={() => setFocusedField(null)}
                      style={{ ...inputStyle('scheduledTime'), colorScheme: 'dark' }}
                    />
                  </div>
                  {errors.scheduledTime && <div style={{ color: '#EF4444', fontSize: 11, marginTop: 5, fontFamily: 'monospace' }}>⚠ {errors.scheduledTime}</div>}
                </div>
              </div>

              {/* Cost & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <InputLabel icon={DollarSign}>Estimated Cost (₹) *</InputLabel>
                  <div style={fieldWrapStyle('estimatedCost')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#00E5FF', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>₹</span>
                      <input
                        type="number"
                        min="0"
                        value={form.estimatedCost}
                        onChange={e => set('estimatedCost', e.target.value)}
                        onFocus={() => setFocusedField('estimatedCost')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="5000"
                        style={{ ...inputStyle('estimatedCost'), flex: 1 }}
                      />
                    </div>
                  </div>
                  {errors.estimatedCost && <div style={{ color: '#EF4444', fontSize: 11, marginTop: 5, fontFamily: 'monospace' }}>⚠ {errors.estimatedCost}</div>}
                </div>
                <div>
                  <InputLabel icon={Clock}>Est. Duration (hours) *</InputLabel>
                  <div style={fieldWrapStyle('estimatedDuration')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={form.estimatedDuration}
                        onChange={e => set('estimatedDuration', e.target.value)}
                        onFocus={() => setFocusedField('estimatedDuration')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. 3"
                        style={{ ...inputStyle('estimatedDuration'), flex: 1 }}
                      />
                      <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace', flexShrink: 0 }}>hrs</span>
                    </div>
                  </div>
                  {errors.estimatedDuration && <div style={{ color: '#EF4444', fontSize: 11, marginTop: 5, fontFamily: 'monospace' }}>⚠ {errors.estimatedDuration}</div>}
                </div>
              </div>

              {/* Priority */}
              <div style={{ marginBottom: 20 }}>
                <InputLabel icon={AlertTriangle}>Priority Level</InputLabel>
                <div style={{ display: 'flex', gap: 10 }}>
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set('priority', p.value)}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: `1px solid ${form.priority === p.value ? p.border : '#1e293b'}`,
                        background: form.priority === p.value ? p.bg : 'transparent',
                        color: form.priority === p.value ? p.color : '#64748b',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: form.priority === p.value ? `0 0 12px ${p.border}` : 'none',
                      }}
                    >
                      {p.value.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 28 }}>
                <InputLabel icon={ClipboardList}>Notes / Description</InputLabel>
                <div style={{ ...fieldWrapStyle('notes'), padding: 0 }}>
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    onFocus={() => setFocusedField('notes')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Describe the maintenance task, observations, or any special instructions..."
                    rows={4}
                    style={{ ...inputStyle('notes'), padding: '10px 14px', resize: 'vertical', display: 'block' }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #00E5FF, #0099cc)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#020617',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 4px 20px rgba(0,229,255,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 30px rgba(0,229,255,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,229,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <CheckCircle size={16} />
                Schedule Maintenance
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar: Machine Info + Priority Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Machine Card */}
          {machine && (
            <div className="animate-fade-up" style={{ background: '#0c1628', border: '1px solid #1e3a5f', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e293b', background: 'rgba(0,229,255,0.04)' }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>MACHINE INFO</div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{machine.name}</div>
                    <div style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>{machine.machineId || machine.id}</div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: machine.status === 'Running' ? 'rgba(34,197,94,0.1)' : machine.status === 'Maintenance' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    color: machine.status === 'Running' ? '#22C55E' : machine.status === 'Maintenance' ? '#F59E0B' : '#EF4444',
                    fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                    border: `1px solid ${machine.status === 'Running' ? 'rgba(34,197,94,0.3)' : machine.status === 'Maintenance' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {(machine.status || 'UNKNOWN').toUpperCase()}
                  </div>
                </div>
                {[
                  { label: 'Location', value: machine.location || '—' },
                  { label: 'Efficiency', value: `${machine.efficiency || 0}%` },
                  { label: 'Temperature', value: `${machine.sensors?.temperature ?? machine.temperature ?? 0}°C` },
                  { label: 'Vibration', value: `${machine.sensors?.vibration ?? machine.vibration ?? 0}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #0f172a' }}>
                    <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>{label}</span>
                    <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Legend */}
          <div style={{ background: '#0c1628', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e293b', background: 'rgba(0,229,255,0.04)' }}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>PRIORITY GUIDE</div>
            </div>
            <div style={{ padding: 18 }}>
              {[
                { p: 'Low', desc: 'Routine check, no urgency' },
                { p: 'Medium', desc: 'Schedule within 30 days' },
                { p: 'High', desc: 'Schedule within 7 days' },
                { p: 'Critical', desc: 'Immediate attention required' },
              ].map(({ p, desc }) => {
                const pDef = PRIORITIES.find(x => x.value === p);
                return (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #0f172a' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: pDef.color, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: pDef.color, fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{p}</span>
                      <span style={{ color: '#475569', fontSize: 11, marginLeft: 6 }}>— {desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ background: '#0c1628', border: '1px solid #1e293b', borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 12 }}>SCHEDULE STATS</div>
            {[
              { label: 'Total Scheduled', value: scheduleList.length, color: '#00E5FF' },
              { label: 'This Machine', value: scheduleList.filter(r => r.machineId === (machine?.machineId || machine?.id || machineId)).length, color: '#F59E0B' },
              { label: 'Critical', value: scheduleList.filter(r => r.priority === 'Critical').length, color: '#EF4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>{label}</span>
                <span style={{ color, fontSize: 18, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Schedule Table */}
      {scheduleList.length > 0 && (
        <div className="animate-fade-up" style={{ marginTop: 36, background: '#0c1628', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e293b', background: 'rgba(0,229,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ClipboardList size={16} style={{ color: '#00E5FF' }} />
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, color: '#f1f5f9', letterSpacing: 1 }}>MAINTENANCE SCHEDULE</div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{scheduleList.length} RECORD{scheduleList.length !== 1 ? 'S' : ''}</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  {['Machine', 'Date', 'Time', 'Type', 'Technician', 'Cost', 'Duration', 'Priority', 'Status', 'X'].map(h => (
                    <th key={h}>{h === 'X' ? '' : h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleList.map((r, i) => {
                  const pDef = PRIORITIES.find(p => p.value === r.priority);
                  return (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap">
                        <div className="font-semibold text-factory-text">{r.machineName}</div>
                        <div className="text-[10px] text-factory-accent font-mono">{r.machineId}</div>
                      </td>
                      <td className="text-factory-dim font-mono text-xs whitespace-nowrap">{r.scheduledDateDisplay}</td>
                      <td className="text-factory-dim font-mono text-xs whitespace-nowrap">{r.scheduledTimeDisplay}</td>
                      <td className="whitespace-nowrap">
                        <span className="bg-factory-accent/10 border border-factory-accent/20 rounded px-2 py-0.5 text-factory-accent text-xs font-mono">{r.maintenanceType}</span>
                      </td>
                      <td className="text-factory-text text-sm whitespace-nowrap">{r.technician}</td>
                      <td className="text-factory-green font-mono text-sm font-bold whitespace-nowrap">₹{Number(r.estimatedCost).toLocaleString('en-IN')}</td>
                      <td className="text-factory-dim text-xs whitespace-nowrap">{r.estimatedDuration}h</td>
                      <td className="whitespace-nowrap">
                        <span className="rounded px-2 py-0.5 text-xs font-mono font-bold" style={{ background: pDef?.bg, border: `1px solid ${pDef?.border}`, color: pDef?.color }}>{r.priority}</span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="rounded px-2 py-0.5 text-xs font-mono" style={{ background: `${statusColors[r.status]}15`, border: `1px solid ${statusColors[r.status]}44`, color: statusColors[r.status] }}>{r.status}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => removeRecord(r.id)}
                          className="bg-factory-red/10 border border-factory-red/30 rounded p-1 text-factory-red hover:bg-factory-red/20 transition-all flex items-center justify-center cursor-pointer"
                          title="Remove record"
                        >
                          <X size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
