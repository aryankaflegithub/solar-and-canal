import { useState } from 'react';
import { motion } from 'framer-motion';
import { Power, Droplets, Wind, RefreshCw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ControlPanelProps {
  isAdmin: boolean;
  onCommand: (command: string, params?: Record<string, unknown>) => void;
}

export function ControlPanel({ isAdmin, onCommand }: ControlPanelProps) {
  const [coolingActive, setCoolingActive] = useState(false);
  const [cleaningActive, setCleaningActive] = useState(false);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const executeCommand = async (command: string, toggle?: boolean) => {
    if (!isAdmin) {
      toast.error('Admin access required for manual overrides');
      return;
    }

    setIsExecuting(command);
    
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onCommand(command, { toggle });
    
    if (command === 'cooling_spray') {
      setCoolingActive(toggle ?? !coolingActive);
      toast.success(`Cooling spray ${toggle ? 'activated' : 'deactivated'}`);
    } else if (command === 'cleaning_cycle') {
      setCleaningActive(true);
      toast.success('Cleaning cycle initiated');
      setTimeout(() => setCleaningActive(false), 5000);
    }
    
    setIsExecuting(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Power className="w-4 h-4" />
          Manual Override Controls
        </h3>
        {!isAdmin && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            Admin Only
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Cooling Spray Control */}
        <div className={`flex items-center justify-between p-3 rounded-lg bg-muted/30 ${!isAdmin ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${coolingActive ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Cooling Spray</p>
              <p className="text-xs text-muted-foreground">Activate water cooling system</p>
            </div>
          </div>
          <Switch
            checked={coolingActive}
            onCheckedChange={(checked) => executeCommand('cooling_spray', checked)}
            disabled={!isAdmin || isExecuting === 'cooling_spray'}
          />
        </div>

        {/* Cleaning Cycle */}
        <div className={`flex items-center justify-between p-3 rounded-lg bg-muted/30 ${!isAdmin ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${cleaningActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Cleaning Cycle</p>
              <p className="text-xs text-muted-foreground">Initiate panel cleaning sequence</p>
            </div>
          </div>
          <Button
            size="sm"
            variant={cleaningActive ? 'default' : 'outline'}
            disabled={!isAdmin || cleaningActive || isExecuting === 'cleaning_cycle'}
            onClick={() => executeCommand('cleaning_cycle')}
            className="h-8"
          >
            {cleaningActive ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Running
              </>
            ) : (
              'Start'
            )}
          </Button>
        </div>

        {/* System Reset */}
        <div className={`flex items-center justify-between p-3 rounded-lg bg-muted/30 ${!isAdmin ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">System Reset</p>
              <p className="text-xs text-muted-foreground">Restart telemetry collection</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={!isAdmin || isExecuting === 'system_reset'}
            onClick={() => {
              executeCommand('system_reset');
              toast.success('Telemetry system reset initiated');
            }}
            className="h-8"
          >
            Reset
          </Button>
        </div>
      </div>

      {!isAdmin && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Contact system administrator for manual override access
        </p>
      )}
    </motion.div>
  );
}
