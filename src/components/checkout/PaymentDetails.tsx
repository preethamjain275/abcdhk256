
import { useState } from 'react';
import { Smartphone, CreditCard, Check, QrCode, ShieldCheck } from 'lucide-react';
import { PaymentMode } from '@/types';

interface PaymentDetailProps {
  type: PaymentMode;
  onDataChange: (data: any) => void;
}

const UPIPayment = ({ onDataChange }: PaymentDetailProps) => {
  const [upiId, setUpiId] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiId(e.target.value);
    onDataChange({ upiId: e.target.value });
  };

  return (
    <div className="mt-4 space-y-4 rounded-xl bg-secondary/30 p-4 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="bg-white p-2 rounded-lg border-2 border-primary/20 shadow-sm">
          <QrCode className="h-40 w-40 text-background" />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Scan QR code with any UPI app to pay
        </p>
      </div>
      
      <div className="relative">
        <label className="text-xs font-medium text-muted-foreground ml-1">Or Enter UPI ID</label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="username@bank"
            value={upiId}
            onChange={handleChange}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

const CardPayment = ({ onDataChange }: PaymentDetailProps) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    const updated = { ...cardData, number: formatted };
    setCardData(updated);
    onDataChange(updated);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    const updated = { ...cardData, expiry: value };
    setCardData(updated);
    onDataChange(updated);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cvv') val = value.replace(/\D/g, '').substring(0, 3);
    const updated = { ...cardData, [name]: val };
    setCardData(updated);
    onDataChange(updated);
  };

  return (
    <div className="mt-4 space-y-4 rounded-xl bg-secondary/30 p-4 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Card Number</label>
          <div className="relative">
            <input
              name="number"
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardData.number}
              onChange={handleCardNumberChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary font-mono tracking-wider"
            />
            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground ml-1">Expiry Date</label>
            <input
              name="expiry"
              type="text"
              placeholder="MM/YY"
              value={cardData.expiry}
              onChange={handleExpiryChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground ml-1">CVV</label>
            <input
              name="cvv"
              type="password"
              placeholder="***"
              value={cardData.cvv}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Card Holder Name</label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            value={cardData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider justify-center pt-2">
        <ShieldCheck className="h-3 w-3" />
        Secure 256-bit encrypted payment
      </div>
    </div>
  );
};

export { UPIPayment, CardPayment };
