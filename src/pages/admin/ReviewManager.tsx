import { useState, useEffect } from 'react';
import { 
  Star, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Loader2,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ReviewManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes-reviews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        (payload) => {
            console.log('Review change detected:', payload);
            fetchReviews();
            if (payload.eventType === 'INSERT') {
                toast.info('New product review received');
            }
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          product:products(name, product_media_mapping(is_primary, media_assets(url)))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Reviews</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and manage product feedback.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
                {reviews.map((review) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col gap-4 relative group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                     {(() => {
                                         const mapping = review.product?.product_media_mapping || [];
                                         const primary = mapping.find((m: any) => m.is_primary) || mapping[0];
                                         const url = primary?.media_assets?.url;
                                         return url ? <img src={url} alt={review.product.name} className="h-full w-full object-cover" /> : null;
                                     })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">{review.product?.name}</h3>
                                    <div className="flex items-center text-yellow-400 gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">
                                {format(new Date(review.created_at), 'MMM d, yyyy')}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                    {review.user_name?.[0] || 'U'}
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{review.user_name || 'Anonymous User'}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{review.comment}"</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                            <button 
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                            >
                                <Trash2 className="h-4 w-4" /> Delete Review
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {reviews.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                    <p>No reviews found yet.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
