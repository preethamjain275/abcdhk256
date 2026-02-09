import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Home, ShoppingBag, ShoppingCart, User, Bell, Sun, Moon, Search, Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/products", icon: ShoppingBag, label: "Explore" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { path: "/profile", icon: User, label: "Account" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <header className="fixed left-0 right-0 top-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur-md md:block">
        <div className="container flex h-16 items-center gap-8">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow transition-transform group-hover:scale-110">
              <span className="font-display text-xl font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-display text-2xl font-black tracking-tighter">LUXE</span>
          </Link>

          {/* Search Bar - Amazon/Flipkart Style */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-12 rounded-lg border border-border bg-secondary/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <button type="submit" className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 text-xs font-bold transition-all hover:text-primary",
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="h-6 w-px bg-border/50" />

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-primary active:scale-90"
              >
                {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link
                to="/notifications"
                className="relative rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-primary"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            {!user && (
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:scale-105 active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-base font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-display text-lg font-semibold">Luxe</span>
          </Link>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground">
              {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-muted-foreground">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-border bg-background p-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
                {link.badge && link.badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
        <div className="flex items-center justify-around py-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2",
                location.pathname === link.path ? "text-primary" : "text-muted-foreground",
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
              {link.badge && link.badge > 0 && (
                <span className="absolute right-2 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
