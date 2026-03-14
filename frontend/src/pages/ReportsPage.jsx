import React, { useState } from 'react';
import { MACHINES, WORKERS, PRODUCTION_DATA, INVENTORY, ANALYTICS } from '../data/dummyData';
import { FileText, Download, Printer, BarChart3, Cpu, Users, Package } from 'lucide-react';

function generateSimplePDF(title, rows, columns) {
  // Simple text-based PDF simulation
  alert(`Generating PDF: ${title}\n\nThis feature requires jsPDF in production.\n\nRows: ${rows.length}\nColumns: ${columns.join(', ')}`);
}

const REPORT_TYPES = [
  {
    id: 'production',
    title: 'Production Report',
    description: 'Daily and weekly production targets vs actual output',
    icon: BarChart3,
    color: 'text-factory-accent',
    bg: 'bg-factory-accent/10',
    border: 'border-factory-accent/30',
  },
  {
    id: 'machine',
    title: 'Machine Performance',
    description: 'Temperature, vibration, efficiency, and maintenance status',
    icon: Cpu,
    color: 'text-factory-green',
    bg: 'bg-factory-green/10',
    border: 'border-factory-green/30',
  },
  {
    id: 'worker',
    title: 'Worker Performance',
    description: 'Productivity, safety scores, and task completion',
    icon: Users,
    color: 'text-factory-amber',
    bg: 'bg-factory-amber/10',
    border: 'border-factory-amber/30',
  },
  {
    id: 'inventory',
    title: 'Inventory Report',
    description: 'Stock levels, low alerts, and total inventory value',
    icon: Package,
    color: 'text-factory-red',
    bg: 'bg-factory-red/10',
    border: 'border-factory-red/30',
  },
];

