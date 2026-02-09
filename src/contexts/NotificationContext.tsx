import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Notification as AppNotification, NotificationType } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  permissionStatus: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  // Mock functions for triggering notifications (client side simulation)
  simulateOrderUpdate: (orderId: string, status: string) => void;
  simulateCartAbandonment: () => void;
  simulatePromotion: (title: string, discount: string) => void;
  scheduleNotification: (title: string, body: string, delayMs: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const PERMISSION_KEY = 'ecommerce-notification-permission';

// Map DB notification to app type
const mapNotificationFromDB = (data: any): AppNotification => ({
  id: data.id,
  type: data.type as NotificationType,
  title: data.title,
  body: data.body,
  timestamp: data.created_at,
  read: data.read,
  data: data.data,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  // Check for notification support
  useEffect(() => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
    } else {
      setPermissionStatus(window.Notification.permission);
    }
  }, []);

  // Fetch notifications from Supabase
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications((data || []).map(mapNotificationFromDB));
    };

    fetchNotifications();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotification = mapNotificationFromDB(payload.new);
          setNotifications(prev => [newNotification, ...prev]);
          
          // Trigger browser notification
          if (permissionStatus === 'granted') {
             new window.Notification(newNotification.title, {
                body: newNotification.body,
             });
          }
          toast.info(newNotification.title, { description: newNotification.body });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, permissionStatus]);


  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setPermissionStatus(permission);
      localStorage.setItem(PERMISSION_KEY, permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.info('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    if (user) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (user) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id); // Mark all for user
    }
  }, [user]);

  const clearNotification = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));

    if (user) {
        // Technically we might delete it or just hide it
       await supabase.from('notifications').delete().eq('id', id);
    }
  }, [user]);

  const clearAll = useCallback(async () => {
    // Optimistic update
    setNotifications([]);

    if (user) {
        await supabase.from('notifications').delete().eq('user_id', user.id);
    }
  }, [user]);

  // --- Simulation Helpers (These inject into DB to test realtime) ---

  const addNotification = useCallback(async (
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) => {
    if (!user) {
        toast.error("Please sign in to test notifications (they require a user ID)");
        return;
    }

    // Insert into Supabase, will trigger subscription above
    await supabase.from('notifications').insert({
        user_id: user.id,
        type,
        title,
        body,
        data,
        read: false
    });
  }, [user]);

  const simulateOrderUpdate = useCallback((orderId: string, status: string) => {
    addNotification(
      'order_update',
      'Order Update',
      `Your order #${orderId} is now ${status}`,
      { orderId, status }
    );
  }, [addNotification]);

  const simulateCartAbandonment = useCallback(() => {
    addNotification(
      'cart_abandonment',
      'Items in Your Cart',
      'You have items waiting in your cart. Complete your purchase today!',
      { type: 'cart_reminder' }
    );
  }, [addNotification]);

  const simulatePromotion = useCallback((title: string, discount: string) => {
    addNotification(
      'promotion',
      title,
      `Get ${discount} off on selected items. Limited time offer!`,
      { discount }
    );
  }, [addNotification]);

  const scheduleNotification = useCallback((title: string, body: string, delayMs: number) => {
    toast.info(`Notification scheduled in ${delayMs / 1000}s`);
    setTimeout(() => {
      addNotification('promotion', title, body);
    }, delayMs);
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
