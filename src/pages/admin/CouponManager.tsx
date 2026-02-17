import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar,
  TicketPercent,
  CheckCircle,
  XCircle,
  Copy,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase_amount: '0',
      end_date: '',
      usage_limit: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
          // If table doesn't exist, handle gracefully
          if (error.code === '42P01') {
              toast.error('Coupons table not found. Please run admin_expansion.sql');
              setCoupons([]);
              return;
          }
          throw error;
      };
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async () => {
      try {
          const { error } = await supabase
            .from('coupons')
            .insert({
                code: newCoupon.code,
                discount_type: newCoupon.discount_type,
                discount_value: parseFloat(newCoupon.discount_value),
                min_purchase_amount: parseFloat(newCoupon.min_purchase_amount),
                end_date: newCoupon.end_date ? new Date(newCoupon.end_date).toISOString() : null,
                usage_limit: newCoupon.usage_limit ? parseInt(newCoupon.usage_limit) : null
            });

          if (error) throw error;
          
          toast.success('Coupon created successfully');
          fetchCoupons();
          setShowAddModal(false);
          setNewCoupon({
              code: '',
              discount_type: 'percentage',
              discount_value: '',
              min_purchase_amount: '0',
              end_date: '',
              usage_limit: ''
          });
      } catch (error) {
          console.error('Error creating coupon:', error);
          toast.error('Failed to create coupon');
      }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
        setCoupons(coupons.filter(c => c.id !== id));
        toast.success('Coupon deleted');
    } catch (err) {
        toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Coupons & Discounts</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Create promotional codes for your customers.</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create Coupon
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-none text-slate-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle>New Coupon</DialogTitle>
                    <DialogDescription>Create a discount code for your store.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Code</label>
                        <input 
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                            placeholder="e.g. SUMMER2026"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono uppercase"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select 
                                value={newCoupon.discount_type}
                                onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Value</label>
                            <input 
                                type="number"
                                value={newCoupon.discount_value}
                                onChange={(e) => setNewCoupon({...newCoupon, discount_value: e.target.value})}
                                placeholder="e.g. 10"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Min Purchase</label>
                        <input 
                            type="number"
                            value={newCoupon.min_purchase_amount}
                            onChange={(e) => setNewCoupon({...newCoupon, min_purchase_amount: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <button onClick={createCoupon} className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-700">
                        Create Coupon
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
              {coupons.map((coupon) => (
                  <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative group overflow-hidden"
                  >
                      {/* Decorative Circles */}
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-50 dark:bg-[#0F172A]"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-50 dark:bg-[#0F172A]"></div>
                      
                      <div className="flex justify-between items-start mb-4">
                          <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg font-mono font-bold text-slate-800 dark:text-white border-2 border-dashed border-slate-300 dark:border-slate-600">
                              {coupon.code}
                          </div>
                          <button onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              toast.success('Code copied!');
                          }} className="text-slate-400 hover:text-cyan-500">
                              <Copy className="h-4 w-4" />
                          </button>
                      </div>

                      <div className="text-center py-4 border-b-2 border-dashed border-slate-100 dark:border-slate-700 mb-4">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                          </span>
                          <span className="text-sm font-medium text-slate-500 uppercase ml-1">OFF</span>
                          <p className="text-xs text-slate-400 mt-1">Min. purchase: ${coupon.min_purchase_amount}</p>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                              <TicketPercent className="h-3 w-3" />
                              {coupon.usage_limit ? `${coupon.used_count || 0}/${coupon.usage_limit} used` : 'Unlimited'}
                          </div>
                          <button 
                              onClick={() => deleteCoupon(coupon.id)}
                              className="text-red-500 hover:underline flex items-center gap-1"
                          >
                              <Trash2 className="h-3 w-3" /> Delete
                          </button>
                      </div>
                  </motion.div>
              ))}
          </AnimatePresence>
      </div>
    </div>
  );
}
