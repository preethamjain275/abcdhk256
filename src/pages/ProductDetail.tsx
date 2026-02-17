import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCarousel } from '@/components/ProductCarousel';
import { useCart } from '@/contexts/CartContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { Product, Review } from '@/types';
import { productService } from '@/services/productService';
import { recommendationService } from '@/services/recommendationService';
import { formatPrice } from '@/lib/currency';
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Sparkles,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [productData, reviewData, related, frequently] = await Promise.all([
          productService.getProductById(id),
          productService.getReviewsByProductId(id),
          recommendationService.getRelatedProducts(id),
          recommendationService.getFrequentlyBoughtTogether(id),
        ]);

        if (productData) {
          setProduct(productData);
          setReviews(reviewData);
          if (productData.sizes && productData.sizes.length > 0) setSelectedSize(productData.sizes[0]);
          if (productData.colors && productData.colors.length > 0) setSelectedColor(productData.colors[0]);
          addToRecentlyViewed(productData);
          recommendationService.trackProductView(id);
        }
        setRelatedProducts(related);
        setFrequentlyBought(frequently);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    setSelectedImage(0);
    setQuantity(1);
  }, [id, addToRecentlyViewed]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    
    if (isWishlisted) {
      await recommendationService.removeFromWishlist(product.id);
    } else {
      await recommendationService.addToWishlist(product.id);
    }
    setIsWishlisted(!isWishlisted);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div className="aspect-square rounded-2xl bg-muted" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-6 w-1/4 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-6 rounded-full bg-primary px-6 py-2 font-medium text-primary-foreground"
          >
            Browse Products
          </button>
        </div>
      </Layout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Product Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Images & Video */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted group">
              {showVideo && product.videoUrl ? (
                <div className="h-full w-full">
                  {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}`}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : product.videoUrl.includes('vimeo.com') ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${product.videoUrl.split('/').pop()}`}
                      className="h-full w-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      src={product.videoUrl} 
                      autoPlay 
                      controls 
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              )}
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground z-10">
                  -{discount}%
                </span>
              )}
              
              {product.videoUrl && (
                <button 
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute bottom-4 right-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-primary z-10"
                >
                  <Video className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    setShowVideo(false);
                  }}
                  className={cn(
                    'h-20 w-20 overflow-hidden rounded-xl border-2 transition-all p-0.5',
                    selectedImage === index && !showVideo
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </button>
              ))}
              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={cn(
                    'h-20 w-20 overflow-hidden rounded-xl border-2 transition-all p-0.5 relative group',
                    showVideo
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <video 
                    src={product.videoUrl} 
                    className="h-full w-full object-cover rounded-lg"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
            
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < Math.floor(product.rating)
                        ? 'fill-primary text-primary'
                        : 'fill-muted text-muted'
                    )}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price & Offers */}
            <div className="mt-4 flex items-center gap-3">
               <span className="text-3xl font-black tracking-tight text-foreground">
                 {formatPrice(product.price)}
               </span>
               {product.originalPrice && (
                 <>
                   <span className="text-lg text-muted-foreground line-through opacity-60">
                     {formatPrice(product.originalPrice)}
                   </span>
                   <span className="text-lg font-bold text-success">
                     {discount}% off
                   </span>
                 </>
               )}
            </div>
            
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
              <Sparkles className="h-3.5 w-3.5" />
              Special Price
            </div>

            {/* Bank Offers Mock */}
            <div className="mt-8 space-y-4 rounded-2xl border border-dashed border-border p-5 bg-secondary/10">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                Available Offers
              </h3>
              <ul className="space-y-3">
                {[
                  'Bank Offer: 10% off on HDFC Bank Credit Cards, up to ₹1,500.',
                  'Cashback: 5% Unlimited Cashback on Luxe Axis Bank Credit Card.',
                  'Partner Offer: Get extra 10% Luxe Cash on your next purchase.'
                ].map((offer, i) => (
                  <li key={i} className="flex gap-2 text-xs font-medium leading-relaxed">
                    <span className="text-success text-base">🏷️</span>
                    <span>{offer} <button className="text-primary hover:underline font-bold ml-1">T&C</button></span>
                  </li>
                ))}
              </ul>
              <button className="text-xs font-bold text-primary hover:underline mt-2">View 4 more offers</button>
            </div>

            {/* Check Delivery Mock */}
            <div className="mt-8 p-5 rounded-2xl border border-border bg-card shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Delivery
                  </h3>
                  <button className="text-xs font-bold text-primary hover:underline">Change</button>
               </div>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Delivery Pincode"
                    className="flex-1 h-10 px-4 rounded-xl bg-secondary/30 border border-border text-sm outline-none focus:border-primary transition-all"
                  />
                  <button className="h-10 px-6 bg-secondary text-foreground text-xs font-black uppercase rounded-xl hover:bg-secondary/80 transition-all">Check</button>
               </div>
               <p className="mt-3 text-xs text-muted-foreground font-medium">
                  Delivery by <span className="text-foreground font-bold">Today, 9 PM</span> | <span className="text-success font-bold">FREE</span>
               </p>
            </div>

            {/* Description */}
            <div className="mt-8 border-t border-border pt-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Product Highlights</h3>
              <p className="text-sm text-foreground leading-relaxed opacity-90">
                {product.description}
              </p>
            </div>

            {/* Size & Color Selectors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                        selectedColor === color 
                          ? "border-primary bg-primary text-white shadow-glow" 
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2",
                        selectedSize === size 
                          ? "border-primary bg-primary text-white shadow-glow" 
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Action Buttons */}
            <div className="mt-10 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quantity</span>
                <div className="flex items-center rounded-xl bg-secondary/50 border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 transition-colors hover:bg-secondary"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2.5 transition-colors hover:bg-secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="h-14 flex items-center justify-center gap-2 rounded-2xl bg-secondary text-foreground font-black uppercase tracking-tighter text-sm hover:bg-secondary/80 transition-all shadow-sm active:scale-95"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>

                <button
                  onClick={() => {
                    handleAddToCart();
                    navigate('/checkout');
                  }}
                  className="h-14 flex items-center justify-center gap-2 rounded-2xl bg-primary text-white font-black uppercase tracking-tighter text-sm shadow-glow hover:scale-[1.02] transition-all active:scale-95"
                >
                  <Sparkles className="h-5 w-5" />
                  Buy Now
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleWishlist}
                  className={cn(
                    'flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-border font-bold text-xs transition-all uppercase tracking-widest',
                    isWishlisted ? 'bg-primary/5 text-primary border-primary/20' : 'hover:bg-secondary'
                  )}
                >
                  <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
                  {isWishlisted ? 'Saved' : 'Add to Wishlist'}
                </button>
                
                <button className="h-12 w-12 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition-all">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stock Message */}
            <div className="mt-4 flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full animate-pulse", product.stock > 0 ? "bg-success" : "bg-destructive")} />
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-widest',
                product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-warning' : 'text-destructive'
              )}>
                {product.stock > 10
                  ? 'Ready for dispatch'
                  : product.stock > 0
                  ? `Last few items: Only ${product.stock} available`
                  : 'Out of Stock'}
              </p>
            </div>

            {/* Features & Specifications */}
            <div className="mt-8 space-y-8">
              {product.attributes?.features && product.attributes.features.length > 0 && (
                <div className="rounded-2xl border border-border bg-card/50 p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Key Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {product.attributes.features.map((feature, i) => (
                      <div key={i} className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs font-bold text-muted-foreground">{feature.key}</span>
                        <span className="text-xs font-black text-foreground">{feature.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.attributes?.links && product.attributes.links.length > 0 && (
                <div className="rounded-2xl border border-border bg-card/50 p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    Helpful Resources
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.attributes.links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all border border-border group"
                      >
                        {link.label}
                        <ArrowLeft className="h-3 w-3 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Existing Fixed Features */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 rounded-xl bg-secondary/50 p-4 text-center">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl bg-secondary/50 p-4 text-center">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">2 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl bg-secondary/50 p-4 text-center">
                <RefreshCw className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        {frequentlyBought.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-semibold">
              Frequently Bought Together
            </h2>
            <div className="flex flex-wrap gap-4">
              {frequentlyBought.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl bg-card p-4"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="price-tag">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item, 1)}
                    className="rounded-lg bg-secondary p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews */}
        <section className="mt-16 border-t pt-16">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="md:w-1/3">
              <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
              <div className="mt-4 flex items-center gap-4">
                <p className="text-5xl font-bold">{product.rating}</p>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.round(product.rating)
                            ? 'fill-primary text-primary'
                            : 'fill-muted text-muted'
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on {product.reviewCount} reviews
                  </p>
                </div>
              </div>

              {/* Rating Bars */}
              <div className="mt-8 space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4 text-sm">
                    <span className="w-8">{rating} star</span>
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div 
                        className="h-full rounded-full bg-primary" 
                        style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 5}%` }} 
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">
                      {rating === 5 ? '70%' : rating === 4 ? '20%' : '5%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-8">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl bg-secondary/30 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3 w-3',
                                  i < review.rating
                                    ? 'fill-primary text-primary'
                                    : 'fill-muted text-muted'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
                  <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                  <button className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <ProductCarousel
              products={relatedProducts}
              title="You May Also Like"
              subtitle="Based on this product"
              variant="default"
            />
          </section>
        )}
      </div>
    </Layout>
  );
}
