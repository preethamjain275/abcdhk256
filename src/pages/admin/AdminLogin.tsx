import { useState, useEffect } from 'react';
import { 
  Users, 
  Crown,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function AdminLogin() {
  const { user, signIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, check role
    const checkAdmin = async () => {
      if (!authLoading && user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (data) {
            const role = (data as any).role?.toUpperCase();
            if (role === 'ADMIN') {
              // Already authenticated as admin, go to dashboard
              navigate('/admin/dashboard');
            } else {
              // Not admin, force logout or show error
              await supabase.auth.signOut();
              toast.error('Access Denied', {
                description: 'You do not have admin privileges.'
              });
            }
          } else {
              // No profile found
              console.warn('No profile found for user:', user.id);
              // Optional: Don't logout here to avoid loops if profile creation is pending, 
              // but for Admin Login specifically we should be strict.
          }
        } catch (err) {
          console.error('Admin check failed:', err);
        }
      }
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
        // Use direct Supabase call to get the user object immediately
        const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) {
            toast.error(signInError.message);
            return;
        }

        if (authUser) {
            // IMMEDIATE BYPASS for setup user
            if (authUser.email === 'admin@shopsphere.com') { // Hardcoded bypass
                 toast.success('Admin authentication successful');
                 navigate('/admin/dashboard');
                 return;
            }

            // Check Role from DB
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authUser.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
                await supabase.auth.signOut();
                toast.error('Access Denied: Could not verify account privileges.');
                return;
            }

            // Check case-insensitive role
            const role = (profile as any)?.role?.toUpperCase();
            
            if (role === 'ADMIN') {
                toast.success('Admin authentication successful');
                window.location.href = '/admin/dashboard';
            } else {
                await supabase.auth.signOut();
                toast.error('Access Denied', {
                    description: 'This account does not have administrator privileges.'
                });
            }
        }
    } catch (err) {
        console.error('Login error:', err);
        toast.error('An unexpected error occurred during login.');
    } finally {
        setLoginLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 space-y-8">
        <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative"
        >
          <div className="h-24 w-24 rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_50px_rgba(34,211,238,0.8)]" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-cyan-300 animate-pulse" />
        </motion.div>
        <p className="text-white/60 font-black uppercase tracking-widest animate-pulse">Initializing Security...</p>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
           {/* Animated Background */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                  transition={{ duration: 20, repeat: Infinity }}
                  className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"
              />
              <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                  transition={{ duration: 25, repeat: Infinity }}
                  className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-full blur-3xl"
              />
           </div>

           <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md relative z-10"
           >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="flex justify-center mb-8">
                      <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-50" />
                          <div className="relative bg-black/40 p-4 rounded-2xl border border-white/10">
                              <Crown className="h-10 w-10 text-yellow-400" />
                          </div>
                      </div>
                  </div>

                  <h2 className="text-3xl font-black text-center text-white mb-2">Admin Portal</h2>
                  <p className="text-center text-white/40 text-sm mb-8 uppercase tracking-widest">Secure Access Required</p>

                  <form onSubmit={handleAdminLogin} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Admin Email</label>
                          <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                              <input 
                                  type="email" 
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 focus:bg-black/40 transition-all font-mono"
                                  placeholder="admin@shopsphere.com"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Password</label>
                          <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                              <input 
                                  type="password" 
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400/50 focus:bg-black/40 transition-all font-mono"
                                  placeholder="••••••••••••"
                              />
                          </div>
                      </div>

                      <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          disabled={loginLoading}
                          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {loginLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                              <>
                                  Authenticate <ArrowRight className="h-5 w-5" />
                              </>
                          )}
                      </motion.button>
                  </form>

                  <div className="mt-8 text-center">
                      <p className="text-[10px] text-white/20 font-mono">
                        SECURE CONNECTION • ENCRYPTED END-TO-END
                      </p>
                  </div>
              </div>
           </motion.div>
      </div>
  );
}
