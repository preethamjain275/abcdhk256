// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  createdAt: string;
  featured?: boolean;
  bestseller?: boolean;
  sizes?: string[];
  colors?: string[];
  dealOfTheDay?: boolean;
  dealExpiresAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface SavedItem {
  product: Product;
  savedAt: string;
}

// Address Types
export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

// Order Types
export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderTrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMode;
  paymentDetails?: {
    upiId?: string;
    cardNumber?: string;
    cardHolder?: string;
    transactionId?: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  trackingSteps: OrderTrackingStep[];
}

// Transaction Types
export type PaymentMode = 'credit_card' | 'debit_card' | 'upi' | 'cod' | 'net_banking' | 'wallet' | 'sandbox';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  orderId: string;
  paymentMode: PaymentMode;
  amount: number;
  status: TransactionStatus;
  timestamp: string;
  items: CartItem[];
  receiptUrl?: string;
}

// Notification Types
export type NotificationType = 'order_placed' | 'order_update' | 'cart_abandonment' | 'promotion' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

// Browsing History
export interface BrowsingHistoryItem {
  productId: string;
  viewedAt: string;
}

// Filter Types
export interface TransactionFilter {
  paymentMode?: PaymentMode | 'all';
  status?: TransactionStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';
