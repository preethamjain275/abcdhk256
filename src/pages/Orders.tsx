import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderTrackingStep } from '@/types';
import { formatPrice } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  LogIn,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  CreditCard,
  Star,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { productService } from '@/services/productService';
import { cn } from '@/lib/utils';

// Status icon mapping
const statusIcons: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="h-4 w-4" />,
  processing: <Clock className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  out_for_delivery: <Truck className="h-4 w-4" />,
  delivered: <Package className="h-4 w-4" />,
  cancelled: <Clock className="h-4 w-4" />,
};

// Status color mapping using semantic tokens
const statusColors: Record<string, string> = {
  confirmed: 'text-primary bg-primary/10',
  processing: 'text-yellow-600 bg-yellow-500/10 dark:text-yellow-400',
  shipped: 'text-purple-600 bg-purple-500/10 dark:text-purple-400',
  out_for_delivery: 'text-orange-600 bg-orange-500/10 dark:text-orange-400',
  delivered: 'text-green-600 bg-green-500/10 dark:text-green-400',
  cancelled: 'text-destructive bg-destructive/10',
};

const paymentModeLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  upi: 'UPI',
  cod: 'Cash on Delivery',
  net_banking: 'Net Banking',
  wallet: 'Wallet',
};

function OrderTrackingTimeline({ steps }: { steps: OrderTrackingStep[] }) {
  return (
    <div className="relative mt-4">
      {steps.map((step, index) => (
        <div key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'absolute left-[15px] top-8 h-full w-0.5',
                step.completed ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
          
          {/* Dot */}
          <div
            className={cn(
              'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              step.completed
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            {statusIcons[step.status]}
          </div>
          
          {/* Content */}
          <div className="flex-1 pt-1">
            <p className={cn('font-medium', !step.completed && 'text-muted-foreground')}>
              {step.title}
            </p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            {step.timestamp && (
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(step.timestamp).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [trackingLive, setTrackingLive] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const estimatedDate = new Date(order.estimatedDelivery);
  const createdDate = new Date(order.createdAt);

  const handleSubmitReview = async (productId: string) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const success = await productService.submitReview({
        productId,
        userId: user.id,
        userName: user.user_metadata?.full_name || 'Customer',
        rating,
        comment
      });
      if (success) {
        toast.success('Review submitted successfully!');
        setReviewingItem(null);
        setComment('');
      } else {
        toast.error('Failed to submit review');
      }
    } catch (err) {
      toast.error('Error submitting review');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReorder = () => {
    order.items.forEach(item => {
      addToCart(item.product, item.quantity, item.selectedSize, item.selectedColor);
    });
    toast.success('All items added to cart for reorder!');
    navigate('/cart');
  };

  return (
    <div className="rounded-2xl bg-card overflow-hidden border border-border/50">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer p-4 transition-colors hover:bg-secondary/30"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{order.id.slice(0, 8)}...</span>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[order.status])}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatPrice(order.total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Ordered on</p>
            <p className="text-sm font-medium">
              {createdDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Items Preview */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {order.items.slice(0, 4).map((item) => (
            <img
              key={item.product.id}
              src={item.product.images[0]}
              alt={item.product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ))}
          {order.items.length > 4 && (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-sm font-medium">
              +{order.items.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-4 animate-in slide-in-from-top-2">
          {/* Estimated Delivery */}
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/10 p-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-semibold text-primary">
                {estimatedDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Tracking Timeline */}
          <OrderTrackingTimeline steps={order.trackingSteps} />

          {/* Live Tracking Simulation */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="mt-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setTrackingLive(!trackingLive);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/5 py-4 text-sm font-bold text-primary border border-primary/20 hover:bg-primary/10 transition-all font-display uppercase tracking-widest"
              >
                <MapPin className="h-4 w-4" />
                {trackingLive ? 'Close Live Map' : 'Track Live Location'}
              </button>
              
              {trackingLive && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-secondary/20 p-1 animate-in zoom-in-95 duration-500">
                  <div className="relative h-48 w-full bg-slate-200 overflow-hidden rounded-xl">
                    {/* Simulated Moving Map Background */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i2345!3i1234!2m3!1e0!2sm!3i385054374!3m8!2sen!3sin!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0!23i4111425')] bg-cover animate-pulse" />
                    
                    {/* Pulsing delivery point */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 animate-ping" />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-2 border-white" />
                    </div>
                    
                    {/* Driver Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/80 p-3 text-white backdrop-blur-md border border-white/10 shadow-2xl">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-slate-500 overflow-hidden border-2 border-primary/50">
                            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" alt="Partner" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase font-black tracking-tighter text-primary">Arriving in approx. 25 mins</p>
                          <p className="text-sm font-bold tracking-tight">Delivery Partner: Ramesh Kumar</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Calling delivery partner...');
                          }}
                          className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                          <Smartphone className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Details */}
          <div className="mt-6 space-y-4 border-t border-border pt-4">
            {/* Items */}
            <div>
              <h4 className="mb-2 font-medium">Items</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} • {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.selectedSize && (
                          <span className="text-[10px] font-bold bg-secondary px-1.5 py-0.5 rounded uppercase">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[10px] font-bold bg-secondary px-1.5 py-0.5 rounded uppercase">Color: {item.selectedColor}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h4>
              <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Paid via <span className="font-medium">{paymentModeLabels[order.paymentMethod] || order.paymentMethod}</span>
              </span>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Delivered Items Review */}
            {order.status === 'delivered' && (
              <div className="mt-4 border-t border-border pt-4">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Rate your items</h4>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={item.product.images[0]} className="h-10 w-10 rounded-lg object-cover" />
                          <div>
                            <span className="text-sm font-medium line-clamp-1">{item.product.name}</span>
                            {(item.selectedSize || item.selectedColor) && (
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                {item.selectedSize} {item.selectedSize && item.selectedColor && '•'} {item.selectedColor}
                              </p>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => setReviewingItem(reviewingItem === item.product.id ? null : item.product.id)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          {reviewingItem === item.product.id ? 'Cancel' : 'Write a Review'}
                        </button>
                      </div>
                      
                      {reviewingItem === item.product.id && (
                        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} onClick={() => setRating(s)}>
                                <Star className={cn("h-5 w-5", s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                              </button>
                            ))}
                          </div>
                          <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="w-full rounded-lg border border-border bg-secondary/30 p-3 text-sm outline-none focus:border-primary"
                            rows={3}
                          />
                          <button 
                            onClick={() => handleSubmitReview(item.product.id)}
                            disabled={isUpdating || !comment.trim()}
                            className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isUpdating ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 border-t border-border pt-6">
              {(order.status === 'confirmed' || order.status === 'processing') && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm('Are you sure you want to cancel this order?')) return;
                    setIsUpdating(true);
                    try {
                      const { error } = await (supabase as any)
                        .from('orders')
                        .update({ status: 'cancelled' })
                        .eq('id', (order as any).id);
                      if (error) throw error;
                      toast.success('Order cancelled successfully');
                      onUpdate();
                    } catch (err) {
                      toast.error('Failed to cancel order');
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-1 h-11 rounded-xl bg-destructive/10 text-destructive font-bold text-xs uppercase tracking-widest hover:bg-destructive hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              {order.status === 'delivered' && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm('Initiate return for this order?')) return;
                    setIsUpdating(true);
                    try {
                      await new Promise(r => setTimeout(r, 1500));
                      toast.success('Return request submitted! Our executive will contact you.');
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-1 h-11 rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? 'Processing...' : 'Return Order'}
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info('Downloading invoice...');
                }}
                className="flex-1 h-11 rounded-xl border border-border bg-card font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all"
              >
                Invoice
              </button>
              
              <Link
                to="/help"
                className="flex-1 h-11 flex items-center justify-center rounded-xl border border-border bg-card font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all"
              >
                Help
              </Link>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReorder();
                }}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:shadow-glow transition-all active:scale-95"
              >
                Buy Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Map database order to Order type
const mapOrderFromDB = (data: any, items: any[]): Order => {
  return {
    id: data.id,
    items: items.map((item: any) => ({
      product: {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        price: Number(item.products.price),
        category: item.products.category,
        images: item.products.images,
        rating: Number(item.products.rating),
        reviewCount: item.products.review_count,
        stock: item.products.stock,
        tags: item.products.tags,
        createdAt: item.products.created_at,
      },
      quantity: item.quantity,
      addedAt: data.created_at, // Approximate
      selectedSize: item.selected_size,
      selectedColor: item.selected_color,
    })),
    shippingAddress: data.shipping_address,
    paymentMethod: data.payment_method,
    subtotal: Number(data.subtotal),
    shipping: Number(data.shipping),
    tax: Number(data.tax),
    total: Number(data.total),
    status: data.status,
    createdAt: data.created_at,
    estimatedDelivery: data.estimated_delivery,
    trackingSteps: data.tracking_steps || [],
  };
};

export default function Orders() {
  const navigate = useNavigate();
  const { session, user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchOrders = async () => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }

    try {
      setLoadingOrders(true);
      const { data: ordersData, error: ordersError } = await (supabase as any)
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        const ordersWithItems = await Promise.all(
          (ordersData as any[]).map(async (order: any) => {
            const { data: itemsData, error: itemsError } = await (supabase as any)
              .from('order_items')
              .select('*, products(*)')
              .eq('order_id', order.id);

            if (itemsError) {
              console.error('Error fetching order items', itemsError);
              return null;
            }
            
            return mapOrderFromDB(order, itemsData || []);
          })
        );
        
        setOrders(ordersWithItems.filter(Boolean) as Order[]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Show sign-in prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="container max-w-3xl py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="font-display text-3xl font-bold">My Orders</h1>
          </div>
          
          <div className="rounded-2xl bg-card p-8 text-center border border-border/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <LogIn className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Sign in to view orders</h2>
            <p className="mt-2 text-muted-foreground">
              You need to sign in to view your order history
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

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-display text-3xl font-bold">My Orders</h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage your orders
          </p>
        </div>

        {loadingOrders ? (
          <div className="space-y-4">
             {[1, 2].map(i => (
               <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-secondary/50" />
             ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center border border-border/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">
              When you place an order, it will appear here
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-glow"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
