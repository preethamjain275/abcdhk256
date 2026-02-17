import { Transaction, TransactionFilter, PaymentMode, TransactionStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

// Helper to map DB result to Transaction type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTransactionFromDB = (data: any): Transaction => ({
  id: data.id,
  orderId: data.order_id,
  paymentMode: (data.payment_mode as PaymentMode) || 'credit_card', // Default falllback
  amount: Number(data.amount),
  status: (data.status as TransactionStatus) || 'pending',
  timestamp: data.timestamp,
  items: data.items || [], // You might need to join order_items here if not stored in jsonb
  receiptUrl: data.receipt_url,
});

// Payment mode display names
export const paymentModeLabels: Record<PaymentMode, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  upi: 'UPI',
  cod: 'Cash on Delivery',
  net_banking: 'Net Banking',
  wallet: 'Wallet',
  sandbox: 'Sandbox (Test Pay)',
};

// Status colors for UI
export const statusColors: Record<TransactionStatus, { bg: string; text: string }> = {
  completed: { bg: 'bg-success/10', text: 'text-success' },
  pending: { bg: 'bg-warning/10', text: 'text-warning' },
  failed: { bg: 'bg-destructive/10', text: 'text-destructive' },
  refunded: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

export const transactionService = {
  // Get all transactions with optional filters
  async getTransactions(filters?: TransactionFilter): Promise<Transaction[]> {
    let query = supabase.from('transactions').select('*');

    if (filters?.paymentMode && filters.paymentMode !== 'all') {
      query = query.eq('payment_mode', filters.paymentMode);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('timestamp', filters.dateFrom);
    }

    if (filters?.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte('timestamp', toDate.toISOString());
    }

    // Sort by most recent first
    query = query.order('timestamp', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return (data || []).map(mapTransactionFromDB);
  },

  // Get single transaction
  async getTransactionById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }

    return data ? mapTransactionFromDB(data) : null;
  },

  // Get transaction summary stats
  async getTransactionStats(): Promise<{
    totalSpent: number;
    completedCount: number;
    pendingCount: number;
    totalTransactions: number;
  }> {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, status');

    if (error) {
      console.error('Error fetching transaction stats:', error);
      return { totalSpent: 0, completedCount: 0, pendingCount: 0, totalTransactions: 0 };
    }

    const transactions = data || [];
    const completed = transactions.filter(t => t.status === 'completed');
    const pending = transactions.filter(t => t.status === 'pending');

    return {
      totalSpent: completed.reduce((sum, t) => sum + Number(t.amount), 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      totalTransactions: transactions.length,
    };
  },

  // Mock download receipt (Backend should generate this really)
  async downloadReceipt(transactionId: string): Promise<Blob> {
    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Create a mock PDF content (in real app, this would come from backend storage)
    const receiptContent = `
      RECEIPT
      ========
      Order ID: ${transaction.orderId}
      Date: ${new Date(transaction.timestamp).toLocaleDateString()}
      Payment Method: ${paymentModeLabels[transaction.paymentMode]}
      
      Total: ₹${transaction.amount.toFixed(2)}
      Status: ${transaction.status.toUpperCase()}
    `;

    return new Blob([receiptContent], { type: 'text/plain' });
  },

  // Mock export to CSV
  async exportToCSV(filters?: TransactionFilter): Promise<string> {
    const transactions = await this.getTransactions(filters);

    const headers = ['Order ID', 'Date', 'Payment Mode', 'Amount', 'Status'];
    const rows = transactions.map(t => [
      t.orderId,
      new Date(t.timestamp).toLocaleDateString(),
      paymentModeLabels[t.paymentMode],
      `₹${t.amount.toFixed(2)}`,
      t.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csv;
  },

  // Mock export to PDF (returns content that would be converted to PDF)
  async exportToPDF(filters?: TransactionFilter): Promise<string> {
    const transactions = await this.getTransactions(filters);
    const stats = await this.getTransactionStats();

    return `
      TRANSACTION HISTORY REPORT
      ==========================
      Generated: ${new Date().toLocaleDateString()}
      
      Summary:
      - Total Transactions: ${stats.totalTransactions}
      - Total Spent: ₹${stats.totalSpent.toFixed(2)}
      - Completed: ${stats.completedCount}
      - Pending: ${stats.pendingCount}
      
      Transactions:
      ${transactions.map(t => `
        ${t.orderId} | ${new Date(t.timestamp).toLocaleDateString()} | ${paymentModeLabels[t.paymentMode]} | ₹${t.amount.toFixed(2)} | ${t.status}
      `).join('')}
    `;
  },
};
