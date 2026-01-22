import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X, Shield, Clock, ArrowLeft, Loader2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Navigate, useNavigate } from 'react-router-dom';

interface PendingUser {
  id: string;
  user_id: string;
  full_name: string | null;
  status: string;
  created_at: string;
  role: string;
}

export default function AdminManagement() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name,
        status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } else {
      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .single();
          return {
            ...profile,
            role: roleData?.role || 'user',
          };
        })
      );
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    setProcessingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update user status');
    } else {
      toast.success(`User ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
    }
    setProcessingId(null);
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    setProcessingId(userId);
    const { error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update user role');
    } else {
      toast.success(`User role updated to ${role}`);
      fetchUsers();
    }
    setProcessingId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');
  const rejectedUsers = users.filter(u => u.status === 'rejected');

  return (
    <div className="min-h-screen bg-background grid-pattern p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center glow-power">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide">User Management</h1>
                <p className="text-sm text-muted-foreground">Approve or reject user access requests</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Users */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-display text-lg font-semibold">Pending Approval ({pendingUsers.length})</h2>
                </div>
                
                {pendingUsers.length === 0 ? (
                  <div className="glass-card p-6 text-center text-muted-foreground">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {pendingUsers.map((pendingUser) => (
                        <motion.div
                          key={pendingUser.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="glass-card p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                              <p className="font-medium">{pendingUser.full_name || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground">
                                Requested {new Date(pendingUser.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateUserStatus(pendingUser.user_id, 'approved')}
                              disabled={processingId === pendingUser.user_id}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              {processingId === pendingUser.user_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateUserStatus(pendingUser.user_id, 'rejected')}
                              disabled={processingId === pendingUser.user_id}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>

              {/* Approved Users */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-display text-lg font-semibold">Approved Users ({approvedUsers.length})</h2>
                </div>
                
                {approvedUsers.length === 0 ? (
                  <div className="glass-card p-6 text-center text-muted-foreground">
                    No approved users
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedUsers.map((approvedUser) => (
                      <div
                        key={approvedUser.id}
                        className="glass-card p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            approvedUser.role === 'admin' ? 'bg-primary/20' : 'bg-emerald-500/20'
                          }`}>
                            {approvedUser.role === 'admin' ? (
                              <Shield className="w-5 h-5 text-primary" />
                            ) : (
                              <Users className="w-5 h-5 text-emerald-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{approvedUser.full_name || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {approvedUser.role} • Approved
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {approvedUser.role !== 'admin' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(approvedUser.user_id, 'admin')}
                              disabled={processingId === approvedUser.user_id}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Make Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(approvedUser.user_id, 'user')}
                              disabled={processingId === approvedUser.user_id}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Remove Admin
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateUserStatus(approvedUser.user_id, 'rejected')}
                            disabled={processingId === approvedUser.user_id}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Rejected Users */}
              {rejectedUsers.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <UserX className="w-5 h-5 text-destructive" />
                    <h2 className="font-display text-lg font-semibold">Rejected Users ({rejectedUsers.length})</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {rejectedUsers.map((rejectedUser) => (
                      <div
                        key={rejectedUser.id}
                        className="glass-card p-4 flex items-center justify-between gap-4 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                            <UserX className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{rejectedUser.full_name || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">Rejected</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserStatus(rejectedUser.user_id, 'approved')}
                          disabled={processingId === rejectedUser.user_id}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
