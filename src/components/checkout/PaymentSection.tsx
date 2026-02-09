import { PaymentMode } from '@/types';
import { CreditCard, Smartphone, Building2, Wallet, Banknote, Check, Shield } from 'lucide-react';
import { UPIPayment, CardPayment } from './PaymentDetails';

interface PaymentOption {
  id: PaymentMode;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'GPay, PhonePe, Paytm',
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    id: 'credit_card',
    name: 'Credit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
    description: 'All banks supported',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 'net_banking',
    name: 'Net Banking',
    description: 'All major banks',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    id: 'wallet',
    name: 'Wallet',
    description: 'Paytm, Amazon Pay',
    icon: <Wallet className="h-5 w-5" />,
  },

  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: <Banknote className="h-5 w-5" />,
  },
];

interface PaymentSectionProps {
  selectedPayment: PaymentMode | null;
  onSelectPayment: (payment: PaymentMode) => void;
  onPaymentDataChange: (data: any) => void;
}

export function PaymentSection({ selectedPayment, onSelectPayment, onPaymentDataChange }: PaymentSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <CreditCard className="h-5 w-5" />
        Payment Method
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelectPayment(option.id)}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              selectedPayment === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${
                selectedPayment === option.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium">{option.name}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              {selectedPayment === option.id && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="animate-in fade-in duration-500">

        {(selectedPayment === 'upi' || selectedPayment === 'credit_card' || selectedPayment === 'debit_card' || selectedPayment === 'net_banking') && (
          <div className="rounded-2xl border-2 border-dashed border-primary/30 p-8 text-center bg-primary/5">
             <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary animate-pulse" />
             </div>
             <p className="text-sm font-bold uppercase tracking-wider">Secure Gateway Enabled</p>
             <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">You will be redirected to the secure payment portal after clicking Place Order.</p>
          </div>
        )}
      </div>

      {selectedPayment && selectedPayment !== 'cod' && (
        <div className="rounded-xl bg-secondary/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 This is a <span className="font-medium text-foreground">secure payment</span> session. 
            All data is encrypted.
          </p>
        </div>
      )}
    </div>
  );
}
