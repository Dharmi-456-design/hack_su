import { useState, useEffect, useRef } from 'react';

const genTime = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function useLivestreamData(initialData, config, passedIntervalMs, passedMaxLength) {
  const intervalMs = 2000;
  const maxLength = passedMaxLength || 10;
  const configRef = useRef(config);

  const [data, setData] = useState(() => {
    const base = initialData || [];
    let now = new Date();
    // Add timeLabel property based on intervals if it doesn't already have one
    return base.map((item, i) => {
      const d = new Date(now.getTime() - (base.length - 1 - i) * intervalMs);
      return {
        ...item,
        timeLabel: genTime(d),
      };
    }).slice(-maxLength);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        
        // Use the very last item as a foundation
        const lastItem = prev[prev.length - 1];
        const newItem = { ...lastItem, timeLabel: genTime(new Date()) };
        
        const currentConfig = configRef.current;
        // Randomly adjust specified config keys
        Object.keys(currentConfig).forEach(key => {
          const { min, max, variation, isInt } = currentConfig[key];
          // Determine the random walk change
          const offset = (Math.random() * variation * 2) - variation;
          let nextVal = (newItem[key] || min) + offset;
          
          if (nextVal < min) nextVal = min + Math.abs(offset);
          if (nextVal > max) nextVal = max - Math.abs(offset);
          
          // Optionally floor/round integers
          if (isInt) {
            newItem[key] = Math.round(nextVal);
          } else {
            newItem[key] = parseFloat(nextVal.toFixed(2));
          }
        });

        const nextData = [...prev, newItem];
        if (nextData.length > maxLength) nextData.shift();
        return nextData;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  return data;
}
