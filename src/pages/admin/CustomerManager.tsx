import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Shield, 
  Mail, 
  Calendar,
  Construction,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CustomerManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      if (!silent) toast.success("Customer list updated");
    } catch (error) {
      console.error('Error fetching users:', error);
      if (!silent) toast.error('Failed to load users');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
            console.log('Profile change detected:', payload);
            fetchUsers(true); // Silent update for real-time
            if (payload.eventType === 'INSERT') {
                toast.success('New customer registered!');
            }
        }
      );
    
    channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('Connected to real-time profiles');
        } else {
            console.error('Real-time subscription status:', status);
        }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Customers</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage user accounts.</p>
        </div>
        
        <motion.button
            whileHover={{ scale: 1.05, rotateX: 10, rotateY: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchUsers()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_30px_rgba(6,182,212,0.5)] border-t border-white/20 transition-all font-bold flex items-center gap-2 transform perspective-1000"
        >
            <motion.div
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ repeat: loading ? Infinity : 0, duration: 1, ease: "linear" }}
            >
                {loading ? <Loader2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </motion.div>
            <span>Update List</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or ID..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all dark:text-white"
              />
          </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {loading ? (
             <div className="flex justify-center p-12">
                 <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
             </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredUsers.map((user, i) => (
                            <motion.tr 
                                key={user.id}
                                initial={{ opacity: 0, x: -20, rotateX: -10 }}
                                animate={{ opacity: 1, x: 0, rotateX: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.01, backgroundColor: "rgba(6,182,212,0.05)" }}
                                className="transition-colors group cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                                            {user.email?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{user.full_name || 'No Name'}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                                                <Mail className="h-3 w-3" /> {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1 w-fit shadow-sm border",
                                        user.role === 'ADMIN' 
                                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                                            : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                    )}>
                                        {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                                        {user.role || 'CUSTOMER'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(() => {
                                        const lastSeen = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
                                        // 15 minute window for "Online" status
                                        const isOnline = lastSeen && (new Date().getTime() - lastSeen.getTime()) < 15 * 60 * 1000;
                                        
                                        return (
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1 w-fit shadow-sm border transition-all duration-500",
                                                isOnline 
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                    : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50"
                                            )}>
                                                {isOnline ? (
                                                    <>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                                                        Online Now
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-3 w-3 opacity-50" />
                                                        {user.last_sign_in_at ? "Recently Active" : "Never Logged In"}
                                                    </>
                                                )}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    <div className="flex items-center gap-1 font-medium">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
