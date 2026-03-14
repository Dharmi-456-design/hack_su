import React, { useState } from 'react';
import { INVENTORY } from '../data/dummyData';
import { Package, AlertTriangle, TrendingDown, Search, Plus, Download, X, ShoppingCart, Upload } from 'lucide-react';

const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="w-full max-w-lg" style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {children}
    </div>
  </div>
);

const InputGroup = ({ label, type = "text", placeholder, defaultValue, required }) => (
  <div className="mb-4">
    <label className="block font-mono text-xs text-factory-dim mb-1.5 uppercase letter-spacing-1">{label} {required && <span className="text-factory-red">*</span>}</label>
    <input type={type} placeholder={placeholder} defaultValue={defaultValue} required={required}
      className="w-full bg-factory-bg/50 border border-factory-border rounded px-4 py-2.5 text-factory-text font-body text-sm focus:outline-none focus:border-factory-accent transition-colors"
      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
    />
  </div>
);

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [orderingItem, setOrderingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const categories = [...new Set(INVENTORY.map(i => i.category))];
  const filtered = INVENTORY.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.supplier.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || item.category === category;
    return matchSearch && matchCat;
  });

  const lowStock = INVENTORY.filter(i => i.stock <= i.minStock);
  const totalValue = INVENTORY.reduce((s, i) => s + i.stock * i.unitCost, 0);

  const getStockStatus = (item) => {
    const pct = (item.stock / item.maxStock) * 100;
    if (item.stock <= item.minStock) return { label: 'CRITICAL', color: 'text-factory-red', barColor: 'bg-factory-red', badge: 'badge-critical' };
    if (pct < 30) return { label: 'LOW', color: 'text-factory-amber', barColor: 'bg-factory-amber', badge: 'badge-warning' };
    return { label: 'OK', color: 'text-factory-green', barColor: 'bg-factory-green', badge: 'badge-operational' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">INVENTORY AUTOMATION</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Real-time stock tracking with automated low-stock alerts</p>
        </div>
        <button onClick={() => setIsAddingItem(true)} className="btn-primary flex items-center gap-2 hover:-translate-y-1 transition-transform" style={{ boxShadow: '0 4px 15px rgba(0,229,255,0.2)' }}>
          <Plus size={14} /> ADD ITEM
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {[
          { label: 'Total Items', value: INVENTORY.length, color: 'text-factory-accent', sub: 'In inventory' },
          { label: 'Low Stock Alerts', value: lowStock.length, color: 'text-factory-red', sub: 'Need reorder' },
          { label: 'Total Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, color: 'text-factory-green', sub: 'Inventory worth' },
          { label: 'Suppliers', value: new Set(INVENTORY.map(i => i.supplier)).size, color: 'text-factory-amber', sub: 'Active vendors' },
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
              <div key={item.id} className="bg-factory-red/5 border border-factory-red/30 rounded-lg p-3">
                <div className="font-medium text-factory-text text-sm">{item.name}</div>
                <div className="font-mono text-xs text-factory-dim mt-0.5">{item.supplier}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-factory-red">{item.stock} {item.unit}</span>
                  <span className="font-mono text-xs text-factory-dim">Min: {item.minStock}</span>
                </div>
                <button onClick={() => setOrderingItem(item)} className="mt-2 w-full text-xs font-mono py-1.5 border border-factory-red/50 text-factory-red rounded hover:bg-factory-red/20 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all">
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
          <button className="btn-secondary flex items-center gap-2 text-xs"><Download size={12} /> EXPORT</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-factory-border">
                {['ID', 'Name', 'Category', 'Stock', 'Min/Max', 'Stock Level', 'Unit Cost', 'Value', 'Supplier', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-2 font-mono text-xs text-factory-dim tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const s = getStockStatus(item);
                const pct = Math.min(100, (item.stock / item.maxStock) * 100);
                return (
                  <tr key={item.id} className="border-b border-factory-border/30 hover:bg-factory-border/20 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs text-factory-dim">{item.id}</td>
                    <td className="py-3 px-2 font-medium text-factory-text whitespace-nowrap">{item.name}</td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-xs px-2 py-0.5 bg-factory-border rounded text-factory-dim">{item.category}</span>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold">
                      <span className={s.color}>{item.stock} {item.unit}</span>
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-factory-dim">{item.minStock}/{item.maxStock}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 min-w-24">
                        <div className="flex-1 h-1.5 bg-factory-bg rounded overflow-hidden">
                          <div className={`h-full rounded ${s.barColor}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="font-mono text-xs text-factory-dim w-8">{Math.round(pct)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-factory-dim">₹{item.unitCost.toLocaleString()}</td>
                    <td className="py-3 px-2 font-mono text-xs text-factory-text">₹{(item.stock * item.unitCost).toLocaleString()}</td>
                    <td className="py-3 px-2 text-xs text-factory-dim">{item.supplier}</td>
                    <td className="py-3 px-2"><span className={s.badge}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place Order Modal */}
      {orderingItem && (
        <ModalOverlay onClose={() => setOrderingItem(null)}>
          <div className="bg-factory-panel border border-factory-accent/30 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-factory-accent to-factory-green"></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart size={18} className="text-factory-accent" />
                    <h2 className="font-display text-xl font-bold text-factory-text">PLACE ORDER</h2>
                  </div>
                  <p className="font-mono text-xs text-factory-dim uppercase">{orderingItem.id} · {orderingItem.category}</p>
                </div>
                <button onClick={() => setOrderingItem(null)} className="text-factory-dim hover:text-factory-red transition-colors auto-blur">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={e => { e.preventDefault(); setOrderingItem(null); alert('Order placed successfully!'); }}>
                <div className="grid grid-cols-2 gap-x-4">
                  <InputGroup label="Orderer Name" placeholder="Full Name" required />
                  <InputGroup label="Phone Number" type="tel" placeholder="+91 90000 00000" required pattern="[+0-9\s\-]+" />
                </div>
                
                <div className="mb-4 bg-factory-bg/40 border border-factory-border/50 rounded-lg p-3">
                  <div className="font-mono text-[10px] text-factory-dim mb-2 uppercase">Order Details</div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-body text-sm text-factory-text font-medium">{orderingItem.name}</span>
                    <span className="font-mono text-xs text-factory-accent">{orderingItem.stock} {orderingItem.unit} in stock</span>
                  </div>
                  <div className="font-mono text-xs text-factory-dim">Supplier: <span className="text-factory-text">{orderingItem.supplier}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                  <InputGroup label={`Quantity to Order (${orderingItem.unit})`} type="number" defaultValue={orderingItem.maxStock - orderingItem.stock} required />
                  <InputGroup label="Expected Delivery" type="date" required />
                </div>

                <div className="mb-6">
                  <label className="block font-mono text-xs text-factory-dim mb-1.5 uppercase tracking-wide">Additional Notes</label>
                  <textarea rows="2" className="w-full bg-factory-bg/50 border border-factory-border rounded px-4 py-2.5 text-factory-text font-body text-sm focus:outline-none focus:border-factory-accent transition-colors resize-none"></textarea>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setOrderingItem(null)} className="flex-1 py-2.5 rounded font-mono text-xs font-bold text-factory-dim border border-factory-border hover:bg-factory-border/30 transition-colors">CANCEL</button>
                  <button type="submit" className="flex-1 py-2.5 rounded font-mono text-xs font-bold bg-factory-accent/10 text-factory-accent border border-factory-accent/50 hover:bg-factory-accent hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all">CONFIRM ORDER</button>
                </div>
              </form>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Add Item Modal */}
      {isAddingItem && (
        <ModalOverlay onClose={() => setIsAddingItem(false)}>
          <div className="bg-factory-panel border border-factory-green/30 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-factory-green to-factory-accent"></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={18} className="text-factory-green" />
                    <h2 className="font-display text-xl font-bold text-factory-text">ADD NEW INVENTORY</h2>
                  </div>
                  <p className="font-mono text-xs text-factory-dim uppercase">Register new material, tool, or spare part</p>
                </div>
                <button onClick={() => setIsAddingItem(false)} className="text-factory-dim hover:text-factory-red transition-colors auto-blur">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={e => { e.preventDefault(); setIsAddingItem(false); alert('Item added successfully!'); }}>
                <div className="grid grid-cols-2 gap-x-4">
                  <InputGroup label="Item Name" placeholder="e.g. Copper Wire Coils" required />
                  <div className="mb-4">
                    <label className="block font-mono text-xs text-factory-dim mb-1.5 uppercase letter-spacing-1">Category <span className="text-factory-red">*</span></label>
                    <select className="w-full bg-factory-bg/50 border border-factory-border rounded px-4 py-2.5 text-factory-text font-body text-sm focus:outline-none focus:border-factory-green transition-colors" required>
                      <option value="">Select Category...</option>
                      <option value="Raw Material">Raw Material</option>
                      <option value="Tool">Tools</option>
                      <option value="Spare Part">Spare Parts</option>
                      <option value="Consumable">Consumables</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                  <InputGroup label="Supplier Name" placeholder="Vendor Company" required />
                  <InputGroup label="Supplier Phone" type="tel" placeholder="+91 90000 00000" required />
                </div>

                <div className="grid grid-cols-4 gap-x-4 border-t border-factory-border/30 pt-4 mt-2">
                  <InputGroup label="Initial Stock" type="number" placeholder="0" required />
                  <InputGroup label="Min Stock" type="number" placeholder="0" required />
                  <InputGroup label="Max Stock" type="number" placeholder="0" required />
                  <InputGroup label="Unit Cost (₹)" type="number" placeholder="0" required />
                </div>

                <div className="mb-6">
                  <label className="block font-mono text-xs text-factory-dim mb-1.5 uppercase tracking-wide">Upload Item Image (Optional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-factory-border border-dashed rounded-lg cursor-pointer bg-factory-bg/30 hover:bg-factory-bg/60 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={20} className="text-factory-dim mb-2" />
                      <p className="font-body text-xs text-factory-dim"><span className="font-semibold text-factory-green">Click to upload</span> or drag and drop</p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 py-2.5 rounded font-mono text-xs font-bold text-factory-dim border border-factory-border hover:bg-factory-border/30 transition-colors">CANCEL</button>
                  <button type="submit" className="flex-1 py-2.5 rounded font-mono text-xs font-bold bg-factory-green/10 text-factory-green border border-factory-green/50 hover:bg-factory-green hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">ADD NEW ITEM</button>
                </div>
              </form>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
