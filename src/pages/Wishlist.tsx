import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { recommendationService } from '@/services/recommendationService';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function Wishlist() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const data = await recommendationService.getWishlist();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await recommendationService.removeFromWishlist(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = (product: Product) => {
    addToCart(product);
    handleRemove(product.id);
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
          <p className="mt-1 text-muted-foreground">
            {products.length === 0 ? "Items you've saved for later" : `You have ${products.length} items in your wishlist`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary/50" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 transition-all hover:shadow-lg">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="line-clamp-1 font-medium hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="mt-1 font-semibold text-primary">{formatPrice(product.price)}</p>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-glow"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-secondary/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Your wishlist is empty</p>
            <p className="mt-2 text-muted-foreground">
              Save items you love by clicking the heart icon
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-glow"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
