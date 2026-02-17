import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  ChevronRight, 
  ArrowLeft, 
  User, 
  Heart, 
  PartyPopper, 
  Home as HomeIcon, 
  Smartphone, 
  Sparkles,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/currency';

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    icon: any;
    value: string;
    category?: string;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "Who are you shopping for?",
    options: [
      { label: "For Parents", icon: <User className="h-5 w-5" />, value: "parents" },
      { label: "For My Partner", icon: <Heart className="h-5 w-5" />, value: "partner" },
      { label: "For Kids", icon: <Sparkles className="h-5 w-5" />, value: "kids" },
      { label: "For Myself", icon: <ShoppingBag className="h-5 w-5" />, value: "self" },
    ]
  },
  {
    id: 2,
    text: "What's the occasion?",
    options: [
      { label: "Birthday", icon: <PartyPopper className="h-5 w-5" />, value: "birthday" },
      { label: "Housewarming", icon: <HomeIcon className="h-5 w-5" />, value: "housewarming" },
      { label: "Anniversary", icon: <Heart className="h-5 w-5" />, value: "anniversary" },
      { label: "Just Because", icon: <Sparkles className="h-5 w-5" />, value: "casual" },
    ]
  },
  {
    id: 3,
    text: "What's their primary interest?",
    options: [
      { label: "Tech & Gadgets", icon: <Smartphone className="h-5 w-5" />, value: "tech", category: "Electronics" },
      { label: "Home & Decor", icon: <HomeIcon className="h-5 w-5" />, value: "home", category: "Decor" },
      { label: "Fashion & Style", icon: <ShoppingBag className="h-5 w-5" />, value: "fashion", category: "Fashion" },
      { label: "Cooking/Kitchen", icon: <Sparkles className="h-5 w-5" />, value: "cooking", category: "Kitchen" },
    ]
  }
];

export default function GiftQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentStep].id]: value }));
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const getRecommendedCategory = () => {
    const q1 = answers[1];
    const q2 = answers[2];
    const q3 = answers[3];

    // Priority 1: Interest based
    if (q3 === 'tech') return "Electronics";
    if (q3 === 'cooking') return "Kitchen";
    if (q3 === 'home') return "Decor";
    if (q3 === 'fashion') return "Fashion";

    // Priority 2: Target based
    if (q1 === 'kids') return "Toys";
    if (q1 === 'parents') {
      if (q2 === 'housewarming') return "Decor";
      return "Appliances";
    }
    
    // Priority 3: Occasion based
    if (q2 === 'birthday') return "Jewelry";
    if (q2 === 'anniversary') return "Jewelry";
    if (q2 === 'housewarming') return "Home";

    return "Fashion"; // Fallback
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <Layout>
      <div className="relative min-h-[90vh] overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background flex flex-col items-center justify-center py-12 px-4">
        {/* Background Decor */}
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 left-[-5%] w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

        <div className="container max-w-4xl relative z-10">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div 
                key="quiz-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
              >
                {/* Progress Ring in corner */}
                <div className="absolute top-6 right-8 flex items-center gap-3">
                  <span className="text-xs font-black tracking-widest text-muted-foreground uppercase">Step {currentStep + 1}/{questions.length}</span>
                  <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mb-12">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary text-white mb-6 shadow-glow"
                  >
                    <Gift className="h-7 w-7" />
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
                    Gift Finder <span className="text-primary italic">Expert</span>
                  </h1>
                  <p className="text-muted-foreground mt-4 font-medium max-w-md">
                    Answer 3 quick questions and we'll reveal the perfect gift category for your needs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="md:col-span-2 mb-4"
                    >
                      <h2 className="text-2xl font-black tracking-tight">{questions[currentStep].text}</h2>
                    </motion.div>
                  </AnimatePresence>

                  {questions[currentStep].options.map((option, idx) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.03, backgroundColor: "var(--primary-foreground)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleOptionSelect(option.value)}
                      className="flex items-center gap-5 p-6 rounded-[2rem] bg-secondary/30 border border-border/50 hover:border-primary transition-all text-left group"
                    >
                      <div className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-lg block">{option.label}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Select option</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.button>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-border/20 flex items-center justify-between">
                  {currentStep > 0 ? (
                    <button 
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Go Back
                    </button>
                  ) : <div />}
                  
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-secondary'}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[4rem] p-12 md:p-20 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/40 blur-[60px] rounded-full animate-pulse" />
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative z-10"
                  >
                    <PartyPopper className="h-32 w-32 text-primary mx-auto drop-shadow-glow" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                    Perfect <span className="text-primary italic">Match!</span>
                  </h2>
                  <p className="text-muted-foreground text-xl font-medium">We've hand-picked the best selection for you in:</p>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="py-4 px-8 bg-primary/10 rounded-full inline-block border border-primary/20 backdrop-blur-md"
                  >
                    <span className="text-4xl md:text-6xl font-black text-primary tracking-tight">
                      {getRecommendedCategory()}
                    </span>
                  </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                  <Link 
                    to={`/products?category=${getRecommendedCategory()}`}
                    className="px-10 py-5 rounded-3xl bg-primary text-white font-black text-xl shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    Shop Now <ChevronRight className="h-6 w-6" />
                  </Link>
                  <button 
                    onClick={resetQuiz}
                    className="px-10 py-5 rounded-3xl bg-secondary text-foreground font-black text-xl flex items-center justify-center gap-3 hover:bg-secondary/80 hover:scale-105 transition-all"
                  >
                    <RefreshCw className="h-6 w-6" /> Retake
                  </button>
                </div>
                
                <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.3em] pt-8">
                  Powered by Shopsphere AI
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
