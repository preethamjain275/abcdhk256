import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

interface CartItemProps {
  item: CartItemType;
  variant?: 'cart' | 'saved';
  className?: string;
}

export function CartItem({ item, variant = 'cart', className }: CartItemProps) {
  const { updateQuantity, removeFromCart, saveForLater, moveToCart, removeFromSaved } = useCart();
  const { product, quantity } = item;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-4 rounded-xl bg-card p-4 transition-all',
        className
      )}
    >
      {/* Product Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted md:h-28 md:w-28"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            to={`/product/${product.id}`}
            className="font-medium transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {product.category}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="flex items-end justify-between">
          <div>
            <p className="price-tag text-lg">
              {formatPrice(product.price * quantity)}
            </p>
            {quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(product.price)} each
              </p>
            )}
          </div>

          {variant === 'cart' ? (
            <div className="flex items-center gap-3">
              {/* Quantity Controls */}
              <div className="flex items-center gap-1 rounded-lg border border-border">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 transition-colors hover:bg-secondary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="p-2 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Save for Later */}
              <button
                onClick={() => saveForLater(product.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Save for later"
              >
                <Bookmark className="h-4 w-4" />
              </button>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(product.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Move to Cart */}
              <button
                onClick={() => moveToCart(product.id)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Move to Cart
              </button>

              {/* Remove */}
              <button
                onClick={() => removeFromSaved(product.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
