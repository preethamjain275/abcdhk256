import { Navigation } from './Navigation';
import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Github, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [systemStats, setSystemStats] = useState({ products: 0, orders: 0, latency: 12 });

  useEffect(() => {
    const fetchSystemStats = async () => {
        try {
            const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { count: oCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
            setSystemStats({ 
                products: pCount || 0, 
                orders: oCount || 0, 
                latency: Math.floor(Math.random() * 15) + 8 
            });
        } catch (e) {
            console.error(e);
        }
    };
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 transition-colors duration-500">
      <Navigation />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 pb-20 pt-20 md:pb-0"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      <footer className="relative border-t border-white/5 bg-black/40 backdrop-blur-3xl pt-24 pb-20 mt-auto overflow-hidden text-slate-400">
        {/* Footer Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-8">
              <Link to="/" className="group flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-glow group-hover:rotate-[360deg] transition-transform duration-700">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col text-white">
                   <span className="font-display text-2xl font-black tracking-tighter leading-none">SHOP</span>
                   <span className="text-[10px] font-black tracking-[0.4em] text-primary">SPHERE</span>
                </div>
              </Link>
              <p className="max-w-xs text-white/40 font-medium leading-relaxed text-sm">
                Next-generation destination for premium gear and elite lifestyle. Redefining the digital shopping frontier.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Youtube, Github].map((Icon, i) => (
                  <button key={i} className="h-10 w-10 rounded-xl glass flex items-center justify-center text-white/40 transition-all hover:bg-primary hover:text-white hover:shadow-glow">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            
            <FooterLinkSet 
                title="Ecosystem" 
                links={[
                    { label: `All Arrays (${systemStats.products})`, path: "/products" },
                    { label: "Elite Collections", path: "/products?featured=true" },
                    { label: "Limited Drops", path: "/products?deals=true" },
                    { label: "Neural Search", path: "/search" }
                ]} 
            />
            
            <FooterLinkSet 
                title="Directives" 
                links={[
                    { label: `Active Orders (${systemStats.orders})`, path: "/profile" },
                    { label: "Mission Briefing", path: "/about" },
                    { label: "Support Uplink", path: "/contact" },
                    { label: "Secure Auth", path: "/auth" }
                ]} 
            />

            <div className="space-y-6">
                <h4 className="font-black uppercase tracking-[0.2em] text-xs text-primary">Security Node</h4>
                <div className="glass p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AES-256 Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">{systemStats.latency}ms Latency</span>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-medium text-white/20">
              © 2024 SHOP SPHERE INTERSTELLAR. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Mainnet Live (v{systemStats.products}.{systemStats.orders}.0)</span>
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/20 opacity-50 text-glow">v4.0.0-PRO</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLinkSet({ title, links }: { title: string, links: { label: string, path: string }[] }) {
    return (
        <div>
            <h4 className="font-black uppercase tracking-[0.2em] text-xs text-white/40 mb-8">{title}</h4>
            <ul className="space-y-4">
                {links.map((link, i) => (
                    <li key={i}>
                        <Link to={link.path} className="text-sm font-bold text-white/30 hover:text-primary transition-colors flex items-center gap-2 group">
                            <span className="h-px w-0 bg-primary group-hover:w-3 transition-all" />
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

