import { useEffect, useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { ProductCarousel } from '@/components/ProductCarousel';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ProductCard } from '@/components/ProductCard';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { recommendationService } from '@/services/recommendationService';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Timer, ShoppingBag, Zap, Sparkles, Globe, ShieldCheck, Heart } from 'lucide-react';
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
];

const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-primary/20"
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        opacity: Math.random() * 0.5
                    }}
                    animate={{ 
                        y: [null, Math.random() * -100 - 50 + "%"],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{ 
                        duration: Math.random() * 10 + 10, 
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default function Home() {
  const { recentlyViewed } = useRecentlyViewed();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [dealsOfTheDay, setDealsOfTheDay] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState('12h 45m 22s');
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [featured, best, trend, deals] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getBestsellers(),
          recommendationService.getTrendingProducts(),
          productService.getDealsOfTheDay(),
        ]);
        setFeaturedProducts(featured || []);
        setBestsellers(best || []);
        setTrendingProducts(trend || []);
        setDealsOfTheDay(deals || []);
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
      <div ref={containerRef} className="relative premium-gradient min-h-screen">
        <FloatingParticles />
        
        {/* Animated Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse-glow" />
           <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[150px] animate-pulse-glow delay-1000" />
           <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[150px] animate-pulse-glow delay-2000" />
        </div>

        {/* Fullscreen Hero Section */}
        <motion.section 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative min-h-[90vh] flex flex-col justify-center"
        >
          <div className="container">
            <HeroCarousel />
          </div>
        </motion.section>

        {/* Scroll Indicator */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Scroll to Explore</span>
            <div className="h-10 w-6 rounded-full border border-white/20 p-1">
                <motion.div 
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-2 w-full bg-primary rounded-full" 
                />
            </div>
        </motion.div>

        {/* Content Container */}
        <div className="relative z-10 container space-y-32 pb-32 pt-20">
          
          {/* Quick Stats / Trust Bar */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, label: "Fastest Shipping", sub: "Under 24h delivery" },
              { icon: ShieldCheck, label: "Secure Payment", sub: "AES-256 encryption" },
              { icon: Globe, label: "Global Source", sub: "Verified world brands" },
              { icon: Heart, label: "Premium Care", sub: "24/7 dedicated support" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 group"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white shadow-glow">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">{item.label}</h3>
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-1">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Futuristic Categories */}
          <section className="space-y-12">
            <div className="flex flex-col items-center text-center space-y-4">
               <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="badge-premium"
               >
                 World Class Selection
               </motion.span>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Explore <span className="gradient-text italic">Universes</span></h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={`/products?category=${cat.name}`}
                    className="group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] glass border-white/[0.05] hover:border-primary/50 transition-all hover:bg-white/[0.08]"
                  >
                    <div className={cn("text-3xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12")}>
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* High Impact Flash Deals */}
          {dealsOfTheDay.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-[4rem]"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 opacity-50" />
               <div className="glass p-10 md:p-20 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
                    <div className="space-y-4 text-center md:text-left">
                       <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-destructive/20 scale-110">
                          <Timer className="h-3 w-3 animate-pulse" />
                          Limited Drop
                       </div>
                       <h2 className="text-5xl md:text-7xl font-black tracking-tighter shadow-sm text-balance leading-none">
                          FLASH <br /> <span className="text-destructive font-black text-glow">DEALS</span>
                       </h2>
                       <p className="text-white/50 text-base md:text-lg max-w-sm">
                          Handpicked selection of premium gear at liquidator prices. 
                          <span className="block mt-2 font-bold text-white">Expires in: {timeLeft}</span>
                       </p>
                    </div>
                    <Link to="/products" className="btn-primary group">
                      Hunt All Deals 
                      <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-2" />
                    </Link>
                  </div>
                  <ProductCarousel products={dealsOfTheDay} variant="default" showNavigation />
               </div>
            </motion.section>
          )}

          {/* Curated Collections with Cinematic Hover */}
          <section className="space-y-16">
            <div className="flex items-end justify-between px-4">
              <div className="space-y-4">
                <span className="badge-premium border-primary/20 text-primary">Prestige selection</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Curated <span className="gradient-text">Masterpieces</span></h2>
              </div>
              <Link to="/products" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors">
                View Gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductCarousel
              products={featuredProducts}
              variant="featured"
              showNavigation
            />
          </section>

          {/* Bestsellers Grid / Trending Items */}
          <section className="space-y-16">
             <div className="flex flex-col items-center text-center space-y-4">
                <span className="badge-premium">Live Inventory Status</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Most <span className="text-glow italic">Wanted</span> Right Now</h2>
             </div>
             <div className="grid grid-cols-2 gap-6 md:gap-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {bestsellers.slice(0, 10).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 5) * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
             </div>
             <div className="text-center">
                <Link to="/products" className="btn-primary px-16 h-18 text-lg font-black tracking-widest">
                  Browse Full Arsenal
                </Link>
             </div>
          </section>

          {/* Brand Promise Section - High Fidelity */}
          <section className="grid md:grid-cols-2 gap-8 items-center overflow-hidden">
             <motion.div 
               initial={{ x: -100, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               className="space-y-10 order-2 md:order-1"
             >
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                   THE <br className="hidden md:block" /> <span className="gradient-text italic">SHOPSPHERE</span> <br /> DIFFERENCE.
                </h2>
                <div className="space-y-8">
                   <PromiseItem 
                      title="AI-Curated Selection" 
                      desc="Our neural network scans 500+ global brands daily to source only the highest-rated premium gear." 
                   />
                   <PromiseItem 
                      title="Verification Guaranteed" 
                      desc="Every item undergoes a 12-point authentication process before entering our master inventory." 
                   />
                </div>
                <button className="btn-secondary group">
                   Learn Our Process
                   <Globe className="ml-3 h-5 w-5 inline transition-transform group-hover:rotate-180 duration-1000" />
                </button>
             </motion.div>
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               className="relative order-1 md:order-2"
             >
                <div className="aspect-square glass rounded-[4rem] animate-float flex items-center justify-center p-20 shadow-glow overflow-hidden">
                    <Sparkles className="h-full w-full text-primary/20 absolute -z-10 animate-pulse-glow" />
                    <ShoppingBag className="h-full w-full text-white drop-shadow-2xl" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-secondary/20 blur-3xl animate-pulse delay-1000" />
             </motion.div>
          </section>

        </div>
      </div>
    </Layout>
  );
}

function PromiseItem({ title, desc }: { title: string, desc: string }) {
   return (
      <div className="group space-y-2">
         <h4 className="text-xl font-black flex items-center gap-3">
            <span className="h-1 w-8 bg-primary rounded-full group-hover:w-12 transition-all" />
            {title}
         </h4>
         <p className="text-white/40 text-sm font-medium leading-relaxed ml-11 max-w-sm group-hover:text-white/60 transition-colors">
            {desc}
         </p>
      </div>
   );
}
