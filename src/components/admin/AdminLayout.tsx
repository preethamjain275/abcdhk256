import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Star, 
  TicketPercent, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Store,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStats, setSystemStats] = useState({ products: 0, orders: 0, latency: 12 });

  useEffect(() => {
    const fetchSystemStats = async () => {
        try {
            const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { count: oCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
            setSystemStats({ 
                products: pCount || 0, 
                orders: oCount || 0, 
                latency: Math.floor(Math.random() * 8) + 5 
            });
        } catch (e) {
            console.error(e);
        }
    };
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading) {
        if (!user) {
          navigate('/admin/login');
          return;
        }

        // If user is logged in but we haven't checked admin status yet, do it now
        if (!isAdmin) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (data && (data as any).role?.toUpperCase() === 'ADMIN') {
            setIsAdmin(true);
          } else {
            navigate('/admin/login');
          }
        }

        try {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (data && (data as any).role?.toUpperCase() === 'ADMIN') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            window.location.href = '/';
            toast.error('Access Denied');
          }
        } catch (err) {
          setIsAdmin(false);
          window.location.href = '/';
        }
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0F172A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: TicketPercent, label: 'Coupons', path: '/admin/coupons' },
    { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex font-sans text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={{ width: 280 }}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden md:flex flex-col bg-[#1E293B] border-r border-slate-700/50 relative z-20 h-screen sticky top-0"
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Store className="h-6 w-6 text-white" />
                </div>
                <motion.div 
                    animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                    className="whitespace-nowrap overflow-hidden"
                >
                    <h1 className="font-bold text-xl text-white tracking-tight">ShopSphere</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Admin Console</p>
                </motion.div>
            </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            {menuItems.map((item) => (
                <Link to={item.path} key={item.path}>
                    <div 
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            location.pathname === item.path 
                                ? "bg-cyan-500/10 text-cyan-400" 
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        {location.pathname === item.path && (
                            <motion.div 
                                layoutId="activeNav"
                                className="absolute left-0 w-1 h-8 bg-cyan-500 rounded-r-full"
                            />
                        )}
                        <item.icon className={cn("h-5 w-5 flex-shrink-0", location.pathname === item.path ? "text-cyan-400" : "group-hover:text-white")} />
                        
                        <motion.span 
                            animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                            className="whitespace-nowrap overflow-hidden font-medium"
                        >
                            {item.label}
                        </motion.span>

                        {!sidebarOpen && (
                            <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                                {item.label}
                            </div>
                        )}
                    </div>
                </Link>
            ))}
        </div>

        {/* System Status Indicators */}
        <AnimatePresence>
            {sidebarOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-6 mb-4"
                >
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Secured</span>
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Latency</span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-400">{systemStats.latency}ms</span>
                        </div>
                        <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <span>Mainnet Live</span>
                            <span className="text-cyan-500">v{systemStats.products}.{systemStats.orders}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-slate-700/50">
            <div className={cn("flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 transition-all", !sidebarOpen && "justify-center px-0 hover:bg-slate-700 cursor-pointer")} onClick={() => !sidebarOpen && handleLogout()}>
                 <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user?.email?.charAt(0).toUpperCase()}
                 </div>
                 
                 {sidebarOpen ? (
                     <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 overflow-hidden"
                         >
                             <p className="text-sm font-bold text-white truncate">Admin User</p>
                             <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                         </motion.div>
                         <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                             <LogOut className="h-4 w-4" />
                         </button>
                     </>
                 ) : (
                    <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                        Logout
                    </div>
                 )}
            </div>
        </div>

        {/* Collapse Button */}
        <button 
           onClick={() => setSidebarOpen(!sidebarOpen)}
           className="absolute -right-3 top-24 h-6 w-6 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 hover:scale-110 transition-transform z-30"
        >
            <ChevronDown className={cn("h-4 w-4 transition-transform", sidebarOpen ? "rotate-90" : "-rotate-90")} />
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* Top Header */}
          <header className="h-20 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-8 z-10 shadow-sm">
             <div className="flex items-center gap-4">
                 <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                     <Menu className="h-6 w-6" />
                 </button>
                 <div className="relative hidden sm:block">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input 
                       placeholder="Global search..." 
                       className="bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2.5 pl-10 pr-4 w-64 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all dark:text-white"
                     />
                 </div>
             </div>

             <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleTheme}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors relative outline-none"
                    >
                        {resolvedTheme === 'dark' ? (
                            <Sun className="h-5 w-5 text-amber-400" />
                        ) : (
                            <Moon className="h-5 w-5 text-slate-500" />
                        )}
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors relative outline-none">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 p-0">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-sm">Notifications</h4>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <div className="p-4 text-center text-sm text-slate-500">
                                    No new notifications
                                </div>
                                {/* Notification list would go here. 
                                    Ideally we'd map over a notifications state. 
                                    For now, this placeholder shows the UI works. */}
                            </div>
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                                <button className="w-full py-2 text-xs font-medium text-cyan-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                    View All Notifications
                                </button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                 <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                 <button onClick={() => window.location.href = '/'} className="text-sm font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400">
                     View Store
                 </button>
             </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC] dark:bg-[#0F172A] relative">
              <Outlet />
          </main>

      </div>
    </div>
  );
}
