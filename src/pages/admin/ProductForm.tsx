import { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  Video,
  Link as LinkIcon,
  Settings2,
  ChevronDown,
  LayoutGrid,
  FileText,
  Package,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface LinkItem {
  label: string;
  url: string;
}

interface FeatureItem {
  key: string;
  value: string;
}

export default function ProductForm({
  onClose,
  onSuccess,
  initialData
}: {
  onClose: () => void,
  onSuccess: () => void,
  initialData?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  const [loading, setLoading] = useState(false);
  type TabType = 'basic' | 'media' | 'features' | 'links';
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    stock: initialData?.stock || '',
    category: initialData?.category || '',
    brand: initialData?.brand || '',
    images: (initialData?.images as string[]) || [],
    image_url: initialData?.image_url || '',
    video_url: initialData?.video_url || '',
    features: (initialData?.attributes?.features as FeatureItem[]) || [],
    links: (initialData?.attributes?.links as LinkItem[]) || [],
    featured: initialData?.featured || false
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Only JPG, PNG, and WebP files are allowed');
      return;
    }

    setUploadError('');
    setUploadProgress(10); // Start progress

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${initialData?.id || 'new'}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress(30);

      // Try uploading
      let { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          upsert: true,
        });

      // Handle missing bucket
      if (uploadErr && (uploadErr.message.includes('Bucket not found') || (uploadErr as any).statusCode === '404')) {
        console.log('Bucket not found, attempting to create...');
        const { error: createBucketError } = await supabase.storage.createBucket('product-images', {
          public: true
        });

        if (createBucketError) {
          console.error('Failed to create bucket:', createBucketError);
          throw new Error('Bucket "product-images" not found and could not be created. Please create it manually in Supabase Dashboard.');
        }

        // Retry upload
        const { error: retryError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            upsert: true,
          });

        uploadErr = retryError;
      }

      if (uploadErr) throw uploadErr;

      setUploadProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl,
        images: prev.images.includes(publicUrl) ? prev.images : [publicUrl, ...prev.images]
      }));
      setUploadProgress(100);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Upload failed');
      setUploadProgress(0);
    }
  };

  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, { key: '', value: '' }] }));
  };

  const updateFeature = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...formData.features];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const addLink = () => {
    setFormData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...formData.links];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, links: updated }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price as string),
        stock: parseInt(formData.stock as string),
        category: formData.category,
        // brand: formData.brand, // Computed column missing in DB
        // images: formData.images, // Column missing in DB
        // image_url: formData.image_url, // Column missing in DB
        // video_url: formData.video_url, // Column missing in DB likely
        featured: formData.featured,
        attributes: {
          features: formData.features.map(f => ({ key: f.key, value: f.value })),
          links: formData.links.map(l => ({ label: l.label, url: l.url }))
        }
      };

      let error;

      if (initialData) {
        // Cast to any because the generated types might be out of sync or strict
        const { error: updateError } = await (supabase
          .from('products') as any)
          .update(payload)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await (supabase
          .from('products') as any)
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(initialData ? 'Product updated successfully' : 'Product created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'media', label: 'Media', icon: LayoutGrid },
    { id: 'features', label: 'Specifications', icon: Settings2 },
    { id: 'links', label: 'External Links', icon: ExternalLink },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-slate-50 dark:bg-[#0B1120] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-white/10 relative z-50 m-auto flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 rounded-xl">
            <Package className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {initialData ? 'Update your product details and media' : 'Create a new item in your inventory'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all hover:rotate-90 duration-300"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-2 bg-white/5 flex gap-1 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative border-b-2",
              activeTab === tab.id
                ? "text-blue-500 border-blue-500 bg-blue-500/5"
                : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    Product Name
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white transition-all shadow-sm"
                    placeholder="e.g. Premium Wireless Headphones"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-blue-500 font-bold">$</span>
                    Price
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white transition-all shadow-sm"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white transition-all shadow-sm appearance-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home">Home</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Toys">Toys</option>
                    <option value="Beauty">Beauty</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Brand
                  </label>
                  <input
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white transition-all shadow-sm"
                    placeholder="e.g. Sony, Nike"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-blue-500" />
                    Stock Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white transition-all shadow-sm"
                    placeholder="100"
                  />
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Mark as Featured Product
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detailed Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white transition-all shadow-sm resize-none"
                  placeholder="Share the story of this product..."
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-8"
            >
              {/* Image Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                    <ImageIcon className="h-4 w-4 text-pink-500" />
                    Product Gallery
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                    {formData.images.length} Images
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:ring-2 focus:ring-pink-500/50 outline-none dark:text-white transition-all shadow-sm"
                    placeholder="https://example.com/image.jpg"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="p-3 bg-pink-500/10 text-pink-500 rounded-xl hover:bg-pink-500 hover:text-white transition-all shadow-lg shadow-pink-500/5"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* File Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Or Upload Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium">
                      <Upload className="h-4 w-4" />
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileUpload}
                      />
                    </label>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                    {uploadProgress === 100 && (
                      <span className="text-emerald-500 text-xs font-bold">Uploaded!</span>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-500 font-medium">{uploadError}</p>
                  )}
                  {formData.image_url && (
                    <p className="text-xs text-slate-400 truncate">Current: {formData.image_url}</p>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((url: string, index: number) => (
                    <div key={index} className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800 relative group overflow-hidden border-2 border-transparent hover:border-pink-500 transition-all shadow-xl">
                      <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Product ${index}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length === 0 && (
                    <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-2 col-span-4 py-8">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                      <p className="text-xs font-medium">No images added yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                  <Video className="h-4 w-4 text-purple-500" />
                  Product Video
                </label>
                <div className="relative group">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    value={formData.video_url}
                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-12 focus:ring-2 focus:ring-purple-500/50 outline-none dark:text-white transition-all shadow-sm"
                    placeholder="YouTube or Video URL... (Optional)"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-emerald-500" />
                    Product Specifications
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add technical details or features</p>
                </div>
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors px-3 py-1.5 bg-emerald-500/10 rounded-lg"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New Spec
                </button>
              </div>

              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={index}
                    className="grid grid-cols-[1fr,1.5fr,auto] gap-3 items-center"
                  >
                    <input
                      value={feature.key}
                      onChange={e => updateFeature(index, 'key', e.target.value)}
                      className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none dark:text-white transition-all shadow-sm"
                      placeholder="e.g. Battery Life"
                    />
                    <input
                      value={feature.value}
                      onChange={e => updateFeature(index, 'value', e.target.value)}
                      className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none dark:text-white transition-all shadow-sm"
                      placeholder="e.g. Up to 40 hours"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                {formData.features.length === 0 && (
                  <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/50 dark:bg-slate-900/20">
                    <Settings2 className="h-10 w-10 opacity-10" />
                    <p className="text-sm font-medium">Define specifications for a premium listing</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'links' && (
            <motion.div
              key="links"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-sky-500" />
                    Resource Links
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manuals, support pages, or tutorials</p>
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-2 text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors px-3 py-1.5 bg-sky-500/10 rounded-lg"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Link
                </button>
              </div>

              <div className="space-y-3">
                {formData.links.map((link, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={index}
                    className="grid grid-cols-[1fr,2fr,auto] gap-3 items-center"
                  >
                    <input
                      value={link.label}
                      onChange={e => updateLink(index, 'label', e.target.value)}
                      className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500/50 outline-none dark:text-white transition-all shadow-sm"
                      placeholder="Label (e.g. User Manual)"
                    />
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        value={link.url}
                        onChange={e => updateLink(index, 'url', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-9 text-sm focus:ring-2 focus:ring-sky-500/50 outline-none dark:text-white transition-all shadow-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                {formData.links.length === 0 && (
                  <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/50 dark:bg-slate-900/20">
                    <LinkIcon className="h-10 w-10 opacity-10" />
                    <p className="text-sm font-medium">Link tutorials or external resources</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-white/5 backdrop-blur-xl flex justify-between items-center">
        <div className="text-xs text-slate-500 font-medium">
          {activeTab === 'basic' && "Step 1 of 4: Basic Information"}
          {activeTab === 'media' && "Step 2 of 4: Media Assets"}
          {activeTab === 'features' && "Step 3 of 4: Specifications"}
          {activeTab === 'links' && "Step 4 of 4: Connect Resources"}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] border-t border-white/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {initialData ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
