import { motion } from 'framer-motion';
import { Thermometer, Zap } from 'lucide-react';

interface EfficiencyGaugeProps {
  efficiencyDelta: number;
  panelTemp: number;
  waterTemp: number;
  coolingBenefit: number;
}

export function EfficiencyGauge({ 
  efficiencyDelta, 
  panelTemp, 
  waterTemp, 
  coolingBenefit 
}: EfficiencyGaugeProps) {
  const gaugeProgress = Math.min(efficiencyDelta / 15, 1); // Max 15% efficiency gain
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card p-4 md:p-6"
    >
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        Cooling Efficiency Gain
      </h3>
      
      <div className="flex items-center gap-6">
        {/* Gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="188.5"
              strokeDashoffset="47.125" // 75% arc
            />
            {/* Progress arc */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#efficiencyGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="188.5"
              initial={{ strokeDashoffset: 188.5 }}
              animate={{ 
                strokeDashoffset: 188.5 - (gaugeProgress * 141.375) 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(160 84% 39%)" />
                <stop offset="100%" stopColor="hsl(160 84% 50%)" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold text-primary">
              +{efficiencyDelta.toFixed(1)}%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">Efficiency</span>
          </div>
        </div>
        
        {/* Temperature comparison */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Thermometer className="w-4 h-4 text-warning" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Panel Temp</span>
                <span className="font-mono">{panelTemp.toFixed(1)}°C</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-warning"
                  initial={{ width: 0 }}
                  animate={{ width: `${(panelTemp / 80) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Thermometer className="w-4 h-4 text-secondary" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Water Temp</span>
                <span className="font-mono">{waterTemp.toFixed(1)}°C</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-secondary to-secondary-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${(waterTemp / 40) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Cooling Benefit</span>
              <span className="text-sm font-medium text-secondary">
                -{coolingBenefit.toFixed(1)}°C
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
