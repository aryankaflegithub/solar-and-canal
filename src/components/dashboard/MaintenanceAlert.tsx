import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Wrench, Droplets, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MaintenanceIssue {
  id: string;
  type: 'dust' | 'silt' | 'efficiency' | 'connection';
  severity: 'low' | 'medium' | 'high';
  station: string;
  message: string;
  timestamp: Date;
}

interface MaintenanceAlertProps {
  issues: MaintenanceIssue[];
  onDismiss: (id: string) => void;
  onAction: (id: string, action: string) => void;
  isAdmin: boolean;
}

export function MaintenanceAlert({ issues, onDismiss, onAction, isAdmin }: MaintenanceAlertProps) {
  const getIcon = (type: MaintenanceIssue['type']) => {
    switch (type) {
      case 'dust': return Wind;
      case 'silt': return Droplets;
      default: return Wrench;
    }
  };

  const getSeverityStyles = (severity: MaintenanceIssue['severity']) => {
    switch (severity) {
      case 'high': return 'border-destructive/50 bg-destructive/10';
      case 'medium': return 'border-warning/50 bg-warning/10';
      default: return 'border-muted bg-muted/10';
    }
  };

  if (issues.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        Maintenance Alerts ({issues.length})
      </h3>
      
      <AnimatePresence mode="popLayout">
        {issues.map((issue) => {
          const Icon = getIcon(issue.type);
          
          return (
            <motion.div
              key={issue.id}
              layout
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className={`glass-card p-4 border ${getSeverityStyles(issue.severity)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    issue.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                    issue.severity === 'medium' ? 'bg-warning/20 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{issue.station}</span>
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                        issue.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                        issue.severity === 'medium' ? 'bg-warning/20 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {issue.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => onAction(issue.id, issue.type === 'dust' ? 'clean' : 'inspect')}
                    >
                      {issue.type === 'dust' ? 'Clean' : 'Inspect'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => onDismiss(issue.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
