import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User,
  Receipt,
  Bell,
  Heart,
  Settings,
  LogOut,
  LogIn,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Package,
  CreditCard,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { unreadCount, permissionStatus, requestPermission } = useNotifications();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Zort',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
    'https://api.dicebear.com/7.x/micah/svg?seed=Nico',
    'https://api.dicebear.com/7.x/big-ears/svg?seed=Buddy',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=Joy',
  ];

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data && (data as any).role?.toUpperCase() === 'ADMIN') {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();
  }, [user]);

  const updateAvatar = async (avatarUrl: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      
      if (error) throw error;
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl } as any)
          .eq('id', user.id);
      }
      
      toast.success('Visual identity updated', {
          icon: <Zap className="h-4 w-4 text-primary" />
      });
      setIsAvatarModalOpen(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const menuItems: any[] = [
    {
      title: 'Orders',
      items: [
        { icon: Package, label: 'My Orders', path: '/orders', badge: 2 },
        { icon: Receipt, label: 'Transactions', path: '/transactions' },
        { icon: Heart, label: 'Wishlist', path: '/wishlist' },
      ],
    },
    {
      title: 'Management',
      items: [
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
        ...(isAdmin ? [{ icon: Settings, label: 'Admin Panel', path: '/admin', highlight: true }] : []),
        { icon: CreditCard, label: 'Payment Methods', path: '/payment' },
        { icon: Settings, label: 'Account Settings', path: '/settings' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', path: '/help' },
      ],
    },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <Layout>
      <div className="container max-w-2xl py-8 pb-24">
        {/* Profile Header */}
        <div className="mb-12 flex items-center gap-6 group">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/10 ring-4 ring-primary/20 transition-all group-hover:ring-primary/40 flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
            </div>
            {user && (
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-4 border-background"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
          </div>
          <div>
            {user ? (
              <>
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-muted-foreground font-medium">{user.email}</p>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold">Guest</h1>
                <p className="text-muted-foreground">Log in to sync your profile</p>
              </>
            )}
          </div>
        </div>

        {/* Avatar Selection Modal */}
        <AnimatePresence>
          {isAvatarModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
              >
                <button 
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bell className="h-6 w-6 rotate-45" />
                </button>
                
                <h2 className="text-2xl font-bold mb-2 font-display">Select Avatar</h2>
                <p className="text-muted-foreground mb-6">Choose your visual identity.</p>
                
                <div className="grid grid-cols-5 gap-4">
                  {avatars.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => updateAvatar(url)}
                      className="aspect-square rounded-2xl overflow-hidden hover:scale-110 active:scale-95 transition-all border-2 border-transparent hover:border-primary bg-secondary"
                    >
                      <img src={url} className="w-full h-full object-cover" alt={`Avatar ${i}`} />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Sections */}
        <div className="space-y-8">
          {/* Sign In Prompt for guests */}
          {!user && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">Sign in to your account</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Access your orders, wishlist, and more
                  </p>
                </div>
                <Link
                  to="/auth"
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">Theme Settings</h2>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    theme === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-secondary/50 hover:bg-secondary'
                  )}
                >
                  <option.icon className={cn(
                    'h-6 w-6',
                    theme === option.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-xs font-bold uppercase tracking-wider',
                    theme === option.value ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          {menuItems.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 px-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 font-display">
                {section.title}
              </h2>
              <div className="overflow-hidden rounded-2xl bg-card border border-border shadow-sm">
                {section.items.map((item: any, index: number) => {
                  const isExternal = item.path === '/admin';
                  const content = (
                    <div 
                      className={cn(
                        'flex items-center justify-between p-4 transition-all hover:bg-secondary/50 cursor-pointer',
                        index !== section.items.length - 1 && 'border-b border-border',
                        item.highlight && "bg-primary/[0.03]"
                      )}
                      onClick={isExternal ? () => window.location.href = '/admin' : undefined}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center",
                            item.highlight ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className={cn("font-semibold", item.highlight && "text-primary")}>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.badge && item.badge > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    </div>
                  );
                  
                  return isExternal ? (
                    <div key={item.path}>{content}</div>
                  ) : (
                    <Link key={item.path} to={item.path}>{content}</Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sign Out */}
          {user && (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-destructive/5 p-5 font-bold text-destructive transition-all hover:bg-destructive/10 active:scale-95"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          )}

          {/* Version */}
          <div className="pt-8 text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 font-display">
              Shopsphere Hub OS v1.0.42
            </p>
            <p className="text-[8px] text-muted-foreground/20 italic">
              Experience engineered for excellence
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
