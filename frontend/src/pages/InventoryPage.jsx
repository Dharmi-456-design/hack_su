import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Package, AlertTriangle, Search, Plus, Download, X, ShoppingCart, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(2,6,23,0.85)', backdropFilter:'blur(8px)' }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="w-full max-w-lg">
      {children}
    </div>
  </div>
);

function Field({ label, required, children }) {
  return (
    <div className="mb-4">
      <label className="block font-mono text-xs text-factory-dim mb-1.5 uppercase">{label} {required && <span className="text-factory-red">*</span>}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-factory-bg/50 border border-factory-border rounded px-4 py-2.5 text-factory-text font-body text-sm focus:outline-none focus:border-factory-accent transition-colors";

export default function InventoryPage() {
  const { data: inventory, loading, reload, create: createItem, remove: deleteItem } = useApi('/inventory');
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [orderingItem, setOrderingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [form, setForm] = useState({
    itemId:'', name:'', category:'Raw Material', unit:'kg',
    stock:0, minStock:0, maxStock:1000, unitCost:0, supplier:''
  });

  const categories = [...new Set(inventory.map(i => i.category))];
  const filtered = inventory.filter(item => {
    const matchSearch = (item.name || '').toLowerCase().includes(search.toLowerCase())
      || (item.supplier || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || item.category === category;
    return matchSearch && matchCat;
  });

  const lowStock   = inventory.filter(i => i.stock <= i.minStock);
  const totalValue = inventory.reduce((s, i) => s + (i.stock * i.unitCost), 0);

  const getStockStatus = (item) => {
    const pct = (item.stock / (item.maxStock || 1)) * 100;
    if (item.stock <= item.minStock) return { label:'CRITICAL', color:'text-factory-red',   barColor:'bg-factory-red',   badge:'badge-critical' };
    if (pct < 30)                    return { label:'LOW',      color:'text-factory-amber', barColor:'bg-factory-amber', badge:'badge-warning' };
    return                                  { label:'OK',       color:'text-factory-green', barColor:'bg-factory-green', badge:'badge-operational' };
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!form.itemId || !form.name) return toast.error('Item ID and Name required');
    await createItem(form);
    setIsAddingItem(false);
    setForm({ itemId:'', name:'', category:'Raw Material', unit:'kg', stock:0, minStock:0, maxStock:1000, unitCost:0, supplier:'' });
  };

  const handleUpdateStock = async (item, delta) => {
    try {
      const newStock = Math.max(0, item.stock + delta);
      await api.put(`/inventory/${item.itemId}`, { stock: newStock });
      toast.success(`Stock updated to ${newStock}`);
      reload();
    } catch { toast.error('Failed to update stock'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">INVENTORY AUTOMATION</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Real-time stock tracking with automated low-stock alerts</p>
        </div>
        <button onClick={() => setIsAddingItem(true)} className="btn-primary flex items-center gap-2 hover:-translate-y-1 transition-transform">
          <Plus size={14} /> ADD ITEM
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label:'Total Items',     value: inventory.length,    color:'text-factory-accent', sub:'In inventory' },
          { label:'Low Stock',       value: lowStock.length,     color:'text-factory-red',    sub:'Need reorder' },
          { label:'Total Value',     value: `₹${(totalValue/100000).toFixed(1)}L`, color:'text-factory-green', sub:'Inventory worth' },
          { label:'Suppliers',       value: new Set(inventory.map(i => i.supplier).filter(Boolean)).size, color:'text-factory-amber', sub:'Active vendors' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="factory-card text-center">
            <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
            <div className="font-body text-sm font-medium text-factory-text mt-1">{label}</div>
            <div className="font-mono text-xs text-factory-dim">{sub}</div>
          </div>
        ))}
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="factory-card glow-red animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-factory-red" />
            <div className="section-title text-factory-red">LOW STOCK ALERTS — IMMEDIATE ACTION REQUIRED</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lowStock.map(item => (
              <div key={item._id || item.itemId} className="bg-factory-red/5 border border-factory-red/30 rounded-lg p-3">
                <div className="font-medium text-factory-text text-sm">{item.name}</div>
                <div className="font-mono text-xs text-factory-dim mt-0.5">{item.supplier}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-factory-red">{item.stock} {item.unit}</span>
                  <span className="font-mono text-xs text-factory-dim">Min: {item.minStock}</span>
                </div>
                <button onClick={() => setOrderingItem(item)} className="mt-2 w-full text-xs font-mono py-1.5 border border-factory-red/50 text-factory-red rounded hover:bg-factory-red/20 transition-all">
                  PLACE ORDER
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 animate-fade-up stagger-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-factory-dim" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder="Search inventory..." />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field w-44">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Inventory table */}
      <div className="factory-card animate-fade-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">STOCK LEVELS</div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-factory-dim font-mono animate-pulse">Loading inventory data...</div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 text-factory-dim font-mono">No inventory items. Click ADD ITEM to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  {['ID','Name','Category','Stock','Min/Max','Level','Unit Cost','Value','Supplier','Actions','Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const s   = getStockStatus(item);
                  const pct = Math.min(100, (item.stock / (item.maxStock || 1)) * 100);
                  return (
                    <tr key={item._id || item.itemId}>
                      <td>{item.itemId}</td>
                      <td className="font-medium text-factory-text whitespace-nowrap">{item.name}</td>
                      <td><span className="font-mono text-xs px-2 py-0.5 bg-factory-border rounded text-factory-dim">{item.category}</span></td>
                      <td className="font-mono font-bold"><span className={s.color}>{item.stock} {item.unit}</span></td>
                      <td>{item.minStock}/{item.maxStock}</td>
                      <td>
                        <div className="flex items-center gap-2 min-w-24">
                          <div className="flex-1 h-1.5 bg-factory-bg rounded overflow-hidden">
                            <div className={`h-full rounded ${s.barColor}`} style={{ width:`${pct}%` }} />
                          </div>
                          <span className="font-mono text-xs text-factory-dim w-8">{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td>₹{(item.unitCost||0).toLocaleString()}</td>
                      <td className="text-factory-text">₹{(item.stock * (item.unitCost||0)).toLocaleString()}</td>
                      <td>{item.supplier}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdateStock(item, 10)} className="text-xs px-2 py-1 bg-factory-green/10 border border-factory-green/30 text-factory-green rounded hover:bg-factory-green/20 font-mono">+10</button>
                          <button onClick={() => handleUpdateStock(item, -10)} className="text-xs px-2 py-1 bg-factory-red/10 border border-factory-red/30 text-factory-red rounded hover:bg-factory-red/20 font-mono">-10</button>
                        </div>
                      </td>
                      <td><span className={s.badge}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Place Order Modal */}
      {orderingItem && (
        <ModalOverlay onClose={() => setOrderingItem(null)}>
          <div className="bg-factory-panel border border-factory-accent/30 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-factory-accent to-factory-green" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1"><ShoppingCart size={18} className="text-factory-accent" /><h2 className="font-display text-xl font-bold text-factory-text">PLACE ORDER</h2></div>
                  <p className="font-mono text-xs text-factory-dim uppercase">{orderingItem.itemId} · {orderingItem.category}</p>
                </div>
                <button onClick={() => setOrderingItem(null)} className="text-factory-dim hover:text-factory-red transition-colors"><X size={20} /></button>
              </div>
              <div className="mb-4 bg-factory-bg/40 border border-factory-border/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-body text-sm text-factory-text font-medium">{orderingItem.name}</span>
                  <span className="font-mono text-xs text-factory-accent">{orderingItem.stock} {orderingItem.unit} in stock</span>
                </div>
                <div className="font-mono text-xs text-factory-dim">Supplier: <span className="text-factory-text">{orderingItem.supplier}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setOrderingItem(null)} className="flex-1 py-2.5 rounded font-mono text-xs font-bold text-factory-dim border border-factory-border hover:bg-factory-border/30 transition-colors">CANCEL</button>
                <button onClick={() => { toast.success('Order placed!'); setOrderingItem(null); }} className="flex-1 py-2.5 rounded font-mono text-xs font-bold bg-factory-accent/10 text-factory-accent border border-factory-accent/50 hover:bg-factory-accent hover:text-black transition-all">CONFIRM ORDER</button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Add Item Modal */}
      {isAddingItem && (
        <ModalOverlay onClose={() => setIsAddingItem(false)}>
          <div className="bg-factory-panel border border-factory-green/30 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-factory-green to-factory-accent" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1"><Package size={18} className="text-factory-green" /><h2 className="font-display text-xl font-bold text-factory-text">ADD INVENTORY ITEM</h2></div>
                </div>
                <button onClick={() => setIsAddingItem(false)} className="text-factory-dim hover:text-factory-red transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddItem}>
                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="Item ID" required><input value={form.itemId} onChange={e => setForm({...form,itemId:e.target.value})} className={inputCls} placeholder="INV001" required /></Field>
                  <Field label="Item Name" required><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className={inputCls} placeholder="Steel Rods" required /></Field>
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="Category">
                    <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className={inputCls}>
                      {['Raw Material','Consumable','Tool','Spare Part','Finished Good','Safety'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Unit"><input value={form.unit} onChange={e => setForm({...form,unit:e.target.value})} className={inputCls} placeholder="kg" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="Supplier"><input value={form.supplier} onChange={e => setForm({...form,supplier:e.target.value})} className={inputCls} placeholder="Supplier name" /></Field>
                  <Field label="Unit Cost (₹)"><input type="number" value={form.unitCost} onChange={e => setForm({...form,unitCost:+e.target.value})} className={inputCls} min="0" /></Field>
                </div>
                <div className="grid grid-cols-3 gap-x-4">
                  <Field label="Initial Stock"><input type="number" value={form.stock} onChange={e => setForm({...form,stock:+e.target.value})} className={inputCls} min="0" /></Field>
                  <Field label="Min Stock"><input type="number" value={form.minStock} onChange={e => setForm({...form,minStock:+e.target.value})} className={inputCls} min="0" /></Field>
                  <Field label="Max Stock"><input type="number" value={form.maxStock} onChange={e => setForm({...form,maxStock:+e.target.value})} className={inputCls} min="0" /></Field>
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 py-2.5 rounded font-mono text-xs font-bold text-factory-dim border border-factory-border hover:bg-factory-border/30 transition-colors">CANCEL</button>
                  <button type="submit" className="flex-1 py-2.5 rounded font-mono text-xs font-bold bg-factory-green/10 text-factory-green border border-factory-green/50 hover:bg-factory-green hover:text-black transition-all">ADD ITEM</button>
                </div>
              </form>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
