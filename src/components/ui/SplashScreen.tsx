import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); // 3 seconds as requested

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(20px)",
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#0F172A] overflow-hidden"
        >
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 opacity: [0.3, 0.5, 0.3]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[120px]" 
             />
          </div>

          <div className="relative">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ 
                duration: 1, 
                ease: "backOut",
                delay: 0.2
              }}
              className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-primary shadow-[0_0_80px_rgba(34,211,238,0.4)] border border-white/20"
            >
              <Sparkles className="h-16 w-16 text-white" />
              
              {/* Spinning Orbitals */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-primary/30 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-dotted border-secondary/20 rounded-full"
              />
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="flex flex-col items-center">
              <span className="font-display text-5xl font-black tracking-tighter text-white">SHOP</span>
              <span className="text-sm font-black tracking-[0.6em] text-primary -mt-2">SPHERE</span>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="h-1 w-1 rounded-full bg-primary" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Premium Hub</p>
               <div className="h-1 w-1 rounded-full bg-primary" />
            </div>
          </motion.div>

          {/* Loading Bar */}
          <div className="absolute bottom-20 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 2.5, ease: "easeInOut" }}
               className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_rgba(34,211,238,0.8)]"
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
