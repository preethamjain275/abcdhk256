import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ProductCarousel } from '@/components/ProductCarousel';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ProductCard } from '@/components/ProductCard';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { recommendationService } from '@/services/recommendationService';
import { ArrowRight, Timer, CheckCircle, Truck, Shield, RefreshCw, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getTimeLeft } from '@/lib/time';

const categories = [
  { name: 'Electronics', icon: '🔋', color: 'bg-blue-500' },
  { name: 'Fashion', icon: '👔', color: 'bg-pink-500' },
  { name: 'Home', icon: '🛋️', color: 'bg-orange-500' },
  { name: 'Appliances', icon: '⚡', color: 'bg-purple-500' },
  { name: 'Grocery', icon: '🍎', color: 'bg-green-500' },
  { name: 'Beauty', icon: '✨', color: 'bg-red-500' },
  { name: 'Toys', icon: '🎮', color: 'bg-yellow-500' },
  { name: 'Books', icon: '📖', color: 'bg-cyan-500' },
  { name: 'Mobiles', icon: '📱', color: 'bg-indigo-500' },
  { name: 'Laptops', icon: '💻', color: 'bg-slate-700' },
  { name: 'Footwear', icon: '👟', color: 'bg-amber-600' },
  { name: 'Kitchen', icon: '🍳', color: 'bg-orange-600' },
  { name: 'Jewelry', icon: '💍', color: 'bg-emerald-500' },
  { name: 'Sports', icon: '🏆', color: 'bg-lime-600' },
  { name: 'Travel', icon: '✈️', color: 'bg-sky-500' },
  { name: 'Decor', icon: '🕯️', color: 'bg-rose-500' },
];

export default function Home() {
  const { recentlyViewed } = useRecentlyViewed();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [dealsOfTheDay, setDealsOfTheDay] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState('12h 45m 22s');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [featured, best, trend, recommended, deals] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getBestsellers(),
          recommendationService.getTrendingProducts(),
          recommendationService.getPersonalizedRecommendations(),
          productService.getDealsOfTheDay(),
        ]);
        setFeaturedProducts(featured);
        setBestsellers(best);
        setTrendingProducts(trend);
        setRecommendations(recommended);
        setDealsOfTheDay(deals);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (dealsOfTheDay.length > 0 && dealsOfTheDay[0].dealExpiresAt) {
        setTimeLeft(getTimeLeft(dealsOfTheDay[0].dealExpiresAt));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dealsOfTheDay]);

  return (
    <Layout>
      {/* Category Bar */}
      <div className="bg-card border-b border-border/50 sticky top-14 md:top-16 z-30 overflow-x-auto scrollbar-hide">
        <div className="container py-4 flex justify-between gap-6 md:gap-8 min-w-max">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/products?category=${cat.name}`}
              className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
            >
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm transition-colors group-hover:shadow-md", cat.color, "bg-opacity-10 text-opacity-100")}>
                <span className="drop-shadow-sm">{cat.icon}</span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Filters / Chips - Meeso/Flipkart Style */}
      <div className="bg-background border-b border-border/50 overflow-x-auto scrollbar-hide py-2">
        <div className="container flex gap-3 min-w-max">
          {[
            { label: 'Fast Delivery', query: 'category=Electronics' },
            { label: 'Top Rated', query: 'sortBy=rating' },
            { label: 'Under ₹499', query: 'maxPrice=499' },
            { label: 'New Arrivals', query: 'sortBy=newest' },
            { label: 'Clearance Sale', query: 'maxPrice=1000&sortBy=price_asc' },
            { label: 'Combo Offers', query: 'search=Combo' }
          ].map((filter) => (
            <Link 
              key={filter.label} 
              to={`/products?${filter.query}`}
              className="px-4 py-1.5 rounded-full border border-border text-xs font-bold hover:bg-primary hover:text-white transition-all bg-card"
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Banner Slider Section */}
      <HeroCarousel />

      {/* Deals of the Day */}
      <section className="container py-12">
        <div className="rounded-[2.5rem] bg-card p-6 md:p-10 border border-border/50 shadow-sm">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Timer className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Deals of the Day</h2>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                    Ending in: {timeLeft}
                  </span>
                </div>
              </div>
            </div>
            <Link to="/products" className="text-primary font-bold hover:underline group flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ProductCarousel products={dealsOfTheDay.length > 0 ? dealsOfTheDay : trendingProducts} variant="default" showNavigation />
        </div>
      </section>

      {/* Featured Collection */}
      <section className="container py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Premium Finds</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Season's Top Picks</h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 font-bold text-primary transition-all hover:gap-3 hidden md:flex">
            Explore All
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <ProductCarousel
          products={featuredProducts}
          variant="featured"
          showNavigation
        />
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border/50 bg-secondary/20 py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹999' },
              { icon: Shield, title: 'Secure Payment', desc: '100% safe gateway' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '7 days return policy' },
              { icon: ShoppingBag, title: 'Original Products', desc: 'Direct from brands' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <div className="rounded-2xl bg-background p-3 shadow-sm border border-border/50">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-sm">{stat.title}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Grid */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Our Favorites</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Trending Bestsellers</h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/30" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {bestsellers.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link 
            to="/products"
            className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-primary/20 px-12 text-lg font-bold text-primary transition-all hover:bg-primary hover:text-white"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Recommendations & Recently Viewed */}
      {(recommendations.length > 0 || recentlyViewed.length > 0) && (
        <section className="bg-secondary/10 py-16">
          <div className="container space-y-16">
            {recommendations.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-2">
                  <div className="h-8 w-1 rounded-full bg-primary" />
                  <h2 className="font-display text-2xl font-bold">Just For You</h2>
                </div>
                <ProductCarousel products={recommendations} variant="compact" showNavigation />
              </div>
            )}
            
            {recentlyViewed.length > 0 && (
              <div>
                <div className="mb-8 flex items-center gap-2">
                  <div className="h-8 w-1 rounded-full bg-primary" />
                  <h2 className="font-display text-2xl font-bold">Recently Viewed</h2>
                </div>
                <ProductCarousel products={recentlyViewed} variant="compact" showNavigation />
              </div>
            )}
          </div>
        </section>
      )}

      {/* App Download / Newsletter Mockup */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-[3rem] bg-primary p-12 text-center text-primary-foreground md:p-20 shadow-2xl">
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="font-display text-4xl font-bold md:text-6xl">
              Shop on the Go!
            </h2>
            <p className="mt-6 text-xl opacity-90">
              Download the Luxe app for exclusive app-only deals <br className="hidden md:block" /> and faster checkouts.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-black transition-transform hover:scale-105">
                <span className="text-left">
                  <p className="text-[10px] font-bold uppercase opacity-60">Get it on</p>
                  <p className="text-lg font-bold">Google Play</p>
                </span>
              </button>
              <button className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-black transition-transform hover:scale-105">
                <span className="text-left">
                  <p className="text-[10px] font-bold uppercase opacity-60">Download on</p>
                  <p className="text-lg font-bold">App Store</p>
                </span>
              </button>
            </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>
    </Layout>
  );
}
