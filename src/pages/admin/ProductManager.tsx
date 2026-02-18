import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Image as ImageIcon,
    Loader2,
    Package,
    Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ProductForm from './ProductForm';
import { Product } from '@/types';

// Extended product type to include DB specific fields
type AdminProduct = Product & {
    video_url?: string;
    brand?: string;
    attributes?: {
        features?: { key: string; value: string }[];
        links?: { label: string; url: string }[];
    };
    product_media_mapping?: {
        is_primary: boolean;
        media_assets?: {
            url: string;
        }
    }[];
};

export default function ProductManager() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

    useEffect(() => {
        fetchProducts();

        const channel = supabase
            .channel('schema-db-changes-products')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    fetchProducts();
                    if (payload.eventType === 'UPDATE') {
                        toast.success('Product updated');
                    } else if (payload.eventType === 'INSERT') {
                        toast.success('New product added');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Product deleted successfully');
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <ProductForm
                            onClose={() => {
                                setShowAddModal(false);
                                setSelectedProduct(null);
                            }}
                            onSuccess={fetchProducts}
                            initialData={selectedProduct}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">Products</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your inventory, prices, and stock.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setSelectedProduct(null);
                        setShowAddModal(true);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] border-t border-white/20 transition-all font-bold flex items-center gap-2 transform perspective-1000"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Product</span>
                </motion.button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products by name, category..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-700 text-cyan-600" : "text-slate-400 hover:bg-slate-50")}
                    >
                        <Filter className="h-4 w-4 rotate-90" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-slate-100 dark:bg-slate-700 text-cyan-500" : "text-slate-400 hover:bg-slate-50")}
                    >
                        <Package className="h-4 w-4" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <select className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm px-3 py-2.5 focus:ring-0 text-slate-600 dark:text-slate-300 font-medium">
                        <option>All Categories</option>
                        <option>Electronics</option>
                        <option>Clothing</option>
                        <option>Accessories</option>
                    </select>
                </div>
            </div>

            {/* Product List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
            ) : (
                <div className={cn("grid gap-4", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1")}>
                    <AnimatePresence>
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                mode={viewMode}
                                onDelete={() => handleDeleteProduct(product.id)}
                                onEdit={(product) => {
                                    setSelectedProduct(product);
                                    setShowAddModal(true);
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

function ProductCard({ product, mode, onDelete, onEdit }: { product: AdminProduct, mode: 'grid' | 'list', onDelete: () => void, onEdit: (product: AdminProduct) => void }) {
    const mainImage = product.product_media_mapping?.find((m) => m.is_primary)?.media_assets?.url
        || product.product_media_mapping?.[0]?.media_assets?.url
        || product.images?.[0];

    if (mode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group"
            >
                <div className="h-16 w-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden relative flex-shrink-0">
                    {mainImage ? (
                        <img src={mainImage} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{product.name}</h3>
                        {product.brand && <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-md uppercase">{product.brand}</span>}
                        {product.featured && <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">FEATURED</span>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate w-3/4">{product.description}</p>
                </div>

                <div className="text-right min-w-[100px]">
                    <p className="font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
                    <p className={cn("text-xs font-medium", product.stock > 10 ? "text-emerald-500" : "text-red-500")}>
                        {product.stock || 0} in stock
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {product.video_url && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-md text-[10px] font-bold">
                            <Video className="h-3 w-3" />
                            VIDEO
                        </div>
                    )}
                    {product.images?.length > 1 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-md text-[10px] font-bold">
                            <ImageIcon className="h-3 w-3" />
                            {product.images.length}
                        </div>
                    )}
                    <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8, rotateX: 2, rotateY: 2, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 transition-all overflow-hidden group flex flex-col perspective-1000"
        >
            <div className="h-48 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                {mainImage ? (
                    <img src={mainImage} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                        <ImageIcon className="h-12 w-12" />
                    </div>
                )}

                {/* 3D Floating Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                        <div className="px-3 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase rounded-lg shadow-lg transform rotate-[-5deg] group-hover:rotate-0 transition-transform">
                            Featured
                        </div>
                    )}
                    {product.video_url && (
                        <div className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg shadow-lg backdrop-blur-md border border-white/20">
                            <Video className="h-4 w-4" />
                        </div>
                    )}
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                    <button
                        onClick={() => onEdit(product)}
                        className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 shadow-sm hover:scale-110 transition-transform"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-600 shadow-sm hover:scale-110 transition-transform"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Media Count Overlay */}
                {product.images?.length > 1 && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <ImageIcon className="h-3 w-3" />
                        {product.images.length} Photos
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col relative z-10 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">{product.category}</span>
                        {product.brand && <span className="text-[10px] font-medium text-slate-400">{product.brand}</span>}
                    </div>
                    <span className="font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{formatPrice(product.price)}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-cyan-600 transition-colors">{product.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{product.description}</p>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mt-auto">
                    <div className="flex flex-col gap-1">
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 w-fit", product.stock > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700")}>
                            <div className={cn("h-1 w-1 rounded-full", product.stock > 0 ? "bg-emerald-500" : "bg-red-500")} />
                            {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                        </span>
                        {(product.attributes?.features?.length > 0 || product.attributes?.links?.length > 0) && (
                            <div className="flex gap-1">
                                {product.attributes?.features?.length > 0 && <span className="text-[9px] font-bold text-slate-400">● {product.attributes.features.length} features</span>}
                                {product.attributes?.links?.length > 0 && <span className="text-[9px] font-bold text-slate-400">● {product.attributes.links.length} links</span>}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-1 opacity-10 group-hover:opacity-100 transition-all">
                        {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-cyan-400 transition-colors duration-300" style={{ transitionDelay: `${i * 100}ms` }} />)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
