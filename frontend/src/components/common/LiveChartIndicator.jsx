import React from 'react';
import { useLive } from '../../context/LiveDataContext';

export default function LiveChartIndicator() {
  const { simulationMode } = useLive();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <div className="live-indicator">
        ● {simulationMode ? 'SIMULATED DATA' : 'LIVE DATA'}
      </div>
    </div>
  );
}
