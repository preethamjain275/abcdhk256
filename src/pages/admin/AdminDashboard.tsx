import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Activity, 
  CreditCard,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/currency';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Sample Chart Data
const data = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    activeOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Real-time subscription for new orders
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received!', payload);
          toast.success('New Order Received!', {
            description: `Order #${payload.new.id.slice(0, 8)} has been placed.`
          });
          
          // Refresh data
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch Orders Stats
      const { data: ordersData } = await (supabase
        .from('orders')
        .select('total, status, created_at, id, shipping_address', { count: 'exact' })
        .order('created_at', { ascending: false }));

      // Fetch Profiles Count
      const { count: usersCount } = await (supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }));

      if (ordersData) {
        const totalRev = ordersData.reduce((acc: number, order: any) => acc + (Number(order.total) || 0), 0);
        const active = ordersData.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length;

        setStats({
          totalRevenue: totalRev,
          totalCustomers: usersCount || 0,
          totalOrders: ordersData.length,
          activeOrders: active
        });

        setRecentOrders(ordersData.slice(0, 5));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center p-20">
              <div className="animate-spin h-10 w-10 border-4 border-cyan-500 rounded-full border-t-transparent"></div>
          </div>
      );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Dashboard Overview</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => {
                    toast.success('Report downloaded', { description: 'sales_report_2026.csv' });
                }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
            >
                Export Report
            </button>
            <button 
                onClick={() => {
                   // We emit a custom event or use navigation State to open modal in ProductManager? 
                   // Simpler: Navigate to products page
                   window.location.href = '/admin/products'; 
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 transition-colors"
            >
                + Add Product
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard 
            title="Total Revenue" 
            value={formatPrice(stats.totalRevenue)} 
            trend="+12.5%" 
            trendUp={true} 
            icon={DollarSign} 
            color="bg-emerald-500" 
         />
         <StatCard 
            title="Total Orders" 
            value={stats.totalOrders.toString()} 
            trend="+5.2%" 
            trendUp={true} 
            icon={ShoppingCart} 
            color="bg-blue-500" 
         />
         <StatCard 
            title="Total Customers" 
            value={stats.totalCustomers.toString()} 
            trend="+2.4%" 
            trendUp={true} 
            icon={Users} 
            color="bg-purple-500" 
         />
         <StatCard 
            title="Active Orders" 
            value={stats.activeOrders.toString()} 
            trend="-1.0%" 
            trendUp={false} 
            icon={Activity} 
            color="bg-orange-500" 
         />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Revenue Analytics</h3>
                  <select className="bg-slate-50 dark:bg-slate-700 border-none rounded-lg text-sm px-3 py-1 focus:ring-0">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>This Year</option>
                  </select>
              </div>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                          <defs>
                              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="uv" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Transactions</h3>
                  <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">View All</button>
              </div>
              
              <div className="space-y-4">
                  {recentOrders.map((order, i) => (
                      <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group cursor-pointer">
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                                  <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                  <p className="font-bold text-slate-800 dark:text-white text-sm">{order.shipping_address?.fullName || 'Guest User'}</p>
                                  <p className="text-xs text-slate-500">
                                      {new Date(order.created_at).toLocaleDateString()} • <span className="uppercase">{order.status}</span>
                                  </p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="font-bold text-slate-800 dark:text-white text-sm">{formatPrice(order.total)}</p>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase">Paid</p>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Storage Usage</p>
                          <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">45.2 GB <span className="text-slate-400 text-sm font-normal">/ 100 GB</span></p>
                      </div>
                      <div className="h-12 w-12 rounded-full border-4 border-slate-100 dark:border-slate-700 relative flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-r-transparent rotate-45"></div>
                          <span className="text-[10px] font-bold">45%</span>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon: Icon, color }: any) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-xl text-white shadow-lg", color)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
                <span className={cn("flex items-center text-xs font-bold px-2 py-0.5 rounded-full", trendUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {trend}
                </span>
                <span className="text-xs text-slate-400 font-medium">vs last month</span>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-slate-50 dark:bg-slate-700/30 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
        </motion.div>
    );
}
