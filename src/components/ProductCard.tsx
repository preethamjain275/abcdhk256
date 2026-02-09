import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { ShoppingCart, Star, Heart, Share2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCard({ product, className, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const handleClick = () => {
    addToRecentlyViewed(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (variant === 'compact') {
    return (
      <Link
        to={`/product/${product.id}`}
        onClick={handleClick}
        className={cn(
          'group flex gap-3 rounded-lg bg-card p-3 transition-all hover:bg-secondary/50',
          className
        )}
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h4 className="truncate text-sm font-medium">{product.name}</h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{product.rating}</span>
          </div>
          <p className="price-tag text-sm">{formatPrice(product.price)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        to={`/product/${product.id}`}
        onClick={handleClick}
        className={cn(
          'group relative block overflow-hidden rounded-2xl bg-card product-card-hover',
          className
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {discount > 0 && (
              <span className="rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                -{discount}%
              </span>
            )}
            {product.bestseller && (
              <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                Bestseller
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="rounded-full bg-background/90 p-2 backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="rounded-full bg-background/90 p-2 backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mb-2 font-display text-lg font-medium leading-tight">
            {product.name}
          </h3>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="price-tag text-xl">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/product/${product.id}`}
      onClick={handleClick}
      className={cn(
        'group relative block overflow-hidden rounded-xl bg-card border border-border/40 transition-all hover:shadow-xl hover:border-primary/20',
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white group-hover:bg-secondary/10 transition-colors flex items-center justify-center p-4">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=800'; // Sleek package fallback
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 w-full h-full">
             <ShoppingBag className="h-10 w-10 opacity-20 mb-2" />
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Image</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {product.dealOfTheDay && (
            <span className="rounded-sm bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md animate-pulse">
              DEAL OF THE DAY
            </span>
          )}
          {discount > 20 && (
            <span className="rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.bestseller && (
            <span className="rounded-sm bg-[#ff9f00] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="rounded-full bg-white/90 p-1.5 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Mock share
              toast.success('Link copied to clipboard!');
            }}
            className="rounded-full bg-white/90 p-1.5 text-muted-foreground shadow-sm transition-colors hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 translate-y-4 rounded-lg bg-primary p-2 text-white opacity-0 shadow-lg transition-all duration-300 hover:bg-primary/90 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <h3 className="mb-1 line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mb-2 flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-sm bg-success px-1 py-0.5 text-[10px] font-bold text-white">
            <span>{product.rating}</span>
            <Star className="h-2.5 w-2.5 fill-current" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
          {product.featured && (
             <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Plus" className="h-3 ml-auto opacity-80" />
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <>
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
              <span className="text-xs font-bold text-success">{discount}% off</span>
            </>
          )}
        </div>
        
        <p className="mt-1 text-[10px] font-medium text-muted-foreground">
          Free delivery
        </p>
      </div>
    </Link>
  );
}
