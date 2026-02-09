import { Transaction } from '@/types';
import { paymentModeLabels, statusColors } from '@/services/transactionService';
import { Download, ChevronRight, CreditCard, Smartphone, Building } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

interface TransactionItemProps {
  transaction: Transaction;
  onDownloadReceipt?: (transactionId: string) => void;
  className?: string;
}

const paymentIcons = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  paypal: Smartphone,
  apple_pay: Smartphone,
  google_pay: Smartphone,
  bank_transfer: Building,
};

export function TransactionItem({
  transaction,
  onDownloadReceipt,
  className,
}: TransactionItemProps) {
  const Icon = paymentIcons[transaction.paymentMode];
  const statusStyle = statusColors[transaction.status];

  return (
    <div
      className={cn(
        'group rounded-xl bg-card p-4 transition-all hover:bg-secondary/30',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Side - Payment Info */}
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-secondary p-3">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{paymentModeLabels[transaction.paymentMode]}</h4>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusStyle.bg, statusStyle.text)}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Order #{transaction.orderId}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {format(new Date(transaction.timestamp), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>

        {/* Right Side - Amount & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={cn(
              'font-semibold',
              transaction.status === 'refunded' && 'text-muted-foreground line-through'
            )}>
              {formatPrice(transaction.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Download Receipt */}
          {transaction.receiptUrl && transaction.status === 'completed' && onDownloadReceipt && (
            <button
              onClick={() => onDownloadReceipt(transaction.id)}
              className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100"
              title="Download receipt"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Items Preview */}
      <div className="mt-4 flex items-center gap-2">
        {transaction.items.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="h-10 w-10 overflow-hidden rounded-lg bg-muted"
          >
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        {transaction.items.length > 3 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
            +{transaction.items.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
