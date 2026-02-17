import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CartItem, SavedItem, Product } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  savedItems: SavedItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeFromSaved: (productId: string) => void;
  cartTotal: number;
  cartCount: number;
  savedCount: number;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce-cart';
const SAVED_STORAGE_KEY = 'ecommerce-saved';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialLoadDone = useRef(false);

  // 1. Initial Load (LocalStorage for guests, and then DB for users)
  useEffect(() => {
    const loadData = async () => {
      // Load from localStorage first (for guests or immediate UI)
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      const storedSaved = localStorage.getItem(SAVED_STORAGE_KEY);
      
      let localCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
      let localSaved: SavedItem[] = storedSaved ? JSON.parse(storedSaved) : [];

      if (user) {
        setIsSyncing(true);
        try {
          // Fetch from Supabase
          const { data: dbItems, error } = await (supabase
            .from('cart_items')
            .select('*, products(*)') as any);

          if (!error && dbItems) {
             const mappedItems: CartItem[] = (dbItems as any[]).map(item => {
                const p = item.products;
                // Use a more robust mapping that includes all required fields
                const product: Product = {
                    ...p,
                    price: Number(p.price),
                    originalPrice: p.original_price ? Number(p.original_price) : undefined,
                    reviewCount: p.review_count || 0,
                    images: p.images || [],
                    createdAt: p.created_at
                } as any; 
                
                return {
                    product,
                    quantity: item.quantity,
                    addedAt: item.created_at,
                    selectedSize: item.selected_size,
                    selectedColor: item.selected_color
                };
             });

             // Merge strategy: if local has items, maybe we should push them to DB?
             // For simplicity, we prioritize DB if logged in, but if local had items during transition, we merge.
             if (localCart.length > 0) {
                 // Push local items to DB if they don't exist
                 for (const item of localCart) {
                     if (!mappedItems.some(mi => mi.product.id === item.product.id)) {
                         await (supabase.from('cart_items') as any).insert({
                             user_id: user.id,
                             product_id: item.product.id,
                             quantity: item.quantity
                         });
                         mappedItems.push(item);
                     }
                 }
                 localStorage.removeItem(CART_STORAGE_KEY); // Clean up
             }
             setCartItems(mappedItems);
          }
        } catch (err) {
          console.error("Cart sync error", err);
          setCartItems(localCart);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setCartItems(localCart);
      }
      setSavedItems(localSaved);
      initialLoadDone.current = true;
    };

    loadData();
  }, [user]);

  // 2. Persist to localStorage (only if guest)
  useEffect(() => {
    if (initialLoadDone.current && !user) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  useEffect(() => {
    if (initialLoadDone.current) {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedItems));
    }
  }, [savedItems]);

  const addToCart = useCallback(async (product: Product, quantity = 1, size?: string, color?: string) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { 
        product, 
        quantity, 
        addedAt: new Date().toISOString(),
        selectedSize: size,
        selectedColor: color
      }];
    });
    
    toast.success(`${product.name} added to cart`);

    if (user) {
        // DB update
        const { data: existing } = await (supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .eq('selected_size', size || '')
            .eq('selected_color', color || '')
            .single() as any);

        if (existing) {
            await (supabase.from('cart_items') as any)
                .update({ quantity: existing.quantity + quantity })
                .eq('id', (existing as any).id);
        } else {
            await (supabase.from('cart_items') as any).insert({
                user_id: user.id,
                product_id: product.id,
                quantity: quantity,
                selected_size: size || '',
                selected_color: color || ''
            } as any);
        }
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    
    if (user) {
        await (supabase.from('cart_items') as any)
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
    }
  }, [user]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));

    if (user) {
        await (supabase.from('cart_items') as any)
            .update({ quantity } as any)
            .eq('user_id', user.id)
            .eq('product_id', productId);
    }
  }, [removeFromCart, user]);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    if (user) {
        await supabase.from('cart_items')
            .delete()
            .eq('user_id', user.id);
    }
  }, [user]);

  // Saved Items (keeping localStorage for now as it's secondary, but could easily be DB too)
  const saveForLater = useCallback((productId: string) => {
    setCartItems(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (item) {
        setSavedItems(saved => {
          if (saved.some(s => s.product.id === productId)) return saved;
          return [...saved, { product: item.product, savedAt: new Date().toISOString() }];
        });
        toast.success(`${item.product.name} saved for later`);
      }
      return prev.filter(i => i.product.id !== productId);
    });
    if (user) {
        removeFromCart(productId);
    }
  }, [user, removeFromCart]);

  const moveToCart = useCallback((productId: string) => {
    setSavedItems(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (item) {
        addToCart(item.product, 1);
        toast.success(`${item.product.name} moved to cart`);
      }
      return prev.filter(i => i.product.id !== productId);
    });
  }, [addToCart]);

  const removeFromSaved = useCallback((productId: string) => {
    setSavedItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const savedCount = savedItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeFromSaved,
        cartTotal,
        cartCount,
        savedCount,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
