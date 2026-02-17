import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AddressForm } from '@/components/checkout/AddressForm';
import { PaymentSection } from '@/components/checkout/PaymentSection';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShippingAddress, PaymentMode, Order, OrderTrackingStep } from '@/types';
import { ArrowLeft, Loader2, CheckCircle2, LogIn, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { paymentService } from '@/services/paymentService';
import { LuxePayGateway } from '@/components/checkout/LuxePayGateway';
import { motion, AnimatePresence } from 'framer-motion';

const ADDRESSES_STORAGE_KEY = 'ecommerce-addresses';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMode | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showLuxePay, setShowLuxePay] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const shipping = cartTotal > 1000 ? 0 : 99;
  const handlingFee = selectedPayment === 'cod' ? 5 : 0;
  const tax = cartTotal * 0.18;
  const totalBeforeDiscount = cartTotal + shipping + tax + handlingFee;
  const total = totalBeforeDiscount - discount;

  // Load saved addresses
  useEffect(() => {
    const saved = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAddresses(parsed);
      const defaultAddr = parsed.find((a: ShippingAddress) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr);
    }
  }, []);

  // Save addresses
  const handleAddAddress = (address: ShippingAddress) => {
    const updated = [...addresses, address];
    setAddresses(updated);
    setSelectedAddress(address);
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleApplyCoupon = (code: string) => {
    if (code.toUpperCase() === 'FIRST10') {
      const d = cartTotal * 0.10;
      setDiscount(d);
      setCouponCode(code.toUpperCase());
      toast.success('Coupon applied: 10% OFF!');
    } else if (code.toUpperCase() === 'LUXE500') {
      setDiscount(500);
      setCouponCode(code.toUpperCase());
      toast.success('Coupon applied: ₹500 OFF!');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  // Generate estimated delivery date (3-7 days from now)
  const getEstimatedDelivery = () => {
    const days = Math.floor(Math.random() * 5) + 3; // 3-7 days
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  // Generate tracking steps
  const generateTrackingSteps = (): OrderTrackingStep[] => {
    const now = new Date().toISOString();
    return [
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been placed successfully',
        timestamp: now,
        completed: true,
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'Seller is preparing your order',
        completed: false,
      },
      {
        status: 'shipped',
        title: 'Shipped',
        description: 'Your order is on the way',
        completed: false,
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Your order is out for delivery',
        completed: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Order delivered successfully',
        completed: false,
      },
    ];
  };

  const finalizeOrder = async (transactionData: any) => {
    if (!selectedAddress || !user || !selectedPayment) return;
    
    setIsProcessing(true);
    try {
      // 1. Create order in Supabase
      const orderData = {
        user_id: user.id,
        status: 'confirmed',
        subtotal: cartTotal,
        shipping,
        tax,
        total,
        handling_fee: handlingFee,
        shipping_address: selectedAddress,
        payment_method: selectedPayment,
        payment_details: transactionData,
        estimated_delivery: getEstimatedDelivery(),
        tracking_steps: generateTrackingSteps(),
      };

      const { data, error: orderError } = await supabase
        .from('orders')
        .insert(orderData as any)
        .select()
        .single();

      const orderResult = data as any;
      if (orderError || !orderResult) throw orderError || new Error('Failed to create order');

      // 2. Create order items
      const orderItemsData = cartItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
        selected_size: item.selectedSize || 'N/A',
        selected_color: item.selectedColor || 'N/A'
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData as any);

      if (itemsError) throw itemsError;

      // 3. Create transaction record
      const { error: transError } = await supabase.from('transactions').insert({
        order_id: orderResult.id,
        user_id: user.id,
        payment_mode: selectedPayment,
        amount: total,
        status: 'completed',
        transaction_id: transactionData.transactionId || `PAY-${Date.now()}`
      } as any);

      if (transError) console.error('Transaction record error:', transError);

      // 4. Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'order_placed',
        title: 'Order Placed Successfully',
        body: `Your order #${orderResult.id.slice(0, 8)} has been placed and is being processed.`,
        data: { orderId: orderResult.id },
        read: false
      } as any);

      // Construct local order object for display
      const order: Order = {
        id: orderResult.id,
        items: cartItems,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        subtotal: cartTotal,
        shipping,
        tax,
        total,
        handlingFee,
        status: 'confirmed',
        createdAt: orderResult.created_at,
        estimatedDelivery: orderResult.estimated_delivery,
        trackingSteps: orderResult.tracking_steps,
      };

      setPlacedOrder(order);
      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed successfully!');
      
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast.error(`Order Failed: ${error?.message || 'Transaction error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
   
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }
    if (!user) {
      toast.error('You must be signed in to place an order');
      navigate('/auth');
      return;
    }

    setIsProcessing(true);

    if (selectedPayment !== 'cod') {
      setShowLuxePay(true);
    } else {
      finalizeOrder({ method: 'cod', paid: false });
    }
  };

  // Not authenticated
  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="container max-w-3xl py-8">
          <div className="rounded-2xl bg-card p-8 text-center border border-border/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <LogIn className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Sign in to checkout</h2>
            <p className="mt-2 text-muted-foreground">
              You need to sign in to proceed with your order
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-glow"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Order placed successfully
  if (orderPlaced && placedOrder) {
    const estimatedDate = new Date(placedOrder.estimatedDelivery);
    
    return (
      <Layout>
        <div className="container max-w-4xl py-6 md:py-12">
          <div className="flex flex-col items-center text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-glow">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="font-display text-4xl font-extrabold md:text-5xl">Order Placed!</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-md">
              Congratulations! Your order <span className="font-bold text-foreground">#{placedOrder.id.slice(0, 8)}</span> has been confirmed and is being processed.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-5">
            {/* Left Column: Summary */}
            <div className="md:col-span-3 space-y-6">
              <div className="rounded-3xl bg-card border border-border/50 p-6 md:p-8 shadow-sm">
                <h3 className="font-display text-xl font-bold mb-6">Delivery Details</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl bg-secondary/30 p-4 border border-border/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Shipping To</p>
                    <p className="font-bold">{placedOrder.shippingAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {placedOrder.shippingAddress.addressLine1}, {placedOrder.shippingAddress.city}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {placedOrder.shippingAddress.state} - {placedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-secondary/30 p-4 border border-border/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Estimated Arrival</p>
                    <p className="text-lg font-bold">
                      {estimatedDate.toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Standard Delivery</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold mb-4">Items Ordered</h4>
                  <div className="space-y-4">
                    {placedOrder.items.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="h-16 w-16 overflow-hidden rounded-xl bg-muted border border-border/50">
                          <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-3xl bg-card border border-border/50 p-6 md:p-8 shadow-sm">
                <h3 className="font-display text-xl font-bold mb-6">What's Next?</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</div>
                    <p className="text-muted-foreground">You will receive an email confirmation shortly.</p>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</div>
                    <p className="text-muted-foreground">We'll notify you once your order has shipped.</p>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</div>
                    <p className="text-muted-foreground">Track your package anytime from your profile.</p>
                  </li>
                </ul>

                <div className="flex flex-col gap-3">
                  <Link
                    to="/orders"
                    className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-glow transition-all hover:scale-105 active:scale-95"
                  >
                    Track Your Order
                  </Link>
                  <Link
                    to="/products"
                    className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-background text-lg font-bold transition-all hover:bg-secondary active:scale-95"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-primary/5 border border-primary/20 p-6 text-center">
                <p className="text-sm font-medium">Need help with your order?</p>
                <button className="mt-2 text-primary font-bold hover:underline">Contact Support</button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty cart
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <Layout>
        <div className="container max-w-3xl py-8">
          <div className="rounded-2xl bg-card p-8 text-center border border-border/50">
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Add some items to your cart before checkout
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-glow"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 relative">
        <AnimatePresence>
          {showLuxePay && (
            <LuxePayGateway 
              amount={total}
              orderId={`ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`}
              onSuccess={(details) => {
                setPaymentData(details);
                setShowLuxePay(false);
                // Trigger the final order placement logic
                finalizeOrder(details);
              }}
              onCancel={() => {
                setShowLuxePay(false);
                setIsProcessing(false);
              }}
            />
          )}
        </AnimatePresence>
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full border-t-4 border-r-4 border-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Shield className="h-8 w-8 text-primary animate-pulse" />
                </div>
             </div>
             <h2 className="text-2xl font-display font-bold mb-2">Processing Your Order</h2>
             <p className="text-muted-foreground animate-pulse">Securing your payment and preparing your items...</p>
             
             <div className="mt-12 w-64 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-[shimmer_2s_infinite]" style={{ width: '60%' }} />
             </div>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <h1 className="mb-8 font-display text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Address & Payment */}
          <div className="space-y-8 lg:col-span-2">
            <AddressForm
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelectAddress={setSelectedAddress}
              onAddAddress={handleAddAddress}
            />

            <PaymentSection
              selectedPayment={selectedPayment}
              onSelectPayment={setSelectedPayment}
              onPaymentDataChange={setPaymentData}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <OrderSummary
                items={cartItems}
                subtotal={cartTotal}
                shipping={shipping}
                tax={tax}
                total={total}
                discount={discount}
                onApplyCoupon={handleApplyCoupon}
              />

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddress || !selectedPayment}
                className="w-full rounded-xl bg-primary py-4 font-medium text-primary-foreground transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  `Place Order • ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
