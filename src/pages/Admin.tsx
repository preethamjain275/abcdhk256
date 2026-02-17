import { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  Search,
  DollarSign,
  Image,
  Zap,
  Activity,
  ShieldAlert,
  Sparkles,
  Rocket,
  Crown,
  Lock,
  Mail,
  ArrowRight,
  LogOut,
  Store,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/currency';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Admin() {
  const { user, signIn, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'reviews' | 'banners'>('stats');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    deliveredOrders: 0
  });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading) {
        if (!user) {
          // Don't redirect, just stay here to show login form
          setIsAdmin(null);
          return;
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (data) {
            // Check for admin role (case-insensitive)
            const role = (data as any).role?.toUpperCase();
            if (role === 'ADMIN') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              if (!error) toast.error('🚫 Access Denied - Admin Only', {
                  description: 'You need admin privileges to access this area',
                  style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }
              });
              navigate('/');
            }
          } else {
            setIsAdmin(false);
            navigate('/');
          }
        } catch (err) {
          console.error('Admin check failed:', err);
          setIsAdmin(false);
          navigate('/');
        }
      }
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [activeTab, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const { data: oData } = await (supabase.from('orders').select('total, status') as any);
        const { count: uCount } = await (supabase.from('profiles').select('*', { count: 'exact', head: true }) as any);
        
        const rev = oData?.reduce((acc: number, curr: any) => acc + Number(curr.total || 0), 0) || 0;
        setStats({
          totalRevenue: rev,
          totalCustomers: uCount || 0,
          totalOrders: oData?.length || 0,
          deliveredOrders: oData?.filter((o: any) => o.status === 'delivered').length || 0
        });
      } else if (activeTab === 'products') {
        const { data } = await (supabase.from('products').select('*, product_media_mapping(*, media_assets(*))').order('created_at', { ascending: false }).limit(50) as any);
        setProducts(data || []);
      } else if (activeTab === 'orders') {
        const { data } = await (supabase.from('orders').select('*').order('created_at', { ascending: false }) as any);
        setOrders(data || []);
      } else if (activeTab === 'reviews') {
        const { data } = await (supabase.from('reviews').select('*, product:products(name)').order('created_at', { ascending: false }) as any);
        setReviews(data || []);
      } else if (activeTab === 'banners') {
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        setBanners(data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
        const { error } = await signIn(email, password);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Admin authentication successful');
            // The useEffect will catch the user update and run checkAdmin
        }
    } catch (err) {
        toast.error('Login failed');
    } finally {
        setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
      await signOut();
      navigate('/admin'); // Stay on admin login page
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
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg font-black uppercase tracking-[0.5em] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Initializing Admin Portal
        </motion.p>
      </div>
    );
  }

  // Show customized Admin Login if not logged in
  if (!user) {
      return (
          <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
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

  // If user is logged in but admin check is still running (null), show loading
  if (isAdmin === null) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 space-y-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="h-12 w-12 text-cyan-400" />
            </motion.div>
            <p className="text-white/60 font-black uppercase tracking-widest animate-pulse">Verifying Credentials...</p>
        </div>
      ); 
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pt-10 pb-20 relative overflow-hidden font-sans selection:bg-cyan-500/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-3xl"
          />
        </div>

        <div className="container max-w-7xl relative z-10 px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Vibrant Sidebar */}
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-80 space-y-4"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative p-8 rounded-[2.5rem] mb-6 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.5)'
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-pink-500/20"
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Crown className="h-8 w-8 text-yellow-300" />
                    </motion.div>
                    <span className="text-xs font-black uppercase tracking-widest text-yellow-300">Admin Access</span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">
                    COMMAND<br />
                    <span className="bg-gradient-to-r from-cyan-300 via-yellow-300 to-pink-300 bg-clip-text text-transparent">
                      CENTRE
                    </span>
                  </h1>
                </div>
              </motion.div>

              <div className="space-y-2">
                <AdminTab active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={Rocket} label="Dashboard" color="from-cyan-500 to-blue-500" />
                <AdminTab active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={Package} label="Products" color="from-purple-500 to-pink-500" />
                <AdminTab active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={ShoppingCart} label="Orders" color="from-orange-500 to-red-500" />
                <AdminTab active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} icon={Image} label="Banners" color="from-green-500 to-emerald-500" />
                <AdminTab active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={Star} label="Reviews" color="from-yellow-500 to-amber-500" />
              </div>

              <div className="pt-8 space-y-3">
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                  >
                      <Store className="h-4 w-4" /> Go to Store
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-black uppercase tracking-widest"
                  >
                      <LogOut className="h-4 w-4" /> Sign Out
                  </button>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-1 min-h-[85vh] backdrop-blur-xl bg-white/10 rounded-[3rem] p-8 md:p-12 border border-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 w-full h-full flex flex-col">
                <AnimatePresence mode="wait">
                  {loading ? (
                      <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col items-center justify-center space-y-6"
                      >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="h-16 w-16 text-cyan-400" />
                          </motion.div>
                          <span className="text-sm font-black uppercase tracking-widest text-white/60">Loading...</span>
                      </motion.div>
                  ) : (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1"
                    >
                      {activeTab === 'stats' && (
                          <div className="space-y-12">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                  <StatsCard label="Revenue" value={formatPrice(stats.totalRevenue)} icon={DollarSign} gradient="from-emerald-400 to-cyan-400" />
                                  <StatsCard label="Customers" value={stats.totalCustomers} icon={Users} gradient="from-blue-400 to-indigo-400" />
                                  <StatsCard label="Orders" value={stats.totalOrders} icon={Activity} gradient="from-orange-400 to-pink-400" />
                                  <StatsCard label="Delivered" value={stats.deliveredOrders} icon={CheckCircle} gradient="from-purple-400 to-fuchsia-400" />
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-8">
                                  <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="backdrop-blur-xl bg-white/5 p-10 rounded-[2.5rem] border border-white/10 h-[300px] flex items-center justify-center"
                                  >
                                      <div className="text-center">
                                        <TrendingUp className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                                        <p className="text-white/40 font-black text-sm uppercase tracking-widest">Analytics Chart</p>
                                      </div>
                                  </motion.div>
                                  <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="backdrop-blur-xl bg-white/5 p-10 rounded-[2.5rem] border border-white/10 h-[300px] flex items-center justify-center"
                                  >
                                      <div className="text-center">
                                        <Activity className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                                        <p className="text-white/40 font-black text-sm uppercase tracking-widest">Activity Feed</p>
                                      </div>
                                  </motion.div>
                              </div>
                          </div>
                      )}

                      {activeTab === 'products' && (
                          <div className="space-y-8">
                              <div className="flex justify-between items-center">
                                  <h3 className="text-3xl font-black tracking-tighter text-white">Product <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Inventory</span></h3>
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                                  >
                                      <Plus className="h-5 w-5" /> Add Product
                                  </motion.button>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                  {products.map((p, i) => (
                                      <motion.div 
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.05 }}
                                          key={p.id} 
                                          whileHover={{ scale: 1.01, x: 10 }}
                                          className="group backdrop-blur-xl bg-white/5 p-6 rounded-3xl flex items-center gap-6 border border-white/10 hover:border-cyan-400/50 transition-all"
                                      >
                                          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-2 ring-white/10">
                                              <img 
                                                  src={p.product_media_mapping?.find((m: any) => m.is_primary)?.media_assets?.url || p.product_media_mapping?.[0]?.media_assets?.url || p.images?.[0] || 'https://via.placeholder.com/150'} 
                                                  className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                                              />
                                          </div>
                                          <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-[8px] font-black uppercase bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-1 rounded-full">{p.category}</span>
                                                  <span className="text-[8px] font-black text-white/30 truncate">ID: {p.id.slice(0, 12)}</span>
                                              </div>
                                              <h4 className="font-black text-lg text-white">{p.name}</h4>
                                              <p className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-black uppercase text-xs tracking-widest mt-1">{formatPrice(p.price)}</p>
                                          </div>
                                          <div className="flex gap-3">
                                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="h-12 w-12 backdrop-blur-xl bg-blue-500/20 rounded-xl flex items-center justify-center hover:bg-blue-500/40 transition-colors border border-blue-400/30">
                                                <Edit className="h-5 w-5 text-blue-300" />
                                              </motion.button>
                                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="h-12 w-12 backdrop-blur-xl bg-red-500/20 rounded-xl flex items-center justify-center hover:bg-red-500/40 transition-colors border border-red-400/30">
                                                <Trash2 className="h-5 w-5 text-red-300" />
                                              </motion.button>
                                          </div>
                                      </motion.div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {activeTab === 'orders' && (
                          <div className="space-y-8">
                               <div className="flex justify-between items-center">
                                  <h3 className="text-3xl font-black tracking-tighter text-white">Order <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Management</span></h3>
                                  <div className="relative group">
                                      <input 
                                         placeholder="Search orders..." 
                                         className="backdrop-blur-xl bg-white/10 border-white/20 border rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none focus:border-cyan-400/50 transition-colors text-white placeholder:text-white/40"
                                      />
                                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                                  </div>
                              </div>
                              <div className="overflow-x-auto">
                                  <table className="w-full">
                                      <thead>
                                          <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                              <th className="pb-6 text-left">Order ID</th>
                                              <th className="pb-6 text-left">Customer</th>
                                              <th className="pb-6 text-left">Amount</th>
                                              <th className="pb-6 text-left">Status</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/5">
                                          {orders.map((order, i) => (
                                              <motion.tr 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={order.id} 
                                                className="group hover:bg-white/5 transition-colors"
                                              >
                                                  <td className="py-6 font-mono text-xs text-cyan-400">#{order.id.slice(0, 8)}</td>
                                                  <td className="py-6 font-black text-sm text-white">{order.shipping_address?.fullName || 'Guest'}</td>
                                                  <td className="py-6 font-black text-sm text-white">{formatPrice(order.total)}</td>
                                                  <td className="py-6">
                                                     <span className={cn(
                                                         "text-[9px] font-black uppercase px-3 py-1.5 rounded-full",
                                                         order.status === 'delivered' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white animate-pulse'
                                                     )}>
                                                         {order.status}
                                                     </span>
                                                  </td>
                                              </motion.tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
    </div>
  );
}

function AdminTab({ active, onClick, icon: Icon, label, color }: { active: boolean, onClick: () => void, icon: any, label: string, color: string }) {
    return (
        <motion.button 
            onClick={onClick}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 relative overflow-hidden",
                active 
                    ? "text-white shadow-2xl" 
                    : "text-white/50 hover:text-white backdrop-blur-xl bg-white/5 border border-white/10"
            )}
            style={active ? {
              background: `linear-gradient(135deg, ${color.includes('from-') ? color.split(' ')[0].replace('from-', '') : '#667eea'} 0%, ${color.includes('to-') ? color.split(' ')[1].replace('to-', '') : '#764ba2'} 100%)`,
              boxShadow: `0 10px 30px rgba(102, 126, 234, 0.4)`
            } : {}}
        >
            {active && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={cn("h-5 w-5 relative z-10", active ? "animate-pulse" : "")} />
            <span className="relative z-10">{label}</span>
        </motion.button>
    );
}

function StatsCard({ label, value, icon: Icon, gradient }: { label: string, value: string | number, icon: any, gradient: string }) {
    return (
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative backdrop-blur-xl bg-white/10 p-6 rounded-[2rem] border border-white/20 group overflow-hidden"
        >
           <motion.div
             className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
           />
           <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{label}</span>
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </motion.div>
             </div>
             <div className={`text-3xl font-black tracking-tighter bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
               {value}
             </div>
           </div>
        </motion.div>
    );
}
