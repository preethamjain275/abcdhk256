
import { useState, useEffect } from 'react';
import { Shield, CreditCard, Smartphone, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxePayGatewayProps {
  amount: number;
  orderId: string;
  onSuccess: (details: any) => void;
  onCancel: () => void;
}

export const LuxePayGateway = ({ amount, orderId, onSuccess, onCancel }: LuxePayGatewayProps) => {
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  const [processingStage, setProcessingStage] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | null>(null);

  const stages = [
    "Securing end-to-end connection...",
    "Contacting payment provider...",
    "Authorizing transaction...",
    "Finalizing secure tokens...",
    "Payment verified by bank."
  ];

  const handlePay = () => {
    if (!selectedMethod) return;
    setStep('processing');
  };

  useEffect(() => {
    if (step === 'processing') {
      let currentStage = 0;
      const interval = setInterval(() => {
        if (currentStage < stages.length - 1) {
          currentStage++;
          setProcessingStage(currentStage);
        } else {
          clearInterval(interval);
          setTimeout(() => setStep('success'), 800);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        onSuccess({
          gateway: 'LuxePay Platinum',
          transactionId: `LX-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          status: 'Authorized'
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, onSuccess]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-[3rem] bg-[#050505] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />

        {/* Header */}
        <div className="relative bg-gradient-to-b from-primary/20 to-transparent p-8 text-white border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary shadow-glow-sm">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <div>
                <span className="block text-sm font-black tracking-[0.2em] uppercase text-primary">LUXE PAY</span>
                <span className="block text-[10px] opacity-60 font-medium uppercase tracking-widest">Platinum Gateway</span>
              </div>
            </div>
            <button 
              onClick={onCancel} 
              className="rounded-full bg-white/5 p-2 hover:bg-white/10 transition-all hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mb-1">Total Payable</p>
              <span className="text-4xl font-display font-black tracking-tight italic">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mb-1">Transaction ID</p>
              <p className="font-mono text-[10px] font-bold tracking-tighter opacity-80">{orderId}</p>
            </div>
          </div>
        </div>

        <div className="p-8 relative">
          <AnimatePresence mode="wait">
            {step === 'method' && (
              <motion.div 
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] px-1 mb-4">Secured Payment Methods</p>
                  
                  <button 
                    onClick={() => setSelectedMethod('upi')}
                    className={`group w-full flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all ${selectedMethod === 'upi' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,159,0,0.2)]' : 'bg-white/[0.03] border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-colors ${selectedMethod === 'upi' ? 'bg-primary text-black' : 'bg-white/5 text-primary'}`}>
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-white group-hover:text-primary transition-colors">Unified UPI</p>
                      <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Bhim</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedMethod('card')}
                    className={`group w-full flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all ${selectedMethod === 'card' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,159,0,0.2)]' : 'bg-white/[0.03] border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-colors ${selectedMethod === 'card' ? 'bg-primary text-black' : 'bg-white/5 text-primary'}`}>
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-white group-hover:text-primary transition-colors">Premium Cards</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                  </button>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={handlePay}
                    disabled={!selectedMethod}
                    className="group relative w-full h-16 rounded-[2rem] bg-primary font-black text-black shadow-glow transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative flex items-center justify-center gap-2 uppercase tracking-widest italic">
                      Proceed to Secure Pay
                      <Shield className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center text-center"
              >
                <div className="relative mb-12">
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-32 w-32 rounded-full border-[6px] border-primary/10 border-t-primary" 
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="h-10 w-10 text-primary animate-pulse" />
                   </div>
                </div>
                
                <h3 className="text-2xl font-display font-black text-white mb-3">Safe Authentication</h3>
                
                <div className="h-10">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={processingStage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-primary font-bold tracking-wide italic"
                    >
                      {stages[processingStage]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-12 px-8 w-full">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary shadow-glow-sm"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6, ease: "easeInOut" }}
                    />
                  </div>
                </div>
                
                <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-black opacity-30">
                  Secured by 256-bit bank grade encryption
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="mb-10 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.3)] border-4 border-emerald-500/30"
                >
                  <CheckCircle2 className="h-14 w-14" />
                </motion.div>
                
                <h3 className="text-3xl font-display font-black text-white mb-2 tracking-tight">PAYMENT SUCCESS</h3>
                <p className="text-muted-foreground font-medium mb-12 italic">Transaction has been authorized successfully.</p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 text-left">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Status</p>
                    <p className="text-emerald-500 font-bold">Authorized</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 text-left">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Ref No.</p>
                    <p className="text-white font-mono text-xs font-bold">#LX-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-6 bg-white/[0.01] flex items-center justify-center gap-6 text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
           <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> PCI DSS SECURE</span>
           <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
           <span>TRUSTED BY 10M+ USERS</span>
        </div>
      </motion.div>
    </div>
  );
};
