
import { Layout } from '@/components/Layout';
import { ArrowRight, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <Layout>
      <div className="container py-12 md:py-20 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Redefining <span className="text-primary">Luxury</span> Commerce
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            LUXE Hub isn't just a marketplace; it's a curated experience for those who appreciate the finer things. Born in 2024, we set out to bridge the gap between premium quality and digital convenience.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-y border-border/50 py-12">
          {[
            { label: 'Happy Customers', value: '50k+' },
            { label: 'Premium Products', value: '2,000+' },
            { label: 'Cities Covered', value: '150+' },
            { label: 'Customer Rating', value: '4.9/5' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: ShieldCheck,
              title: 'Authenticity Guaranteed',
              desc: 'Every product is verified by our experts to ensure 100% genuine quality.',
            },
            {
              icon: Truck,
              title: 'Express Delivery',
              desc: 'Premium shipping partners ensure your orders arrive safely and on time.',
            },
            {
              icon: Clock,
              title: '24/7 Concierge',
              desc: 'Our dedicated support team is always available to assist you.',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-3xl p-8 hover:shadow-glow transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="relative rounded-3xl overflow-hidden bg-secondary/20 p-8 md:p-16 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                It started with a simple observation: online shopping lacked soul. We wanted to create a platform that felt less like a vending machine and more like a boutique.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Today, LUXE Hub connects thousands of discerning customers with the world's best brands, all wrapped in a technology-first experience that sets new standards for speed and security.
              </p>
              <Link to="/products" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                Explore Our Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" 
                alt="Workspace" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold mb-6">Join the Revolution</h2>
          <p className="text-muted-foreground mb-8">Experience the future of e-commerce today.</p>
          <Link
            to="/auth"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Sparkles className="h-4 w-4" />
            Get Started
          </Link>
        </div>
      </div>
    </Layout>
  );
}
