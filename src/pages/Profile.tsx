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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { unreadCount, permissionStatus, requestPermission } = useNotifications();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Orders',
      items: [
        { icon: Package, label: 'My Orders', path: '/orders', badge: 2 },
        { icon: Receipt, label: 'Transactions', path: '/transactions' },
        { icon: Heart, label: 'Wishlist', path: '/wishlist' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
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
      <div className="container max-w-2xl py-8">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-8 w-8" />
          </div>
          <div>
            {user ? (
              <>
                <h1 className="font-display text-2xl font-bold">
                  {user.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold">Guest</h1>
                <p className="text-muted-foreground">Sign in for full access</p>
              </>
            )}
          </div>
        </div>

        {/* Sign In Prompt for guests */}
        {!user && (
          <div className="mb-8 rounded-2xl bg-card p-6">
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
        <div className="mb-8 rounded-2xl bg-card p-6">
          <h2 className="mb-4 font-semibold">Theme</h2>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                  theme === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-secondary hover:border-border'
                )}
              >
                <option.icon className={cn(
                  'h-6 w-6',
                  theme === option.value ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'text-sm font-medium',
                  theme === option.value ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Permission */}
        {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
          <div className="mb-8 rounded-2xl bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Enable Notifications</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get updates on orders, promotions, and more
                </p>
              </div>
              <button
                onClick={requestPermission}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Enable
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="mb-3 px-2 text-sm font-semibold text-muted-foreground">
              {section.title}
            </h2>
            <div className="overflow-hidden rounded-2xl bg-card">
              {section.items.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center justify-between p-4 transition-colors hover:bg-secondary/50',
                    index !== section.items.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && item.badge > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out (only show if logged in) */}
        {user && (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 p-4 font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        )}

        {/* Version */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Version 1.0.0
        </p>
      </div>
    </Layout>
  );
}
