import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import PaymentMethods from "./pages/PaymentMethods";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";
import About from "./pages/About";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManager from "./pages/admin/ProductManager";
import OrderManager from "./pages/admin/OrderManager";
import CustomerManager from "./pages/admin/CustomerManager";
import AdminSettings from "./pages/admin/Settings";
import ReviewManager from "./pages/admin/ReviewManager";
import CouponManager from "./pages/admin/CouponManager";
import TransactionManager from "./pages/admin/TransactionManager";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import GiftQuiz from "./pages/GiftQuiz";
import NotFound from "./pages/NotFound";

import { SplashScreen } from "@/components/ui/SplashScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <RecentlyViewedProvider>
            <NotificationProvider>
              <TooltipProvider>
                <SplashScreen />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/payment" element={<PaymentMethods />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/about" element={<About />} />
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<ProductManager />} />
                      <Route path="orders" element={<OrderManager />} />
                      <Route path="customers" element={<CustomerManager />} />
                      <Route path="reviews" element={<ReviewManager />} />
                      <Route path="coupons" element={<CouponManager />} />
                      <Route path="transactions" element={<TransactionManager />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Route>
                    <Route path="/gift-finder" element={<GiftQuiz />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </RecentlyViewedProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
