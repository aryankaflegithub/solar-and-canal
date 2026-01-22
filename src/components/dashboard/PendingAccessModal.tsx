import { motion } from 'framer-motion';
import { Clock, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PendingAccessModalProps {
  onSignOut: () => void;
}

export function PendingAccessModal({ onSignOut }: PendingAccessModalProps) {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>
        
        <h2 className="font-display text-2xl font-bold mb-2">Access Pending</h2>
        
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
          <Shield className="w-4 h-4" />
          <span>Awaiting Admin Approval</span>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Your account is currently under review. Please revisit in{' '}
          <span className="text-foreground font-semibold">5 days</span> or contact
          an administrator for faster approval.
        </p>
        
        <div className="space-y-3">
          <div className="glass-card p-4 text-left">
            <p className="text-sm text-muted-foreground mb-1">What happens next?</p>
            <ul className="text-sm space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>An admin will review your request</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>You'll get access once approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Check back in a few days</span>
              </li>
            </ul>
          </div>
          
          <Button
            variant="outline"
            onClick={onSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
