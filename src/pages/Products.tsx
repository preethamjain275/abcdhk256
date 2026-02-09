import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import { productService, categories } from '@/services/productService';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'price_asc' | 'price_desc' | 'rating' | 'newest';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || null;
  const initialSort = (searchParams.get('sortBy') as SortOption) || 'newest';
  const initialMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 150000;
  const initialMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
  const [showFilters, setShowFilters] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const cat = searchParams.get('category') || null;
    const sort = searchParams.get('sortBy') as SortOption;
    const max = searchParams.get('maxPrice');
    
    if (search !== searchQuery) setSearchQuery(search);
    if (cat !== selectedCategory) setSelectedCategory(cat);
    if (sort && sort !== sortBy) setSortBy(sort);
    if (max && Number(max) !== priceRange[1]) setPriceRange([priceRange[0], Number(max)]);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy !== 'newest') params.sortBy = sortBy;
    if (priceRange[1] !== 150000) params.maxPrice = priceRange[1].toString();
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getProducts({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sortBy,
        });
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('newest');
    setPriceRange([0, 150000]);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR - FILTERS */}
          <aside className="lg:w-64 shrink-0 hidden lg:block space-y-8 sticky top-24 h-fit">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Filters</h3>
              <div className="h-1 w-12 bg-primary rounded-full mb-6" />
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Categories</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={cn("text-sm text-left px-2 py-1.5 rounded-lg transition-colors", !selectedCategory ? "bg-primary text-white font-bold" : "hover:bg-secondary")}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn("text-sm text-left px-2 py-1.5 rounded-lg transition-colors", selectedCategory === cat.name ? "bg-primary text-white font-bold" : "hover:bg-secondary")}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Price Range</p>
              <div className="px-2">
                <div className="flex justify-between text-xs font-bold mb-4">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Brands Mock Filter */}
            <div className="space-y-3 pt-4 border-t border-border">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Top Brands</p>
              <div className="flex flex-col gap-1.5">
                {['Apple', 'Samsung', 'Nike', 'Zara', 'Puma'].map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={clearFilters}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-widest border border-dashed border-border rounded-xl hover:border-primary hover:text-primary transition-all"
            >
              Reset Filters
            </button>
          </aside>

          {/* RIGHT CONTENT - PRODUCTS */}
          <main className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Our Collection</h1>
                <p className="text-sm text-muted-foreground">Showing {products.length} products with premium quality</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group min-w-[200px] hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search in results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-secondary/20 outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 px-4 rounded-xl border border-border bg-card text-sm font-bold outline-none cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <option value="newest">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Review Highlights</option>
                </select>

                <button 
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-secondary/50" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No results found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-glow"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER (Mock) */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-background p-6 animate-in slide-in-from-right-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter">Filter By</h2>
              <button onClick={() => setShowFilters(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* ... Mobile filter content would go here ... */}
            <p className="text-muted-foreground italic">Use the desktop version for advanced filtering.</p>
            <button 
              onClick={() => setShowFilters(false)}
              className="w-full mt-auto bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-glow"
            >
              See {products.length} Results
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
