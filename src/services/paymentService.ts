import { toast } from 'sonner';

/**
 * Razorpay Payment Integration Service
 */

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = {
  /**
   * Initialize and open Razorpay Payment Gateway
   */
  processRazorpayPayment: async (options: {
    amount: number;
    userName: string;
    userEmail: string;
    userContact?: string;
    orderId?: string;
  }): Promise<any> => {
    return new Promise((resolve, reject) => {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

      // Check if key is missing or is the placeholder
      const isPlaceholder = !razorpayKey || razorpayKey === 'rzp_test_YourTestKeyHere' || razorpayKey === 'rzp_test_placeholder';

      if (isPlaceholder) {
        console.warn('USING MOCK PAYMENT GATEWAY: No real Razorpay Key found in .env');
        toast.info('Demo Mode: Simulating secure payment...', { duration: 3000 });
        
        // Simulate a short delay for "payment processing"
        setTimeout(() => {
          const mockResponse = {
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_order_id: options.orderId || `order_mock_${Date.now()}`,
            razorpay_signature: 'mock_signature_for_testing_purposes',
            isMock: true
          };
          toast.success('Mock Payment Successful!');
          resolve(mockResponse);
        }, 2000);
        return;
      }

      if (!window.Razorpay) {
        toast.error('Razorpay SDK not loaded. Please check your internet connection.');
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      const razorpayOptions: RazorpayOptions = {
        key: razorpayKey,
        amount: Math.round(options.amount * 100), // Amount in paisa
        currency: 'INR',
        name: 'LUXE - Premium Store',
        description: `Order Payment ${options.orderId ? '#' + options.orderId.slice(0, 8) : ''}`,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200',
        handler: (response: any) => {
          console.log('Razorpay Payment Success:', response);
          resolve(response);
        },
        prefill: {
          name: options.userName,
          email: options.userEmail,
          contact: options.userContact || '',
        },
        notes: {
          app: 'Luxe_Ecommerce',
        },
        theme: {
          color: '#ff9f00', // Our primary gold color
        },
      };

      const rzp1 = new window.Razorpay(razorpayOptions);
      
      rzp1.on('payment.failed', function (response: any) {
        console.error('Razorpay Payment Failed:', response.error);
        toast.error(`Payment Failed: ${response.error.description}`);
        reject(response.error);
      });

      rzp1.open();
    });
  }
};
