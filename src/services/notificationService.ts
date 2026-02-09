import { supabase } from '@/integrations/supabase/client';

export type NotificationTrigger = 
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'cart_abandoned'
  | 'price_drop'
  | 'back_in_stock'
  | 'flash_sale'
  | 'weekly_deals';

interface ScheduledNotification {
  id: string;
  trigger: NotificationTrigger;
  title: string;
  body: string;
  scheduledFor: Date;
  data?: Record<string, unknown>;
}

// Keep a local queue for scheduled things that haven't fired yet (client-side simulation of scheduled jobs)
let scheduledNotifications: ScheduledNotification[] = [];

export const notificationService = {
  /**
   * Register device for push notifications
   */
  async registerDevice(): Promise<string> {
    // In a real app, integrate Expo Push Token here
    const mockToken = `ExponentPushToken[${Math.random().toString(36).substring(2, 15)}]`;
    localStorage.setItem('push_token', mockToken);
    return mockToken;
  },

  /**
   * Unregister device
   */
  async unregisterDevice(): Promise<void> {
    localStorage.removeItem('push_token');
    scheduledNotifications = [];
  },

  /**
   * Check if device is registered
   */
  isRegistered(): boolean {
    return !!localStorage.getItem('push_token');
  },

  /**
   * Schedule a notification (Client-side simulation)
   */
  async scheduleNotification(
    trigger: NotificationTrigger,
    title: string,
    body: string,
    delayMinutes: number,
    data?: Record<string, unknown>
  ): Promise<string> {
    const notification: ScheduledNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trigger,
      title,
      body,
      scheduledFor: new Date(Date.now() + delayMinutes * 60 * 1000),
      data,
    };
    
    scheduledNotifications.push(notification);
    
    // If connected to Supabase, we could insert into a 'scheduled_notifications' table
    // await supabase.from('notifications').insert({ ... })

    return notification.id;
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    scheduledNotifications = scheduledNotifications.filter(n => n.id !== notificationId);
  },

  /**
   * Cancel all notifications of a specific type
   */
  async cancelNotificationsByType(trigger: NotificationTrigger): Promise<void> {
    scheduledNotifications = scheduledNotifications.filter(n => n.trigger !== trigger);
  },

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    return [...scheduledNotifications];
  },

  /**
   * Send immediate order update notification
   * Stores in Supabase 'notifications' table
   */
  async sendOrderUpdate(orderId: string, status: string): Promise<void> {
    const statusMessages: Record<string, { title: string; body: string }> = {
      confirmed: {
        title: 'Order Confirmed! 🎉',
        body: `Your order #${orderId} has been confirmed and is being prepared.`,
      },
      shipped: {
        title: 'Your Order is On Its Way! 📦',
        body: `Great news! Order #${orderId} has been shipped and is on its way to you.`,
      },
      delivered: {
        title: 'Delivery Complete! ✅',
        body: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
      },
      cancelled: {
        title: 'Order Cancelled',
        body: `Order #${orderId} has been cancelled. Refund will be processed within 3-5 days.`,
      },
    };
    
    const message = statusMessages[status] || {
      title: 'Order Update',
      body: `Your order #${orderId} status has been updated to: ${status}`,
    };

    // Insert into Supabase
    const { error } = await supabase.from('notifications').insert({
      type: 'order_update',
      title: message.title,
      body: message.body,
      data: { orderId, status },
      read: false
    });

    if (error) {
      console.error('Failed to send notification to DB', error);
    }
  },

  /**
   * Schedule cart abandonment reminder
   */
  async scheduleCartReminder(cartValue: number, itemCount: number): Promise<string> {
    await this.cancelNotificationsByType('cart_abandoned');
    
    return this.scheduleNotification(
      'cart_abandoned',
      "Don't forget your items! 🛒",
      `You have ${itemCount} item${itemCount > 1 ? 's' : ''} worth $${cartValue.toFixed(2)} waiting in your cart.`,
      60, // 60 minutes
      { cartValue, itemCount }
    );
  },

  /**
   * Send promotional notification
   */
  async sendPromotion(
    campaignId: string,
    title: string,
    body: string,
    discount?: string
  ): Promise<void> {
     const { error } = await supabase.from('notifications').insert({
      type: 'promotion',
      title: title,
      body: body,
      data: { campaignId, discount },
      read: false
    });

    if (error) {
       console.error('Failed to save promotion notification', error);
    }
  },

  /**
   * Fetch user notifications from Supabase
   */
  async getUserNotifications(): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  },

  handlers: {
    // When app is in foreground
    onForegroundNotification: (callback: (notification: ScheduledNotification) => void) => {
      console.log('Foreground notification handler registered');
      return () => console.log('Foreground notification handler unregistered');
    },

    // When notification is tapped
    onNotificationTapped: (callback: (notification: ScheduledNotification) => void) => {
      console.log('Notification tap handler registered');
      return () => console.log('Notification tap handler unregistered');
    },

    // When notification is received in background
    onBackgroundNotification: (callback: (notification: ScheduledNotification) => void) => {
      console.log('Background notification handler registered');
      return () => console.log('Background notification handler unregistered');
    },
  },
};
