import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Home, ShoppingBag, ShoppingCart, User, Bell, Sun, Moon, Search, Menu, X, LogIn, Gift, Settings, Sparkles, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            // Check for admin role (case-insensitive)
            const role = (data as any).role?.toUpperCase();
            setIsAdmin(role === 'ADMIN');
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false)
      }
    };
    checkAdmin();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  const navLinks = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/products", icon: ShoppingBag, label: "Explore" },
    { path: "/gift-finder", icon: Gift, label: "Gifts", highlight: true },
    { path: "/profile", icon: User, label: "Account" },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-6 z-50 container px-4 hidden md:block">
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="flex h-20 items-center justify-between px-8 rounded-3xl glass-dark border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-glow transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-white" />
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black tracking-tighter leading-none dark:text-white">SHOP</span>
              <span className="text-[10px] font-black tracking-[0.4em] text-primary">SPHERE</span>
            </div>
          </Link>

          {/* Search Bar - Expandable */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <motion.div 
               animate={{ width: isSearchFocused ? "100%" : "80%" }}
               className="relative group ml-auto"
            >
              <input 
                type="text" 
                placeholder="Search premium arsenal..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/10 focus:border-primary/50 outline-none transition-all duration-500 text-sm font-bold"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-primary transition-colors" />
            </motion.div>
          </form>

          {/* Links & Actions */}
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative text-[11px] font-black uppercase tracking-widest transition-all hover:text-primary group flex flex-col items-center gap-1",
                    location.pathname === link.path ? "text-primary" : "text-white/60",
                    (link as any).highlight && "text-amber-400"
                  )}
                >
                  <link.icon className={cn("h-4 w-4 transition-transform group-hover:-translate-y-1", (link as any).highlight && "animate-pulse")} />
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div layoutId="nav-pill" className="absolute -bottom-2 h-1 w-4 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-3 glass rounded-2xl hover:border-primary/50 transition-all hover:scale-110 active:scale-95"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                )}
              </button>

              <Link to="/cart" className="relative group p-3 glass rounded-2xl hover:border-primary/50 transition-colors">
                <ShoppingCart className="h-5 w-5 dark:text-white text-slate-700 group-hover:text-primary" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-white shadow-glow">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="p-3 glass rounded-2xl hover:border-primary/50 transition-all hover:scale-110 active:scale-95 group"
                  title="Admin Dashboard"
                >
                  <Shield className="h-5 w-5 text-amber-500 group-hover:animate-pulse" />
                </Link>
              )}
              
              {!user ? (
                <Link to="/auth" className="btn-primary py-3 scale-90 px-6">
                  Sign In
                </Link>
              ) : (
                <Link to="/profile" className="h-11 w-11 rounded-2xl border-2 border-primary/20 overflow-hidden hover:border-primary transition-colors">
                    <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-full h-full object-cover" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 h-20 glass border-b border-white/5 md:hidden px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-black italic tracking-tighter">SPHERE</span>
          </Link>

          <div className="flex items-center gap-4">
             <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black">{cartCount}</span>}
             </Link>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-20 left-0 right-0 glass-dark border-t border-white/5 p-8 space-y-4"
              >
                 {navLinks.map(link => (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-lg font-black uppercase tracking-widest text-white/70 hover:text-primary"
                    >
                       <link.icon className="h-6 w-6" />
                       {link.label}
                    </Link>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 h-16 glass-dark rounded-full border border-white/10 md:hidden px-8 flex items-center justify-around">
          {navLinks.slice(0, 4).map(link => (
             <Link key={link.path} to={link.path} className={cn("transition-colors", location.pathname === link.path ? "text-primary scale-110" : "text-white/40")}>
                <link.icon className="h-6 w-6" />
             </Link>
          ))}
      </nav>
    </>
  );
}
