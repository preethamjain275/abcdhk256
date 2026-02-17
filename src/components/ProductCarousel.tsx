import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'featured';
  showNavigation?: boolean;
  className?: string;
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  variant = 'default',
  showNavigation = true,
  className,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  const cardWidth = variant === 'featured' ? 'w-[300px] md:w-[350px]' : 
                    variant === 'compact' ? 'w-[280px]' : 'w-[240px] md:w-[280px]';

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-10 flex items-end justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-widest">{subtitle}</p>
            )}
          </div>
          
          {/* Navigation Buttons */}
          {showNavigation && products.length > 3 && (
            <div className="hidden gap-3 md:flex">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={cn(
                  'h-14 w-14 rounded-2xl glass flex items-center justify-center transition-all duration-300',
                  canScrollLeft
                    ? 'hover:bg-primary hover:text-white border-white/20 shadow-lg'
                    : 'cursor-not-allowed opacity-20'
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={cn(
                  'h-14 w-14 rounded-2xl glass flex items-center justify-center transition-all duration-300',
                  canScrollRight
                    ? 'hover:bg-primary hover:text-white border-white/20 shadow-lg'
                    : 'cursor-not-allowed opacity-20'
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative -mx-4 px-4 md:-mx-8 md:px-8">
        <div
          ref={scrollRef}
          className="carousel-smooth scrollbar-hide flex gap-6 md:gap-10 overflow-x-auto pb-12 pt-4"
        >
          {products.map((product) => (
            <div key={product.id} className={cn('shrink-0 transition-transform duration-500 hover:scale-[1.02]', cardWidth)}>
              <ProductCard product={product} variant={variant} />
            </div>
          ))}
        </div>

        {/* Gradient Edges */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background via-background/60 to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background via-background/60 to-transparent" />
        )}
      </div>
    </div>
  );
}
