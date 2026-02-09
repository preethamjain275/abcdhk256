import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageCircle, Mail, Phone, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const faqs = [
  {
    question: 'How do I track my order?',
    answer: 'You can track your order from the "My Orders" section in your profile. Click on any order to see its current status.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe.',
  },
  {
    question: 'How can I return a product?',
    answer: 'You can initiate a return within 7 days of delivery from the "My Orders" section. Select the order and click "Return Item".',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 5-7 business days. Express delivery is available for select products and locations.',
  },
];

export default function Help() {
  const navigate = useNavigate();

  const handleContact = (method: string) => {
    toast.info(`${method} support coming soon!`);
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-display text-3xl font-bold">Help Center</h1>
          <p className="mt-1 text-muted-foreground">
            Get help with your orders and account
          </p>
        </div>

        {/* Contact Options */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => handleContact('Chat')}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <span className="font-medium">Live Chat</span>
            <span className="text-xs text-muted-foreground">Available 24/7</span>
          </button>

          <button
            onClick={() => handleContact('Email')}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <span className="font-medium">Email Us</span>
            <span className="text-xs text-muted-foreground">Response in 24h</span>
          </button>

          <button
            onClick={() => handleContact('Phone')}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <span className="font-medium">Call Us</span>
            <span className="text-xs text-muted-foreground">9 AM - 9 PM</span>
          </button>
        </div>

        {/* FAQs */}
        <div className="rounded-2xl bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-border">
            {faqs.map((faq, index) => (
              <details key={index} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  {faq.question}
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
