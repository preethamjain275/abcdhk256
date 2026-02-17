import { useState, useEffect } from 'react';
import { 
  Save, 
  Globe, 
  Shield, 
  CreditCard,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
      siteName: '',
      description: '',
      supportEmail: '',
      logoUrl: '',
      taxRate: 0,
      shippingFlatRate: 0,
      minFreeShipping: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*');
      
      if (data) {
          const siteInfo = data.find(s => s.key === 'site_info')?.value || {};
          const taxConfig = data.find(s => s.key === 'tax_config')?.value || {};

          setSettings({
              siteName: siteInfo.name || '',
              description: siteInfo.description || '',
              supportEmail: siteInfo.support_email || '',
              logoUrl: siteInfo.logo_url || '',
              taxRate: taxConfig.rate ? taxConfig.rate * 100 : 0, // Store as percentage
              shippingFlatRate: taxConfig.shipping_rate || 0,
              minFreeShipping: taxConfig.free_shipping_threshold || 0
          });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
      try {
          setSaving(true);
          
          await supabase.from('site_settings').upsert([
              { 
                  key: 'site_info', 
                  value: { 
                      name: settings.siteName, 
                      description: settings.description,
                      support_email: settings.supportEmail,
                      logo_url: settings.logoUrl 
                  },
                  description: 'General site information'
              },
              {
                  key: 'tax_config', 
                  value: { 
                      rate: settings.taxRate / 100, 
                      shipping_rate: settings.shippingFlatRate,
                      free_shipping_threshold: settings.minFreeShipping
                  },
                  description: 'Tax and shipping configuration'
              }
          ]);

          toast.success('Settings saved successfully');
      } catch (error) {
          console.error('Error saving settings:', error);
          toast.error('Failed to save settings');
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
      return (
          <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Store Settings</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your store's global preferences.</p>
        </div>
        <button 
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
        >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
        </button>
      </div>

      <div className="grid gap-8">
          {/* General Information */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <Globe className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">General Information</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Store Name</label>
                      <input 
                          value={settings.siteName}
                          onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Support Email</label>
                      <input 
                          value={settings.supportEmail}
                          onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white"
                      />
                  </div>
                  <div className="col-span-full space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Store Description</label>
                      <textarea 
                          rows={3}
                          value={settings.description}
                          onChange={(e) => setSettings({...settings, description: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white"
                      />
                  </div>
                  <div className="col-span-full space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo URL</label>
                      <div className="flex gap-2">
                          <input 
                              value={settings.logoUrl}
                              onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white"
                              placeholder="https://..."
                          />
                          {settings.logoUrl && (
                              <div className="h-10 w-10 rounded border overflow-hidden flex-shrink-0">
                                  <img src={settings.logoUrl} alt="Logo Preview" className="h-full w-full object-contain" />
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </section>

          {/* Financial Settings */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Store Configuration</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Rate (%)</label>
                      <input 
                          type="number"
                          value={settings.taxRate}
                          onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none dark:text-white"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shipping Flat Rate ($)</label>
                      <input 
                          type="number"
                          value={settings.shippingFlatRate}
                          onChange={(e) => setSettings({...settings, shippingFlatRate: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none dark:text-white"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Free Shipping Min ($)</label>
                      <input 
                          type="number"
                          value={settings.minFreeShipping}
                          onChange={(e) => setSettings({...settings, minFreeShipping: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none dark:text-white"
                      />
                  </div>
              </div>
          </section>
      </div>
    </div>
  );
}
