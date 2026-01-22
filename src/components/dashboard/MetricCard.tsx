import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  variant?: 'power' | 'water' | 'warning' | 'default';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  pulse?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  variant = 'default',
  subtitle,
  trend,
  trendValue,
  pulse = false,
}: MetricCardProps) {
  const variantStyles = {
    power: 'border-primary/30 hover:border-primary/50',
    water: 'border-secondary/30 hover:border-secondary/50',
    warning: 'border-warning/30 hover:border-warning/50',
    default: 'border-border/30 hover:border-border/50',
  };

  const iconStyles = {
    power: 'text-primary',
    water: 'text-secondary',
    warning: 'text-warning',
    default: 'text-muted-foreground',
  };

  const valueStyles = {
    power: 'text-gradient-power',
    water: 'text-gradient-water',
    warning: 'text-warning',
    default: 'text-foreground',
  };

  const glowStyles = {
    power: 'pulse-glow',
    water: 'pulse-glow-water',
    warning: '',
    default: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card p-4 md:p-6 transition-all duration-300 ${variantStyles[variant]} ${pulse ? glowStyles[variant] : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-muted/50 ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${
            trend === 'up' ? 'text-primary' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            {trendValue && <span className="ml-1">{trendValue}</span>}
          </div>
        )}
      </div>
      
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
        {title}
      </p>
      
      <div className="flex items-baseline gap-1">
        <span className={`counter-value text-2xl md:text-3xl font-bold ${valueStyles[variant]}`}>
          {typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
}
