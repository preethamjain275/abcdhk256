import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  CreditCard
} from 'lucide-react';
import { transactionService, paymentModeLabels, statusColors } from '@/services/transactionService';
import { Transaction, TransactionFilter, PaymentMode, TransactionStatus } from '@/types';
import { formatPrice } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilter>({
    paymentMode: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (id: string) => {
    try {
      toast.info('Downloading receipt...');
       // Mock download - in real app would trigger file download
      await transactionService.downloadReceipt(id);
      toast.success('Receipt downloaded');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor payments and financial records.</p>
        </div>
        <button 
          onClick={() => fetchTransactions()}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
            <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transaction ID or Order ID..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all dark:text-white"
              />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
               <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value as TransactionStatus | 'all'})}
                  className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm px-3 py-2.5 focus:ring-0 text-slate-600 dark:text-slate-300 font-medium"
               >
                   <option value="all">All Status</option>
                   <option value="completed">Completed</option>
                   <option value="pending">Pending</option>
                   <option value="failed">Failed</option>
                   <option value="refunded">Refunded</option>
               </select>
               <select 
                  value={filters.paymentMode}
                  onChange={(e) => setFilters({...filters, paymentMode: e.target.value as PaymentMode | 'all'})}
                  className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm px-3 py-2.5 focus:ring-0 text-slate-600 dark:text-slate-300 font-medium"
               >
                   <option value="all">All Methods</option>
                   <option value="credit_card">Credit Card</option>
                   <option value="debit_card">Debit Card</option>
                   <option value="upi">UPI</option>
                   <option value="cod">COD</option>
               </select>
          </div>
      </div>

      {/* Transactions List */}
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
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-xs text-slate-500">{t.id.slice(0, 8)}...</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-bold text-slate-900 dark:text-white">#{t.orderId.slice(0, 8)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {format(new Date(t.timestamp), 'MMM d, yyyy HH:mm')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(t.amount)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                            <CreditCard className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {paymentModeLabels[t.paymentMode]}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase border", 
                                        statusColors[t.status].bg,
                                        statusColors[t.status].text,
                                        "border-transparent"
                                    )}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button 
                                        onClick={() => handleDownloadReceipt(t.id)}
                                        className="text-cyan-600 hover:text-cyan-700 font-medium text-xs flex items-center gap-1 ml-auto"
                                    >
                                        <Download className="h-3 w-3" /> Receipt
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
