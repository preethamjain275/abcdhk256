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
        <div className="mb-6 flex items-end justify-between">
          <div>
            {title && (
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {/* Navigation Buttons */}
          {showNavigation && products.length > 3 && (
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={cn(
                  'rounded-full border border-border p-2 transition-all',
                  canScrollLeft
                    ? 'hover:border-primary hover:bg-primary hover:text-primary-foreground'
                    : 'cursor-not-allowed opacity-30'
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={cn(
                  'rounded-full border border-border p-2 transition-all',
                  canScrollRight
                    ? 'hover:border-primary hover:bg-primary hover:text-primary-foreground'
                    : 'cursor-not-allowed opacity-30'
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carousel */}
      <div className="relative -mx-4 px-4 md:-mx-6 md:px-6">
        <div
          ref={scrollRef}
          className="carousel-smooth scrollbar-hide flex gap-4 overflow-x-auto pb-4"
        >
          {products.map((product) => (
            <div key={product.id} className={cn('shrink-0', cardWidth)}>
              <ProductCard product={product} variant={variant} />
            </div>
          ))}
        </div>

        {/* Gradient Edges */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent md:w-20" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent md:w-20" />
        )}
      </div>
    </div>
  );
}
