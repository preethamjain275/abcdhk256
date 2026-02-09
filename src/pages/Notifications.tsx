import { Layout } from '@/components/Layout';
import { useNotifications } from '@/contexts/NotificationContext';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Package,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/types';

const notificationIcons: Record<NotificationType, typeof Bell> = {
  order_placed: Check,
  order_update: Package,
  cart_abandonment: ShoppingCart,
  promotion: Tag,
  general: Bell,
};

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    permissionStatus,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    simulateOrderUpdate,
    simulateCartAbandonment,
    simulatePromotion,
    scheduleNotification,
  } = useNotifications();

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">Notifications</h1>
              <p className="mt-1 text-muted-foreground">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Permission Banner */}
        {permissionStatus === 'default' && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Enable Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get updates on orders and promotions
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Enable
            </button>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-destructive/10 p-4">
            <BellOff className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Notifications are blocked. Enable them in your browser settings.
            </p>
          </div>
        )}

        {/* Demo Buttons */}
        <div className="mb-6 rounded-xl bg-card p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Test Notifications (Demo)
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => simulateOrderUpdate('ORD-123', 'shipped')}
              className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80"
            >
              Order Update
            </button>
            <button
              onClick={simulateCartAbandonment}
              className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80"
            >
              Cart Reminder
            </button>
            <button
              onClick={() => simulatePromotion('Flash Sale!', '20%')}
              className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80"
            >
              Promotion
            </button>
            <button
              onClick={() => scheduleNotification('Scheduled Reminder', 'This is a scheduled notification', 5000)}
              className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80"
            >
              Schedule (5s)
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'group relative rounded-xl p-4 transition-all',
                    notification.read
                      ? 'bg-card'
                      : 'bg-primary/5 border-l-4 border-primary'
                  )}
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      'rounded-lg p-2',
                      notification.read ? 'bg-secondary' : 'bg-primary/10'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5',
                        notification.read ? 'text-muted-foreground' : 'text-primary'
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => clearNotification(notification.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No notifications</p>
            <p className="mt-2 text-muted-foreground">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
