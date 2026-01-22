import { motion } from 'framer-motion';

interface StatusIndicatorProps {
  status: 'active' | 'warning' | 'error' | 'offline';
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusColors = {
    active: 'bg-primary',
    warning: 'bg-warning',
    error: 'bg-destructive',
    offline: 'bg-muted-foreground',
  };

  const statusLabels = {
    active: 'Online',
    warning: 'Warning',
    error: 'Critical',
    offline: 'Offline',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full ${statusColors[status]}`}
          animate={status === 'active' || status === 'warning' ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {(status === 'active' || status === 'warning') && (
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full ${statusColors[status]}`}
            animate={{
              scale: [1, 2],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">{statusLabels[status]}</span>
      </div>
    </div>
  );
}
