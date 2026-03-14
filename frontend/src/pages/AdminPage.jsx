import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  Users, Cpu, BarChart3, Wrench, Package, Bell, Plus, Trash2, Edit2,
  Save, X, RefreshCw, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle, Clock
} from 'lucide-react';

// ─── Theme ───────────────────────────────────────────────────────
const T = {
  bg:'#020617', panel:'#080f1f', card:'#0c1628', border:'#1e293b',
  accent:'#00E5FF', green:'#22C55E', amber:'#F59E0B', red:'#EF4444',
  text:'#f1f5f9', dim:'#475569'
};

const inputStyle = {
  background:'#040d1a', border:'1px solid #1e293b', color:'#f1f5f9',
  padding:'8px 12px', borderRadius:6, fontFamily:'Inter',fontSize:13,
  outline:'none', width:'100%', boxSizing:'border-box'
};
const labelStyle = { fontSize:10, color:T.dim, textTransform:'uppercase', letterSpacing:1, fontFamily:'Orbitron', display:'block', marginBottom:4 };
const btnPrimary = { background:'rgba(0,229,255,0.12)', border:`1px solid ${T.accent}`, color:T.accent, padding:'8px 18px', borderRadius:6, cursor:'pointer', fontFamily:'Orbitron', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 };
const btnDanger  = { background:'rgba(239,68,68,0.12)',  border:`1px solid ${T.red}`,    color:T.red,    padding:'6px 14px',  borderRadius:6, cursor:'pointer', fontFamily:'Orbitron', fontSize:10 };
const btnSuccess = { background:'rgba(34,197,94,0.12)',  border:`1px solid ${T.green}`,  color:T.green,  padding:'8px 18px',  borderRadius:6, cursor:'pointer', fontFamily:'Orbitron', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 };

const TABS = [
  { id:'users',       label:'Users',       icon: Users },
  { id:'machines',    label:'Machines',    icon: Cpu },
  { id:'production',  label:'Production',  icon: BarChart3 },
  { id:'maintenance', label:'Maintenance', icon: Wrench },
  { id:'inventory',   label:'Inventory',   icon: Package },
  { id:'workers',     label:'Workers',     icon: Users },
  { id:'alerts',      label:'Alerts',      icon: Bell },
];

