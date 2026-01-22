import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveCounterProps {
  value: number;
  decimals?: number;
  className?: string;
}

export function LiveCounter({ value, decimals = 2, className = '' }: LiveCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (Math.abs(displayValue - value) > 0.01) {
      setIsAnimating(true);
      const duration = 300;
      const startValue = displayValue;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3);
        
        setDisplayValue(startValue + (value - startValue) * eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value]);

  const formattedValue = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`counter-value inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={Math.floor(displayValue * 100)}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className={isAnimating ? 'text-primary' : ''}
        >
          {formattedValue}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
