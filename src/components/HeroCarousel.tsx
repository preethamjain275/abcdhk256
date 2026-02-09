
import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import Autoplay from "embla-carousel-autoplay"

const heroSlides = [
  {
    id: 1,
    title: "MACBOOK AIR M2",
    subtitle: "Grand Electronics Days",
    description: "Starting from ₹84,990*",
    cta: "Buy Now",
    link: "/products?search=Macbook",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    gradient: "from-blue-600 to-indigo-800",
    highlightColor: "text-yellow-400"
  },
  {
    id: 2,
    title: "PREMIUM FASHION",
    subtitle: "New Season Arrivals",
    description: "Up to 50% Off on Top Brands",
    cta: "Explore",
    link: "/products?category=Fashion",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    gradient: "from-purple-600 to-pink-600",
    highlightColor: "text-white"
  },
  {
    id: 3,
    title: "MODERN HOME",
    subtitle: "Elevate Your Living",
    description: "Decor & Furniture starting ₹499",
    cta: "Shop Home",
    link: "/products?category=Home",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
    gradient: "from-orange-500 to-red-600",
    highlightColor: "text-yellow-200"
  }
]

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <section className="container py-6">
      <Carousel
        plugins={[plugin.current]}
        className="w-full relative group"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-r ${slide.gradient} shadow-2xl aspect-[21/9] md:aspect-[25/8]`}>
                <div className="absolute inset-0 flex items-center px-8 md:px-24">
                  <div className="max-w-xl text-white z-10">
                    <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {slide.subtitle}
                    </span>
                    <h1 className="font-display text-3xl md:text-6xl font-black leading-tight tracking-tighter mb-2">
                      {slide.title.split(' ').map((word, i) => (
                         <span key={i} className={i === 1 || i === 2 ? slide.highlightColor : ""}>{word} </span>
                      ))}
                    </h1>
                    <p className="mt-2 md:mt-4 text-sm md:text-xl font-medium opacity-90 max-w-sm md:max-w-none">
                      {slide.description}
                    </p>
                    <div className="mt-6 md:mt-8">
                        <Link to={slide.link}>
                            <Button className="bg-white text-black hover:bg-white/90 font-black px-8 py-6 rounded-xl shadow-xl transition-all hover:scale-105">
                                {slide.cta}
                            </Button>
                        </Link>
                    </div>
                  </div>
                  <div className="hidden md:block absolute right-4 lg:right-24 top-1/2 -translate-y-1/2 w-1/3 lg:w-1/3 animate-in zoom-in-95 duration-1000 delay-300">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
                    />
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Carousel>
    </section>
  )
}
