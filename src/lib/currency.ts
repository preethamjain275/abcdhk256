// Currency formatting utility
export const CURRENCY_SYMBOL = '₹';

export function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(2)}`;
}
