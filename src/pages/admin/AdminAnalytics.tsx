import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Calendar,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/currency';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch Orders - Only last 90 days for better performance
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const completedOrders = (orders as any[])?.filter(o => o.status !== 'cancelled') || [];
      const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = completedOrders.length;
      
      // Fetch Customers
      const { count: customerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      setStats({
          totalRevenue,
          totalOrders,
          totalCustomers: customerCount || 0,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      });

      // Prepare Chart Data (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0]; // YYYY-MM-DD
      }).reverse();

      const chartData = last7Days.map(date => {
          const daysOrders = completedOrders.filter(o => o.created_at.startsWith(date));
          return {
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              revenue: daysOrders.reduce((sum, o) => sum + (o.total || 0), 0),
              orders: daysOrders.length
          };
      });

      setRevenueData(chartData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into your store's performance.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
              title="Total Revenue" 
              value={formatPrice(stats.totalRevenue)} 
              icon={DollarSign} 
              color="text-emerald-500" 
              bg="bg-emerald-50 dark:bg-emerald-900/20"
          />
          <StatCard 
              title="Total Orders" 
              value={stats.totalOrders} 
              icon={ShoppingBag} 
              color="text-blue-500" 
              bg="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard 
              title="Total Customers" 
              value={stats.totalCustomers} 
              icon={Users} 
              color="text-purple-500" 
              bg="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard 
              title="Avg. Order Value" 
              value={formatPrice(stats.averageOrderValue)} 
              icon={TrendingUp} 
              color="text-amber-500" 
              bg="bg-amber-50 dark:bg-amber-900/20"
          />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Overview</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                  <Calendar className="h-4 w-4" /> Last 7 Days
              </div>
          </div>
          <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                      <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                          dy={10}
                      />
                      <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                          tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                          contentStyle={{ 
                              backgroundColor: '#fff', 
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                          }}
                          formatter={(value: number) => [`$${value}`, 'Revenue']}
                      />
                      <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#06b6d4" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                      />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