// ─── Reusable table ──────────────────────────────────────────────
function AdminTable({ columns, rows, onDelete, onEdit, emptyMsg = 'No data yet.' }) {
  if (!rows.length) return (
    <div style={{ textAlign:'center', padding:'40px', color:T.dim, fontFamily:'Inter', fontSize:13 }}>{emptyMsg}</div>
  );
  return (
    <div style={{ overflowX:'auto' }}>
      <table className="saas-table">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key}>{c.label}</th>
            ))}
            {(onDelete || onEdit) && <th style={{ textAlign:'right' }}>ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row._id || ri}>
              {columns.map(c => (
                <td key={c.key}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
              {(onDelete || onEdit) && (
                <td>
                  <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                    {onEdit   && <button onClick={() => onEdit(row)}   style={{ ...btnPrimary, padding:'5px 10px', fontSize:10 }}><Edit2  size={12}/></button>}
                    {onDelete && <button onClick={() => { if(window.confirm('Delete this record?')) onDelete(row); }} style={btnDanger}><Trash2 size={12}/></button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Collapsible form wrapper ────────────────────────────────────
function FormSection({ title, open, toggle, children }) {
  return (
    <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, marginBottom:16 }}>
      <button onClick={toggle} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', color:T.accent, fontFamily:'Orbitron', fontSize:12, fontWeight:700 }}>
        <span style={{ display:'flex', alignItems:'center', gap:8 }}><Plus size={14} />{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div style={{ padding:'16px 18px', borderTop:`1px solid ${T.border}` }}>{children}</div>}
    </div>
  );
}

function Field({ label, children, half }) {
  return (
    <div style={{ flex: half ? '0 0 calc(50% - 6px)' : '1 1 100%', marginBottom:12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SUB-PANELS
// ═══════════════════════════════════════════════════════════════

// ── USERS ────────────────────────────────────────────────────────
function UsersPanel() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'Operator', department:'Production' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/users'); setRows(r.data.data || []); } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/users', form); toast.success('User created!'); load(); setOpen(false); setForm({ name:'', email:'', password:'', role:'Operator', department:'Production' }); }
    catch(err) { toast.error(err.response?.data?.error || 'Create failed'); }
  };

  const handleDelete = async (row) => {
    try { await api.delete(`/users/${row._id}`); toast.success('User deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const statusBadge = (s) => (
    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background: s === 'Active' ? `${T.green}22` : `${T.amber}22`, color: s === 'Active' ? T.green : T.amber, fontFamily:'Orbitron' }}>{s}</span>
  );
  const roleBadge = (r) => (
    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${T.accent}18`, color:T.accent, fontFamily:'Orbitron' }}>{r}</span>
  );

  return (
    <div>
      <FormSection title="CREATE NEW USER" open={open} toggle={() => setOpen(!open)}>
        <form onSubmit={handleCreate}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="Full Name *" half><input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Rajesh Kumar" required /></Field>
            <Field label="Email *" half><input type="email" style={inputStyle} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="user@factory.com" required /></Field>
            <Field label="Password *" half><input type="password" style={inputStyle} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></Field>
            <Field label="Department" half><input style={inputStyle} value={form.department} onChange={e=>setForm({...form,department:e.target.value})} /></Field>
            <Field label="Role" half>
              <select style={inputStyle} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                <option>Admin</option><option>Manager</option><option>Operator</option>
              </select>
            </Field>
          </div>
          <button type="submit" style={btnSuccess}><Save size={14}/>CREATE USER</button>
        </form>
      </FormSection>

      {loading ? <div style={{ textAlign:'center', padding:30, color:T.dim }}>Loading...</div> : (
        <AdminTable
          columns={[
            { key:'name',       label:'Name' },
            { key:'email',      label:'Email' },
            { key:'role',       label:'Role',       render: v => roleBadge(v) },
            { key:'department', label:'Department' },
            { key:'status',     label:'Status',     render: v => statusBadge(v || 'Active') },
          ]}
          rows={rows}
          onDelete={handleDelete}
          emptyMsg="No users yet. Create one above."
        />
      )}
    </div>
  );
}

// ── MACHINES ─────────────────────────────────────────────────────
function MachinesPanel() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ machineId:'', name:'', location:'', status:'Idle', efficiency:100 });

  const load = useCallback(async () => {
    try { const r = await api.get('/machines'); setRows(r.data.data || []); } catch { toast.error('Failed'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editRow) { await api.put(`/machines/${editRow._id}`, form); toast.success('Updated!'); setEditRow(null); }
      else { await api.post('/machines', form); toast.success('Machine added!'); }
      load(); setOpen(false); setForm({ machineId:'', name:'', location:'', status:'Idle', efficiency:100 });
    } catch(err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (row) => {
    try { await api.delete(`/machines/${row._id}`); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const handleEdit = (row) => {
    setForm({ machineId:row.machineId, name:row.name, location:row.location, status:row.status, efficiency:row.efficiency });
    setEditRow(row); setOpen(true);
  };

  const statusBadge = (s) => {
    const color = s === 'Running' ? T.green : s === 'Maintenance' ? T.amber : T.dim;
    return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${color}22`, color, fontFamily:'Orbitron' }}>{s}</span>;
  };

  return (
    <div>
      <FormSection title={editRow ? 'EDIT MACHINE' : 'ADD NEW MACHINE'} open={open} toggle={() => { setOpen(!open); setEditRow(null); }}>
        <form onSubmit={handleCreate}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="Machine ID *" half><input style={inputStyle} value={form.machineId} onChange={e=>setForm({...form,machineId:e.target.value})} placeholder="M005" required /></Field>
            <Field label="Machine Name *" half><input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="CNC Lathe Pro" required /></Field>
            <Field label="Location *" half><input style={inputStyle} value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Bay A2" required /></Field>
            <Field label="Status" half>
              <select style={inputStyle} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option>Running</option><option>Idle</option><option>Maintenance</option>
              </select>
            </Field>
            <Field label="Efficiency (%)" half><input type="number" style={inputStyle} value={form.efficiency} onChange={e=>setForm({...form,efficiency:+e.target.value})} min="0" max="100" /></Field>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" style={btnSuccess}><Save size={14}/>{editRow ? 'SAVE CHANGES' : 'ADD MACHINE'}</button>
            {editRow && <button type="button" onClick={() => { setEditRow(null); setOpen(false); }} style={btnDanger}><X size={14}/></button>}
          </div>
        </form>
      </FormSection>

      <AdminTable
        columns={[
          { key:'machineId',  label:'ID' },
          { key:'name',       label:'Name' },
          { key:'location',   label:'Location' },
          { key:'status',     label:'Status',    render: v => statusBadge(v) },
          { key:'efficiency', label:'Efficiency', render: v => `${v}%` },
          { key:'sensors',    label:'Temp',       render: (v) => `${v?.temperature ?? 0}°C` },
        ]}
        rows={rows}
        onDelete={handleDelete}
        onEdit={handleEdit}
        emptyMsg="No machines yet. Add one above."
      />
    </div>
  );
}

// ── PRODUCTION ───────────────────────────────────────────────────
function ProductionPanel() {
  const [rows, setRows]         = useState([]);
  const [machines, setMachines] = useState([]);
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState({ machine:'', productName:'', targetQuantity:500, producedQuantity:0, shift:'Morning', date: new Date().toISOString().slice(0,10) });

  const load = useCallback(async () => {
    try {
      const [pRes, mRes] = await Promise.all([api.get('/production'), api.get('/machines')]);
      setRows(pRes.data.data || []);
      setMachines(mRes.data.data || []);
    } catch { toast.error('Load failed'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/production', form); toast.success('Entry added!'); load(); setOpen(false); }
    catch(err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (row) => {
    try { await api.delete(`/production/${row._id}`); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const effBar = (target, produced) => {
    const pct = target ? Math.round((produced / target) * 100) : 0;
    const color = pct >= 100 ? T.green : pct >= 80 ? T.amber : T.red;
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, height:6, background:'#1e293b', borderRadius:3, overflow:'hidden' }}>
          <div style={{ width:`${Math.min(100,pct)}%`, height:'100%', background:color, borderRadius:3 }} />
        </div>
        <span style={{ color, fontSize:11, fontFamily:'Orbitron', minWidth:36 }}>{pct}%</span>
      </div>
    );
  };

  return (
    <div>
      <FormSection title="ADD PRODUCTION ENTRY" open={open} toggle={() => setOpen(!open)}>
        <form onSubmit={handleCreate}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="Machine *" half>
              <select style={inputStyle} value={form.machine} onChange={e=>setForm({...form,machine:e.target.value})} required>
                <option value="">Select Machine...</option>
                {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.machineId})</option>)}
              </select>
            </Field>
            <Field label="Product Name *" half><input style={inputStyle} value={form.productName} onChange={e=>setForm({...form,productName:e.target.value})} placeholder="Auto Component" required /></Field>
            <Field label="Target Qty" half><input type="number" style={inputStyle} value={form.targetQuantity} onChange={e=>setForm({...form,targetQuantity:+e.target.value})} min="1" /></Field>
            <Field label="Produced Qty" half><input type="number" style={inputStyle} value={form.producedQuantity} onChange={e=>setForm({...form,producedQuantity:+e.target.value})} min="0" /></Field>
            <Field label="Shift" half>
              <select style={inputStyle} value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})}>
                <option>Morning</option><option>Evening</option><option>Night</option>
              </select>
            </Field>
            <Field label="Date *" half><input type="date" style={inputStyle} value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required /></Field>
          </div>
          <button type="submit" style={btnSuccess}><Save size={14}/>ADD ENTRY</button>
        </form>
      </FormSection>

      <AdminTable
        columns={[
          { key:'machine',          label:'Machine',  render:(v) => v?.name || '—' },
          { key:'productName',      label:'Product' },
          { key:'shift',            label:'Shift' },
          { key:'date',             label:'Date',    render:(v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
          { key:'targetQuantity',   label:'Target' },
          { key:'producedQuantity', label:'Produced' },
          { key:'_eff',             label:'Efficiency', render:(_, row) => effBar(row.targetQuantity, row.producedQuantity) },
        ]}
        rows={rows}
        onDelete={handleDelete}
        emptyMsg="No production records. Add one above."
      />
    </div>
  );
}

// ── MAINTENANCE ──────────────────────────────────────────────────
function MaintenancePanel() {
  const [rows, setRows]         = useState([]);
  const [machines, setMachines] = useState([]);
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState({ machine:'', issueDescription:'', technician:'', status:'Pending', date: new Date().toISOString().slice(0,10), notes:'' });

  const load = useCallback(async () => {
    try {
      const [mRes, machRes] = await Promise.all([api.get('/maintenance'), api.get('/machines')]);
      setRows(mRes.data.data || []);
      setMachines(machRes.data.data || []);
    } catch { toast.error('Load failed'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/maintenance', form); toast.success('Scheduled!'); load(); setOpen(false); }
    catch(err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (row) => {
    try { await api.delete(`/maintenance/${row._id}`); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const handleStatusChange = async (row, status) => {
    try { await api.put(`/maintenance/${row._id}`, { status }); toast.success(`Status: ${status}`); load(); } catch { toast.error('Update failed'); }
  };

  const statusBadge = (s) => {
    const map = { Pending:T.amber, 'In Progress':T.accent, Completed:T.green };
    const c = map[s] || T.dim;
    return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${c}22`, color:c, fontFamily:'Orbitron' }}>{s}</span>;
  };

  return (
    <div>
      <FormSection title="SCHEDULE MAINTENANCE" open={open} toggle={() => setOpen(!open)}>
        <form onSubmit={handleCreate}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="Machine *" half>
              <select style={inputStyle} value={form.machine} onChange={e=>setForm({...form,machine:e.target.value})} required>
                <option value="">Select Machine...</option>
                {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.machineId})</option>)}
              </select>
            </Field>
            <Field label="Issue Description *" half><input style={inputStyle} value={form.issueDescription} onChange={e=>setForm({...form,issueDescription:e.target.value})} placeholder="Describe the issue" required /></Field>
            <Field label="Technician *" half><input style={inputStyle} value={form.technician} onChange={e=>setForm({...form,technician:e.target.value})} placeholder="Technician name" required /></Field>
            <Field label="Date *" half><input type="date" style={inputStyle} value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required /></Field>
            <Field label="Status" half>
              <select style={inputStyle} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option>Pending</option><option>In Progress</option><option>Completed</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea style={{...inputStyle, resize:'none'}} rows={2} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Additional notes..." />
            </Field>
          </div>
          <button type="submit" style={btnSuccess}><Save size={14}/>SCHEDULE</button>
        </form>
      </FormSection>

      <AdminTable
        columns={[
          { key:'machine',          label:'Machine',     render:(v) => v?.name || '—' },
          { key:'issueDescription', label:'Issue' },
          { key:'technician',       label:'Technician' },
          { key:'date',             label:'Date',       render:(v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
          { key:'status',           label:'Status',     render:(v, row) => (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {statusBadge(v)}
              {v !== 'Completed' && <button onClick={() => handleStatusChange(row, v === 'Pending' ? 'In Progress' : 'Completed')} style={{ ...btnPrimary, padding:'3px 8px', fontSize:9 }}>→</button>}
            </div>
          )},
          { key:'notes', label:'Notes', render:(v) => <span style={{ fontSize:11, color:T.dim }}>{v || '—'}</span> },
        ]}
        rows={rows}
        onDelete={handleDelete}
        emptyMsg="No maintenance records. Schedule one above."
      />
    </div>
  );
}

// ── INVENTORY ────────────────────────────────────────────────────
function InventoryAdminPanel() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ itemId:'', name:'', category:'Raw Material', unit:'kg', stock:0, minStock:0, maxStock:1000, unitCost:0, supplier:'' });

  const load = useCallback(async () => {
    try { const r = await api.get('/inventory'); setRows(r.data.data || []); } catch { toast.error('Failed'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/inventory', form); toast.success('Item added!'); load(); setOpen(false); setForm({ itemId:'', name:'', category:'Raw Material', unit:'kg', stock:0, minStock:0, maxStock:1000, unitCost:0, supplier:'' }); }
    catch(err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleDelete = async (row) => {
    try { await api.delete(`/inventory/${row.itemId}`); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const stockBadge = (item) => {
    const isLow = item.stock <= item.minStock;
    return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background: isLow ? `${T.red}22` : `${T.green}22`, color: isLow ? T.red : T.green, fontFamily:'Orbitron' }}>{isLow ? 'LOW' : 'OK'}</span>;
  };

  return (
    <div>
      <FormSection title="ADD INVENTORY ITEM" open={open} toggle={() => setOpen(!open)}>
        <form onSubmit={handleCreate}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="Item ID *"   half><input style={inputStyle} value={form.itemId} onChange={e=>setForm({...form,itemId:e.target.value})} placeholder="INV009" required /></Field>
            <Field label="Item Name *" half><input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Steel Rods" required /></Field>
            <Field label="Category" half>
              <select style={inputStyle} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {['Raw Material','Consumable','Tool','Spare Part','Finished Good','Safety'].map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Unit"     half><input style={inputStyle} value={form.unit}    onChange={e=>setForm({...form,unit:e.target.value})} placeholder="kg" /></Field>
            <Field label="Supplier" half><input style={inputStyle} value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} placeholder="Vendor" /></Field>
            <Field label="Unit Cost (₹)" half><input type="number" style={inputStyle} value={form.unitCost} onChange={e=>setForm({...form,unitCost:+e.target.value})} min="0" /></Field>
            <Field label="Stock"    half><input type="number" style={inputStyle} value={form.stock}    onChange={e=>setForm({...form,stock:+e.target.value})}    min="0" /></Field>
            <Field label="Min Stock" half><input type="number" style={inputStyle} value={form.minStock} onChange={e=>setForm({...form,minStock:+e.target.value})} min="0" /></Field>
          </div>
          <button type="submit" style={btnSuccess}><Save size={14}/>ADD ITEM</button>
        </form>
      </FormSection>

      <AdminTable
        columns={[
          { key:'itemId',   label:'ID' },
          { key:'name',     label:'Name' },
          { key:'category', label:'Category' },
          { key:'stock',    label:'Stock',   render:(v,row) => `${v} ${row.unit}` },
          { key:'minStock', label:'Min',     render:(v,row) => `${v} ${row.unit}` },
          { key:'unitCost', label:'Cost',    render:(v) => `₹${v}` },
          { key:'supplier', label:'Supplier' },
          { key:'_status',  label:'Status',  render:(_,row) => stockBadge(row) },
        ]}
        rows={rows}
        onDelete={handleDelete}
        emptyMsg="No inventory. Add items above."
      />
    </div>
  );
}

// ── WORKERS ADMIN ────────────────────────────────────────────────
function WorkersPanel() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ workerId:'', name:'', email:'', phone:'', department:'', role:'', shift:'Morning', status:'active', skills:'' });

  const load = useCallback(async () => {
    try { const r = await api.get('/workers'); setRows(r.data.data || []); } catch { toast.error('Failed'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = { ...form, skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean) };
    try { await api.post('/workers', payload); toast.success('Worker added!'); load(); setOpen(false); setForm({ workerId:'', name:'', email:'', phone:'', department:'', role:'', shift:'Morning', status:'active', skills:'' }); }
    catch(err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleDelete = async (row) => {
    try { await api.delete(`/workers/${row.workerId}`); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const statusBadge = (s) => (
    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background: s === 'active' ? `${T.green}22` : `${T.amber}22`, color: s === 'active' ? T.green : T.amber, fontFamily:'Orbitron' }}>{s}</span>
  );

  return (
    <div>
      <FormSection title="ADD WORKER" open={open} toggle={() => setOpen(!open)}>
        <form onSubmit={handleCreate}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="Worker ID *" half><input style={inputStyle} value={form.workerId} onChange={e=>setForm({...form,workerId:e.target.value})} placeholder="W009" required /></Field>
            <Field label="Full Name *"  half><input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></Field>
            <Field label="Email"   half><input type="email" style={inputStyle} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></Field>
            <Field label="Phone"   half><input style={inputStyle} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></Field>
            <Field label="Department" half><input style={inputStyle} value={form.department} onChange={e=>setForm({...form,department:e.target.value})} /></Field>
            <Field label="Role"        half><input style={inputStyle} value={form.role}       onChange={e=>setForm({...form,role:e.target.value})} /></Field>
            <Field label="Shift"   half>
              <select style={inputStyle} value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})}><option>Morning</option><option>Evening</option><option>Night</option></select>
            </Field>
            <Field label="Status"  half>
              <select style={inputStyle} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="on-leave">On Leave</option></select>
            </Field>
            <Field label="Skills (comma-separated)"><input style={inputStyle} value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="CNC, Welding, CAD" /></Field>
          </div>
          <button type="submit" style={btnSuccess}><Save size={14}/>ADD WORKER</button>
        </form>
      </FormSection>

      <AdminTable
        columns={[
          { key:'workerId',   label:'ID' },
          { key:'name',       label:'Name' },
          { key:'department', label:'Dept.' },
          { key:'role',       label:'Role' },
          { key:'shift',      label:'Shift' },
          { key:'status',     label:'Status', render: v => statusBadge(v) },
          { key:'skills',     label:'Skills', render: v => (v || []).slice(0,2).join(', ') },
        ]}
        rows={rows}
        onDelete={handleDelete}
        emptyMsg="No workers. Add one above."
      />
    </div>
  );
}

// ── ALERTS ───────────────────────────────────────────────────────
function AlertsPanel() {
  const [rows, setRows] = useState([]);
  const [machines, setMachines] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type:'warning', title:'', message:'', machineId:'' });

  const load = useCallback(async () => {
    try {
      const [aRes, mRes] = await Promise.all([api.get('/alerts'), api.get('/machines')]);
      setRows(aRes.data.data || []);
      setMachines(mRes.data.data || []);
    } catch { toast.error('Failed'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/alerts', form); toast.success('Alert created!'); load(); setOpen(false); setForm({ type:'warning', title:'', message:'', machineId:'' }); }
    catch(err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (row) => {
    try { await api.delete(`/alerts/${row._id}`); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const typeBadge = (t) => {
    const map = { critical:T.red, warning:T.amber, info:T.accent };
    const c = map[t] || T.dim;
    return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${c}22`, color:c, fontFamily:'Orbitron' }}>{t}</span>;
  };

  return (
    <div>
      <FormSection title="CREATE ALERT" open={open} toggle={() => setOpen(!open)}>
        <form onSubmit={handleCreate}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="Type" half>
              <select style={inputStyle} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                <option value="critical">Critical</option><option value="warning">Warning</option><option value="info">Info</option>
              </select>
            </Field>
            <Field label="Machine (optional)" half>
              <select style={inputStyle} value={form.machineId} onChange={e=>setForm({...form,machineId:e.target.value})}>
                <option value="">No machine</option>
                {machines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Title *"><input style={inputStyle} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></Field>
            <Field label="Message *">
              <textarea style={{...inputStyle, resize:'none'}} rows={2} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required />
            </Field>
          </div>
          <button type="submit" style={btnSuccess}><Save size={14}/>CREATE ALERT</button>
        </form>
      </FormSection>

      <AdminTable
        columns={[
          { key:'type',    label:'Type',    render: v => typeBadge(v) },
          { key:'title',   label:'Title' },
          { key:'message', label:'Message', render: v => <span style={{ fontSize:11, color:T.dim }}>{(v||'').slice(0,60)}{v?.length > 60 ? '…' : ''}</span> },
          { key:'read',    label:'Read',    render: v => v ? <CheckCircle size={14} color={T.green} /> : <Clock size={14} color={T.amber} /> },
          { key:'createdAt', label:'Time', render: v => v ? new Date(v).toLocaleString('en-IN') : '—' },
        ]}
        rows={rows}
        onDelete={handleDelete}
        emptyMsg="No alerts. Create one above."
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function AdminPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab] = useState('machines');

  useEffect(() => {
    if (user && user.role !== 'Admin') { navigate('/'); toast.error('Admin access only'); }
  }, [user, navigate]);

  if (!user || user.role !== 'Admin') return null;

  const panels = {
    users:       <UsersPanel />,
    machines:    <MachinesPanel />,
    production:  <ProductionPanel />,
    maintenance: <MaintenancePanel />,
    inventory:   <InventoryAdminPanel />,
    workers:     <WorkersPanel />,
    alerts:      <AlertsPanel />,
  };

  return (
    <div style={{ color: T.text, fontFamily:'Inter' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Orbitron', fontSize:22, color:T.accent, margin:0, letterSpacing:2 }}>ADMIN PANEL</h1>
          <p style={{ color:T.dim, fontSize:12, marginTop:4 }}>Full CRUD control over all factory data</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:`${T.green}15`, border:`1px solid ${T.green}40`, padding:'8px 14px', borderRadius:8 }}>
          <ShieldCheck size={14} color={T.green} />
          <span style={{ fontFamily:'Orbitron', fontSize:10, color:T.green }}>{user.name} · {user.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'10px 16px', borderRadius:8, cursor:'pointer', fontFamily:'Orbitron', fontSize:10, fontWeight:700,
              letterSpacing:1, display:'flex', alignItems:'center', gap:6, transition:'all 0.2s',
              background: active ? `${T.accent}18` : T.card,
              border: `1px solid ${active ? T.accent : T.border}`,
              color: active ? T.accent : T.dim,
            }}>
              <Icon size={13} />{t.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:12, padding:24, minHeight:400 }}>
        {panels[tab]}
      </div>
    </div>
  );
}
