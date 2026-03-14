import { useState, useEffect, useRef } from 'react';

export function useLiveEntities(initialEntities, config, passedIntervalMs) {
  const intervalMs = 2000;
  const configRef = useRef(config);
  const [entities, setEntities] = useState(initialEntities);

  useEffect(() => {
    const interval = setInterval(() => {
      setEntities(prev => prev.map(entity => {
        const currentConfig = configRef.current;
        const newEntity = { ...entity };
        Object.keys(currentConfig).forEach(key => {
          const { min, max, variation, isInt } = currentConfig[key];
          const offset = (Math.random() * variation * 2) - variation;
          let nextVal = (newEntity[key] || min) + offset;
          
          if (nextVal < min) nextVal = min + Math.abs(offset);
          if (nextVal > max) nextVal = max - Math.abs(offset);
          
          if (isInt) {
            newEntity[key] = Math.round(nextVal);
          } else {
            newEntity[key] = parseFloat(nextVal.toFixed(2));
          }
        });
        return newEntity;
      }));
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  return entities;
}
