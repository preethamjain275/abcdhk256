import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { Star, Heart, ShoppingBag, Plus, Eye, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCard({ product, className, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} joined your arsenal`, {
        icon: <Zap className="h-4 w-4 text-primary" />,
        style: { 
            background: 'rgba(10, 15, 30, 0.95)', 
            color: '#fff', 
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)'
        }
    });
  };

  const [isInWishlist, setIsInWishlist] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
    toast(isInWishlist ? "Removed from wishlist" : "Added to wishlist", {
      icon: <Heart className={cn("h-4 w-4", !isInWishlist ? "fill-red-500 text-red-500" : "")} />,
    });
  };

  const handleClick = () => {
    addToRecentlyViewed(product);
  };

  if (variant === 'compact') {
    return (
      <Link
        to={`/product/${product.id}`}
        onClick={handleClick}
        className={cn(
          'group flex gap-4 rounded-2xl glass p-3 transition-all hover:bg-white/10',
          className
        )}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/150'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h4 className="truncate text-sm font-bold">{product.name}</h4>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="font-black">{product.rating}</span>
          </div>
          <p className="text-primary font-black">{formatPrice(product.price)}</p>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn("group relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/product/${product.id}`}
        onClick={handleClick}
        className="premium-card block relative z-10"
      >
        <div className="relative aspect-square overflow-hidden bg-white/5">
          {/* Main Product Image - Simplified for performance */}
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Luxury Badges */}
          <div className="absolute left-4 top-4 flex flex-col gap-2 z-20">
            {discount > 0 && (
              <span className="bg-destructive text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                -{discount}% DROP
              </span>
            )}
            {product.bestseller && (
              <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-glow">
                ELITE
              </span>
            )}
          </div>

          {/* Quick Action Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-20">
             <div className="flex gap-2">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary h-12 text-[10px] font-black flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> SECURE DEAL
                </button>
             </div>
          </div>

          <button 
            onClick={toggleWishlist}
            className="absolute right-4 top-4 h-10 w-10 glass rounded-full flex items-center justify-center text-white/40 hover:text-red-500 transition-all z-20"
          >
             <Heart className={cn("h-5 w-5", isInWishlist ? "fill-red-500 text-red-500" : "")} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
               <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{product.category}</p>
               <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-black">{product.rating}</span>
               </div>
            </div>
            <h3 className="font-bold text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1">
              {product.originalPrice && (
                <p className="text-[10px] text-white/30 line-through font-bold">{formatPrice(product.originalPrice)}</p>
              )}
              <p className="text-xl font-black tracking-tight">{formatPrice(product.price)}</p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Decorative Glow - Only shows on hover, simplified */}
      <div className="absolute -inset-2 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-0 pointer-events-none" />
    </motion.div>
  );
}
