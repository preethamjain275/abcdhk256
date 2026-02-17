
import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Link } from "react-router-dom"
import Autoplay from "embla-carousel-autoplay"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"

const heroSlides = [
  {
    id: 1,
    title: "MACBOOK \n AIR M3",
    subtitle: "New Release 2024",
    description: "Experience the ultimate power. Starting from ₹1,14,900*",
    cta: "Order Now",
    link: "/products?search=Macbook",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    color: "from-blue-500/20",
    accent: "text-blue-400"
  },
  {
    id: 2,
    title: "LUXURY \n TIMEPIECES",
    subtitle: "Limited Edition",
    description: "Timeless elegance for the modern connoisseur.",
    cta: "Explore Collection",
    link: "/products?category=Fashion",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    color: "from-amber-500/20",
    accent: "text-amber-400"
  },
  {
    id: 3,
    title: "STUDIO \n SOUND",
    subtitle: "Precision Audio",
    description: "Immerse yourself in pure, unadulterated sound.",
    cta: "Shop Audio",
    link: "/products?category=Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    color: "from-purple-500/20",
    accent: "text-purple-400"
  }
]

export function HeroCarousel() {
  const [api, setApi] = React.useState<any>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <Carousel
      setApi={setApi}
      plugins={[Autoplay({ delay: 8000 })]}
      className="w-full relative h-[70vh] md:h-[80vh] overflow-hidden rounded-[3rem]"
    >
      <CarouselContent className="h-full">
        {heroSlides.map((slide, index) => (
          <CarouselItem key={slide.id} className="relative h-full">
            <div className={`relative w-full h-full bg-slate-950 flex items-center overflow-hidden`}>
              {/* Animated Background Mesh */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} to-transparent opacity-50`} />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              
              <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={current === index ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <span className="h-[1px] w-12 bg-primary" />
                    <span className="text-primary font-black uppercase tracking-[0.4em] text-xs md:text-sm">
                      {slide.subtitle}
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={current === index ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] whitespace-pre-line"
                  >
                    {slide.title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={current === index ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-sm md:text-xl text-white/50 font-medium max-w-md leading-relaxed"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={current === index ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="pt-4"
                  >
                    <Link
                      to={slide.link}
                      className="btn-primary inline-flex items-center gap-3 px-10 py-5 group"
                    >
                      {slide.cta}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                  </motion.div>
                </div>

                <div className="hidden lg:block relative">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                     animate={current === index ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                     transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                     className="relative z-10"
                   >
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        className="w-full h-auto object-contain drop-shadow-[0_45px_100px_rgba(0,0,0,0.6)]"
                      />
                   </motion.div>
                   
                   {/* Decorative background element for image */}
                   <motion.div 
                     animate={{ 
                       scale: [1, 1.2, 1],
                       rotate: [0, 90, 0],
                     }}
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10"
                   >
                      <div className={`w-full h-full bg-gradient-to-r ${slide.color} to-transparent rounded-full blur-[120px] opacity-30`} />
                   </motion.div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Navigation Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
         {heroSlides.map((_, i) => (
           <button 
             key={i} 
             onClick={() => api?.scrollTo(i)}
             className={`h-1.5 transition-all duration-500 rounded-full ${current === i ? 'w-12 bg-primary shadow-glow' : 'w-2 bg-white/20 hover:bg-white/40'}`}
           />
         ))}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-8 md:flex hidden">
         <CarouselPrevious className="relative translate-y-0 h-14 w-14 glass text-white border-white/5 hover:bg-primary" />
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-8 md:flex hidden">
         <CarouselNext className="relative translate-y-0 h-14 w-14 glass text-white border-white/5 hover:bg-primary" />
      </div>

    </Carousel>
  )
}
