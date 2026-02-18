import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    MoreHorizontal,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    Printer,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrderManager() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchOrders();

        // Subscribe to changes
        const channel = supabase
            .channel('schema-db-changes-orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
            *,
            order_items (
                *,
                product:products(name, price)
            )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                // @ts-ignore
                .update({ status: newStatus } as any)
                .eq('id', orderId);

            if (error) throw error;

            toast.success(`Order status updated to ${newStatus}`);
            // fetchOrders is triggered by subscription, but for instant feedback:
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900';
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">Orders</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage customer orders.</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:shadow-lg transition-all flex items-center gap-2 group"
                    >
                        <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-md group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors">
                            <Printer className="h-4 w-4 text-slate-500 group-hover:text-cyan-600" />
                        </div>
                        <span>Export CSV</span>
                    </motion.button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search order ID, customer, email..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                statusFilter === status
                                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden"
                            >
                                <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Order #{order.id.slice(0, 8)}</h3>
                                                <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold border", getStatusColor(order.status))}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(order.created_at).toLocaleString()} • by <span className="text-slate-900 dark:text-white font-medium">{order.shipping_address?.fullName || 'Guest'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 md:gap-8">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Amount</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatPrice(order.total)}</p>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                                                Actions <ChevronDown className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'processing')}>
                                                    <Clock className="mr-2 h-4 w-4" /> Mark Processing
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'shipped')}>
                                                    <Truck className="mr-2 h-4 w-4" /> Mark Shipped
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Delivered
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')} className="text-red-600 focus:text-red-600">
                                                    <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Order Items Preview (Accordion logic can be added later, currently showing first 2 items) */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 flex gap-4 overflow-x-auto">
                                    {order.order_items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-3 min-w-[200px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            <div className="h-10 w-10 bg-slate-100 rounded overflow-hidden">
                                                {(() => {
                                                    const mapping = item.product?.product_media_mapping || [];
                                                    const primary = mapping.find((m: any) => m.is_primary) || mapping[0];
                                                    const url = primary?.media_assets?.url;
                                                    return url ? <img src={url} className="h-full w-full object-cover" /> : null;
                                                })()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{item.product?.name}</p>
                                                <p className="text-[10px] text-slate-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
