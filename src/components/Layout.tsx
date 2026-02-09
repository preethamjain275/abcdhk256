import { Navigation } from './Navigation';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Github } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pb-20 pt-14 md:pb-0 md:pt-16 animate-fade-in">
        {children}
      </main>
      
      <footer className="border-t border-border bg-card/50 pt-16 pb-24 md:pb-16 mt-auto">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="font-display text-base font-bold text-primary-foreground">L</span>
                </div>
                <span className="font-display text-xl font-bold tracking-tight">LUXE</span>
              </Link>
              <p className="max-w-xs text-muted-foreground leading-relaxed">
                India's most loved destination for premium fashion and lifestyle. Redefining elegance since 2024.
              </p>
              <div className="mt-8 flex gap-4">
                {[Facebook, Instagram, Twitter, Youtube, Github].map((Icon, i) => (
                  <button key={i} className="rounded-full bg-background p-2.5 text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-display text-lg font-bold mb-6">Shop</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/products" className="hover:text-primary transition-colors">All Collections</Link></li>
                <li><Link to="/products?category=Shirts" className="hover:text-primary transition-colors">Men's Apparel</Link></li>
                <li><Link to="/products?category=Footwear" className="hover:text-primary transition-colors">Footwear</Link></li>
                <li><Link to="/products?category=Bags" className="hover:text-primary transition-colors">Accessories</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 LUXE Hub. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Server Status: Live</span>
              <span>v2.4.1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
