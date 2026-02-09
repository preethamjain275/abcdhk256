import { useState } from 'react';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/currency';
import { ShoppingBag, Truck, Shield, Tag, ChevronRight } from 'lucide-react';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  onApplyCoupon?: (code: string) => void;
}

export function OrderSummary({ items, subtotal, shipping, tax, total, discount = 0, onApplyCoupon }: OrderSummaryProps) {
  const [couponInput, setCouponInput] = useState('');

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ShoppingBag className="h-5 w-5" />
        Order Summary
      </h2>

      {/* Items */}
      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-3">
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm font-semibold text-primary">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Code */}
      {onApplyCoupon && (
        <div className="mt-6 border-t border-border pt-6">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Have a Promo Code?</label>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1 group">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="FIRST10"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full h-11 rounded-xl bg-secondary/30 border border-border pl-10 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <button
              onClick={() => onApplyCoupon(couponInput)}
              className="px-6 rounded-xl bg-secondary text-foreground text-xs font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all active:scale-95"
            >
              Apply
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            {['FIRST10', 'LUXE500'].map(code => (
              <button 
                key={code}
                onClick={() => { setCouponInput(code); onApplyCoupon(code); }}
                className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="mt-6 space-y-3 border-t border-border pt-6">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">Original Price</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">Shipping Fee</span>
          <span className={shipping === 0 ? 'text-success font-bold' : ''}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">GST (18%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm font-bold text-success animate-in slide-in-from-right-2">
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Discount Applied
            </span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between border-t border-border pt-4 mt-2">
          <span className="text-lg font-black tracking-tight">Order Total</span>
          <span className="text-2xl font-black text-primary tracking-tighter">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="h-4 w-4 text-green-500" />
          <span>Free delivery on orders above ₹1000</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-green-500" />
          <span>100% secure payment</span>
        </div>
      </div>
    </div>
  );
}
