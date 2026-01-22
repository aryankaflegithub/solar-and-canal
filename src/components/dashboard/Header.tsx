import { motion } from 'framer-motion';
import { Sun, User, LogOut, Shield, Menu, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { StatusIndicator } from './StatusIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card px-4 md:px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center glow-power">
            <Sun className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-lg md:text-xl font-bold tracking-wider">
            JAL <span className="text-gradient-power">SHAKTI</span>
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase">
            Canal Energy Command Center
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <StatusIndicator status="active" label="System Status" />
        <StatusIndicator status="active" label="Grid Connection" />
        <StatusIndicator status="warning" label="Maintenance" />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span>NPT</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <User className="w-5 h-5" />
              {isAdmin && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.email}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {isAdmin ? 'Administrator' : 'Viewer'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
