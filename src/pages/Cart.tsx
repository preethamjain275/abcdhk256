import { Layout } from '@/components/Layout';
import { CartItem } from '@/components/CartItem';
import { ProductCarousel } from '@/components/ProductCarousel';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { recommendationService } from '@/services/recommendationService';
import { ShoppingCart, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/currency';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    savedItems,
    cartTotal,
    cartCount,
    savedCount,
    clearCart,
    isSyncing,
  } = useCart();
  
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const recs = await recommendationService.getPersonalizedRecommendations(6);
      setRecommendations(recs);
    };
    fetchRecommendations();
  }, []);

  const shipping = cartTotal > 1000 ? 0 : 99;
  const tax = cartTotal * 0.18; // 18% GST
  const total = cartTotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) {
      toast.info('Please sign in to proceed to checkout');
      navigate('/auth');
      return;
    }
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Shopping Cart
        </h1>

        {cartItems.length === 0 && savedItems.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven't added anything yet
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-glow"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Active Cart */}
              {cartItems.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <ShoppingCart className="h-5 w-5" />
                      Cart ({cartCount} items)
                    </h2>
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <CartItem key={item.product.id} item={item} variant="cart" />
                    ))}
                  </div>
                </div>
              )}

              {/* Saved for Later */}
              {savedItems.length > 0 && (
                <div className={cartItems.length > 0 ? 'mt-12' : ''}>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Bookmark className="h-5 w-5" />
                    Saved for Later ({savedCount} items)
                  </h2>
                  <div className="space-y-4">
                    {savedItems.map((item) => (
                      <CartItem
                        key={item.product.id}
                        item={{ product: item.product, quantity: 1, addedAt: item.savedAt }}
                        variant="saved"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cartItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="sticky top-20 rounded-2xl bg-card p-6">
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-success">Free</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Free shipping on orders over ₹1000
                      </p>
                    )}
                    
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="price-tag">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="mt-6 w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all hover:shadow-glow"
                  >
                    Proceed to Checkout
                  </button>

                  {/* Promo Code */}
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                      />
                      <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Sync Status */}
                  {isSyncing && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Syncing cart...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-16">
            <ProductCarousel
              products={recommendations}
              title="You Might Also Like"
              variant="default"
            />
          </section>
        )}
      </div>
    </Layout>
  );
}
