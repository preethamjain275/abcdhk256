import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TransactionItem } from '@/components/TransactionItem';
import { Transaction, TransactionFilter, PaymentMode, TransactionStatus } from '@/types';
import { transactionService, paymentModeLabels } from '@/services/transactionService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  FileText,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    completedCount: 0,
    pendingCount: 0,
    totalTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TransactionFilter>({
    paymentMode: 'all',
    status: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [txns, statsData] = await Promise.all([
          transactionService.getTransactions(filters),
          transactionService.getTransactionStats(),
        ]);
        setTransactions(txns);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const blob = await transactionService.downloadReceipt(transactionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Receipt downloaded');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await transactionService.exportToCSV(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const content = await transactionService.exportToPDF(filters);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const clearFilters = () => {
    setFilters({
      paymentMode: 'all',
      status: 'all',
    });
  };

  const hasActiveFilters = filters.paymentMode !== 'all' || 
    filters.status !== 'all' || 
    filters.dateFrom || 
    filters.dateTo;

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">My Transactions</h1>
              <p className="mt-1 text-muted-foreground">
                View and manage your transaction history
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="mt-1 font-display text-xl font-bold text-primary">
              {formatPrice(stats.totalSpent)}
            </p>
          </div>
          <div className="rounded-xl bg-card p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-1 font-display text-xl font-bold text-success">
              {stats.completedCount}
            </p>
          </div>
          <div className="rounded-xl bg-card p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-1 font-display text-xl font-bold text-warning">
              {stats.pendingCount}
            </p>
          </div>
          <div className="rounded-xl bg-card p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="mt-1 font-display text-xl font-bold">
              {stats.totalTransactions}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors',
              showFilters && 'border-primary bg-primary/5 text-primary'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                !
              </span>
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 animate-slide-up rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Payment Mode Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMode || 'all'}
                  onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value as PaymentMode | 'all' })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary"
                >
                  <option value="all">All Methods</option>
                  {Object.entries(paymentModeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as TransactionStatus | 'all' })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDownloadReceipt={handleDownloadReceipt}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No transactions found</p>
            <p className="mt-2 text-muted-foreground">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Your transaction history will appear here'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
