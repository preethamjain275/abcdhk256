import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentMethods() {
  const navigate = useNavigate();

  const handleAddCard = () => {
    toast.info('Add payment method coming soon!');
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
          <h1 className="font-display text-3xl font-bold">Payment Methods</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your saved payment methods
          </p>
        </div>

        {/* Empty State */}
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No payment methods saved</p>
          <p className="mt-2 text-muted-foreground">
            Add a payment method for faster checkout
          </p>
          <button
            onClick={handleAddCard}
            className="mt-6 flex items-center gap-2 mx-auto rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Payment Method
          </button>
        </div>
      </div>
    </Layout>
  );
}