function ProductionPreview() {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="saas-table">
        <thead>
          <tr>
            {['Date', 'Target', 'Actual', 'Variance', 'Efficiency'].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PRODUCTION_DATA.map(d => (
            <tr key={d.date}>
              <td className="py-2 px-3 text-factory-text">{d.date}</td>
              <td className="py-2 px-3 text-factory-dim">{d.target}</td>
              <td className={`py-2 px-3 font-bold ${d.actual >= d.target ? 'text-factory-green' : 'text-factory-amber'}`}>{d.actual}</td>
              <td className={`py-2 px-3 ${d.actual >= d.target ? 'text-factory-green' : 'text-factory-red'}`}>{d.actual - d.target >= 0 ? '+' : ''}{d.actual - d.target}</td>
              <td className={`py-2 px-3 ${d.efficiency >= 100 ? 'text-factory-green' : 'text-factory-amber'}`}>{d.efficiency}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MachinePreview() {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="saas-table">
        <thead>
          <tr>
            {['Machine', 'Status', 'Temp °C', 'Vibration', 'Efficiency', 'Runtime'].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MACHINES.map(m => (
            <tr key={m.id}>
              <td className="py-2 px-3 text-factory-text">{m.name}</td>
              <td className="py-2 px-3">
                <span className={m.status === 'operational' ? 'badge-operational' : m.status === 'warning' ? 'badge-warning' : m.status === 'critical' ? 'badge-critical' : 'badge-offline'}>
                  {m.status.toUpperCase()}
                </span>
              </td>
              <td className={`py-2 px-3 ${m.temperature > 90 ? 'text-factory-red' : m.temperature > 75 ? 'text-factory-amber' : 'text-factory-green'}`}>{m.temperature}</td>
              <td className={`py-2 px-3 ${m.vibration > 2 ? 'text-factory-red' : m.vibration > 1 ? 'text-factory-amber' : 'text-factory-green'}`}>{m.vibration}</td>
              <td className={`py-2 px-3 ${m.efficiency > 80 ? 'text-factory-green' : m.efficiency > 60 ? 'text-factory-amber' : 'text-factory-red'}`}>{m.efficiency}%</td>
              <td className="py-2 px-3 text-factory-dim">{m.runtime}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('production');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (type) => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(false);
    // In production: use jsPDF to generate actual PDF
    const link = document.createElement('a');
    const csvContent = type === 'production'
      ? 'Date,Target,Actual,Efficiency\n' + PRODUCTION_DATA.map(d => `${d.date},${d.target},${d.actual},${d.efficiency}%`).join('\n')
      : type === 'machine'
      ? 'Machine,Status,Temperature,Vibration,Efficiency\n' + MACHINES.map(m => `${m.name},${m.status},${m.temperature},${m.vibration},${m.efficiency}%`).join('\n')
      : 'Worker,Department,Performance,Safety Score\n' + WORKERS.map(w => `${w.name},${w.department},${w.performance}%,${w.safetyScore}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    link.href = URL.createObjectURL(blob);
    link.download = `smartfactory-${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-slide-in">
        <div>
          <h1 className="page-title">REPORT GENERATION</h1>
          <p className="text-factory-dim font-body text-sm mt-1">Generate and export production, machine, and workforce reports</p>
        </div>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
        {REPORT_TYPES.map(({ id, title, description, icon: Icon, color, bg, border }) => (
          <div key={id} onClick={() => setActiveReport(id)}
            className={`factory-card ${bg} border ${border} cursor-pointer transition-all duration-200 ${activeReport === id ? 'scale-105' : 'hover:scale-102 opacity-70 hover:opacity-100'}`}>
            <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className={`font-medium text-sm ${color}`}>{title}</div>
            <div className="font-mono text-xs text-factory-dim mt-1">{description}</div>
          </div>
        ))}
      </div>

      {/* Report preview */}
      <div className="factory-card animate-fade-up stagger-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-title">REPORT PREVIEW</div>
            <div className="text-sm font-medium text-factory-text mt-1 capitalize">{activeReport.replace('-', ' ')} Report — {new Date().toLocaleDateString('en-IN')}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-xs">
              <Printer size={12} /> PRINT
            </button>
            <button onClick={() => handleGenerate(activeReport)} disabled={generating} className="btn-primary flex items-center gap-2 text-xs">
              {generating ? (
                <><div className="w-3 h-3 border border-factory-bg border-t-transparent rounded-full animate-spin"></div> GENERATING...</>
              ) : (
                <><Download size={12} /> EXPORT CSV</>
              )}
            </button>
          </div>
        </div>

        {/* Report header */}
        <div className="bg-factory-bg border border-factory-border rounded-lg p-4 mb-4 font-mono">
          <div className="text-factory-accent font-bold text-sm">SMARTFACTORY AI — REPORT</div>
          <div className="text-factory-dim text-xs mt-1">Generated: {new Date().toLocaleString('en-IN')} | Shift: Morning | Operator: Rajesh Kumar (Admin)</div>
          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-factory-border">
            <div>
              <div className="text-xs text-factory-dim">MACHINES ACTIVE</div>
              <div className="text-factory-green font-bold">{ANALYTICS.operational}/{ANALYTICS.totalMachines}</div>
            </div>
            <div>
              <div className="text-xs text-factory-dim">TODAY'S PRODUCTION</div>
              <div className="text-factory-accent font-bold">{ANALYTICS.productionToday} / {ANALYTICS.productionTarget}</div>
            </div>
            <div>
              <div className="text-xs text-factory-dim">ACTIVE WORKERS</div>
              <div className="text-factory-amber font-bold">{ANALYTICS.activeWorkers}/{ANALYTICS.totalWorkers}</div>
            </div>
          </div>
        </div>

        {activeReport === 'production' && <ProductionPreview />}
        {activeReport === 'machine' && <MachinePreview />}
        {activeReport === 'worker' && (
          <div className="overflow-x-auto mt-4">
            <table className="saas-table">
              <thead>
                <tr>
                  {['Worker', 'Department', 'Role', 'Performance', 'Tasks Done', 'Safety'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WORKERS.map(w => (
                  <tr key={w.id}>
                    <td className="py-2 px-3 text-factory-text">{w.name}</td>
                    <td className="py-2 px-3 text-factory-dim">{w.department}</td>
                    <td className="py-2 px-3 text-factory-dim">{w.role}</td>
                    <td className={`py-2 px-3 font-bold ${w.performance > 90 ? 'text-factory-green' : 'text-factory-amber'}`}>{w.performance}%</td>
                    <td className="py-2 px-3 text-factory-green">{w.completedTasks}</td>
                    <td className={`py-2 px-3 ${w.safetyScore >= 95 ? 'text-factory-green' : 'text-factory-amber'}`}>{w.safetyScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeReport === 'inventory' && (
          <div className="overflow-x-auto mt-4">
            <table className="saas-table">
              <thead>
                <tr>
                  {['Item', 'Category', 'Stock', 'Min Stock', 'Status', 'Value'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY.map(item => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id}>
                      <td className="py-2 px-3 text-factory-text">{item.name}</td>
                      <td className="py-2 px-3 text-factory-dim">{item.category}</td>
                      <td className={`py-2 px-3 font-bold ${isLow ? 'text-factory-red' : 'text-factory-green'}`}>{item.stock} {item.unit}</td>
                      <td className="py-2 px-3 text-factory-dim">{item.minStock} {item.unit}</td>
                      <td className="py-2 px-3"><span className={isLow ? 'badge-critical' : 'badge-operational'}>{isLow ? 'LOW' : 'OK'}</span></td>
                      <td className="py-2 px-3 text-factory-accent">₹{(item.stock * item.unitCost).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
