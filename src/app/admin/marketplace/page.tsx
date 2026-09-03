'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, ShoppingCart, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

import { ITEMS as staticItems } from '@/app/marketplace/marketData';

const STATIC_MARKET_ITEMS = staticItems.map(item => {
  let priceVal = 0;
  if (item.meta && item.meta.includes('₹')) {
    const numStr = item.meta.replace(/[^0-9]/g, '');
    if (numStr) priceVal = parseInt(numStr, 10);
  }
  return {
    id: String(item.id),
    item_type: item.type,
    title: item.title,
    short_desc: item.desc,
    long_desc: item.details?.longDesc || item.desc,
    category: item.category,
    icon: item.icon?.name || item.icon?.displayName || 'Sparkles',
    accent: item.accent,
    plan: item.plan,
    price: priceVal,
    rating: item.rating || 5.0,
    thumbnail_url: item.thumbnailUrl || '',
    file_url: '',
    external_url: item.href || '',
    tags: item.tags || [],
    features: item.details || []
  };
});

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<any[]>(() => STATIC_MARKET_ITEMS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    item_type: 'tool',
    title: '',
    short_desc: '',
    long_desc: '',
    category: '',
    icon: 'Brain',
    accent: '#00F2FE',
    plan: 'free',
    price: '0',
    rating: '5.0',
    thumbnail_url: '',
    file_url: '',
    external_url: '',
    tags: '',
    features: '',
    
    // Service-specific details
    service_provider: 'Creator Nest',
    service_delivery: '3-5 Days',
    service_revisions: '3',
    pkg_basic_name: 'Basic',
    pkg_basic_price: '1499',
    pkg_basic_delivery: '72 hours',
    pkg_basic_revisions: '1',
    pkg_basic_features: '',
    pkg_standard_name: 'Standard',
    pkg_standard_price: '2999',
    pkg_standard_delivery: '48 hours',
    pkg_standard_revisions: '3',
    pkg_standard_features: '',
    pkg_premium_name: 'Premium',
    pkg_premium_price: '5999',
    pkg_premium_delivery: '24 hours',
    pkg_premium_revisions: '5',
    pkg_premium_features: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('market_items').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setItems(data);
      } else {
        setItems(STATIC_MARKET_ITEMS);
      }
    } catch (e) {
      console.warn("Failed to fetch market items, keeping static fallback", e);
      setItems(prev => prev.length > 0 ? prev : STATIC_MARKET_ITEMS);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item?: any) => {
    setImageFile(null);
    setAssetFile(null);
    if (item) {
      setEditingItem(item);
      
      const dbFeatures = item.features;
      const isJsonFeatures = dbFeatures && typeof dbFeatures === 'object' && !Array.isArray(dbFeatures);
      const pkgList = isJsonFeatures ? dbFeatures.packages : (item.details?.packages || []);
      const basicPkg = pkgList?.[0] || {};
      const standardPkg = pkgList?.[1] || {};
      const premiumPkg = pkgList?.[2] || {};
      
      setFormData({
        item_type: item.item_type || 'tool',
        title: item.title || '',
        short_desc: item.short_desc || '',
        long_desc: item.long_desc || '',
        category: item.category || '',
        icon: item.icon || 'Brain',
        accent: item.accent || '#00F2FE',
        plan: item.plan || 'free',
        price: item.price?.toString() || '0',
        rating: item.rating?.toString() || '5.0',
        thumbnail_url: item.thumbnail_url || '',
        file_url: item.file_url || '',
        external_url: item.external_url || '',
        tags: item.tags ? (Array.isArray(item.tags) ? item.tags.join(', ') : item.tags) : '',
        features: isJsonFeatures 
          ? (dbFeatures.features ? dbFeatures.features.join('\n') : '') 
          : (Array.isArray(dbFeatures) ? dbFeatures.join('\n') : ''),
        
        // Service details
        service_provider: isJsonFeatures ? (dbFeatures.provider || 'Creator Nest') : (item.details?.provider || 'Creator Nest'),
        service_delivery: isJsonFeatures ? (dbFeatures.delivery_time || '3-5 Days') : (item.details?.delivery_time || '3-5 Days'),
        service_revisions: isJsonFeatures ? (dbFeatures.revisions?.toString() || '3') : (item.details?.revisions?.toString() || '3'),
        
        // Basic Package
        pkg_basic_name: basicPkg.name || 'Basic',
        pkg_basic_price: basicPkg.price?.toString() || '1499',
        pkg_basic_delivery: basicPkg.delivery || '72 hours',
        pkg_basic_revisions: basicPkg.revisions?.toString() || '1',
        pkg_basic_features: basicPkg.features ? basicPkg.features.join('\n') : '',

        // Standard Package
        pkg_standard_name: standardPkg.name || 'Standard',
        pkg_standard_price: standardPkg.price?.toString() || '2999',
        pkg_standard_delivery: standardPkg.delivery || '48 hours',
        pkg_standard_revisions: standardPkg.revisions?.toString() || '3',
        pkg_standard_features: standardPkg.features ? standardPkg.features.join('\n') : '',

        // Premium Package
        pkg_premium_name: premiumPkg.name || 'Premium',
        pkg_premium_price: premiumPkg.price?.toString() || '5999',
        pkg_premium_delivery: premiumPkg.delivery || '24 hours',
        pkg_premium_revisions: premiumPkg.revisions?.toString() || '5',
        pkg_premium_features: premiumPkg.features ? premiumPkg.features.join('\n') : '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_type: 'tool', title: '', short_desc: '', long_desc: '', category: '', icon: 'Brain', accent: '#00F2FE', plan: 'free', price: '0', rating: '5.0', thumbnail_url: '', file_url: '', external_url: '', tags: '', features: '',
        service_provider: 'Creator Nest', service_delivery: '3-5 Days', service_revisions: '3',
        pkg_basic_name: 'Basic', pkg_basic_price: '1499', pkg_basic_delivery: '72 hours', pkg_basic_revisions: '1', pkg_basic_features: '',
        pkg_standard_name: 'Standard', pkg_standard_price: '2999', pkg_standard_delivery: '48 hours', pkg_standard_revisions: '3', pkg_standard_features: '',
        pkg_premium_name: 'Premium', pkg_premium_price: '5999', pkg_premium_delivery: '24 hours', pkg_premium_revisions: '5', pkg_premium_features: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      let finalThumb = formData.thumbnail_url;
      let finalFile = formData.file_url;

      // Handle Image Upload
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const name = `${Date.now()}-thumb.${ext}`;
        const { error } = await supabase.storage.from('tools-assets').upload(`images/${name}`, imageFile);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('tools-assets').getPublicUrl(`images/${name}`);
          finalThumb = publicUrl;
        }
      }

      // Handle File Upload
      if (assetFile) {
        const ext = assetFile.name.split('.').pop();
        const name = `${Date.now()}-asset.${ext}`;
        const { error } = await supabase.storage.from('tools-assets').upload(`files/${name}`, assetFile);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('tools-assets').getPublicUrl(`files/${name}`);
          finalFile = publicUrl;
        }
      }

      let finalFeatures: any = formData.features.split('\n').map(f => f.trim()).filter(Boolean);
      
      if (formData.item_type === 'service') {
        finalFeatures = {
          provider: formData.service_provider,
          delivery_time: formData.service_delivery,
          revisions: parseInt(formData.service_revisions) || 3,
          features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
          packages: [
            {
              name: formData.pkg_basic_name,
              price: parseFloat(formData.pkg_basic_price) || 0,
              delivery: formData.pkg_basic_delivery,
              revisions: parseInt(formData.pkg_basic_revisions) || 0,
              features: formData.pkg_basic_features.split('\n').map(f => f.trim()).filter(Boolean)
            },
            {
              name: formData.pkg_standard_name,
              price: parseFloat(formData.pkg_standard_price) || 0,
              delivery: formData.pkg_standard_delivery,
              revisions: parseInt(formData.pkg_standard_revisions) || 0,
              features: formData.pkg_standard_features.split('\n').map(f => f.trim()).filter(Boolean)
            },
            {
              name: formData.pkg_premium_name,
              price: parseFloat(formData.pkg_premium_price) || 0,
              delivery: formData.pkg_premium_delivery,
              revisions: parseInt(formData.pkg_premium_revisions) || 0,
              features: formData.pkg_premium_features.split('\n').map(f => f.trim()).filter(Boolean)
            }
          ],
          faqs: editingItem?.features?.faqs || [
            { q: 'What formats do you accept?', a: 'We accept MP4, MOV, MKV, and all major raw formats from DSLRs, mirrorless cameras, and screen recordings.' },
            { q: 'How do I share my footage?', a: 'After booking, you\'ll receive a Google Drive upload link. We start editing once all footage is uploaded.' },
            { q: 'Can I request a specific editing style?', a: 'Yes! Share reference videos during onboarding and we\'ll match the style, pacing, and tone.' }
          ]
        };
      }

      const payload = { 
        item_type: formData.item_type,
        title: formData.title,
        short_desc: formData.short_desc,
        long_desc: formData.long_desc,
        category: formData.category,
        icon: formData.icon,
        accent: formData.accent,
        plan: formData.plan,
        price: parseFloat(formData.price) || 0,
        rating: parseFloat(formData.rating) || 5.0,
        thumbnail_url: finalThumb,
        file_url: finalFile,
        external_url: formData.external_url,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        features: finalFeatures
      };

      if (editingItem) {
        try {
          await supabase.from('market_items').update(payload).eq('id', editingItem.id);
        } catch (dbErr) {
          console.warn("Offline: Updating market item locally", dbErr);
        }
        setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...payload } : item));
      } else {
        const newItem = {
          id: `item-${Date.now()}`,
          ...payload
        };
        try {
          await supabase.from('market_items').insert([payload]);
        } catch (dbErr) {
          console.warn("Offline: Inserting market item locally", dbErr);
        }
        setItems(prev => [newItem, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert("Error saving item: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await supabase.from('market_items').delete().eq('id', id);
      } catch (dbErr) {
        console.warn("Offline: Deleting market item locally", dbErr);
      }
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Marketplace Management</h1>
            <p className="text-sm text-gray-400">Manage Tools, Services, Templates, and Prompts</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-background px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider bg-white/5">
                <th className="px-6 py-4 font-semibold">Item Title</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No items found. Create one above!</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{item.short_desc}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 rounded border border-white/10 bg-white/5 capitalize text-gray-300 font-medium text-xs">
                        {item.item_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.plan === 'free' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        item.plan === 'silver' ? 'bg-gray-400/10 text-gray-300 border border-gray-400/20' :
                        item.plan === 'gold' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {item.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {item.price > 0 ? `₹${item.price}` : 'Free'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-surface z-20">
                <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Item Type</label>
                    <select 
                      value={formData.item_type} 
                      onChange={e => setFormData({...formData, item_type: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none"
                    >
                      <option value="tool">AI Tool</option>
                      <option value="service">Service</option>
                      <option value="template">Template</option>
                      <option value="prompt">Prompt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Required</label>
                    <select 
                      value={formData.plan} 
                      onChange={e => setFormData({...formData, plan: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none"
                    >
                      <option value="free">Free</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Title</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Short Description</label>
                    <textarea 
                      value={formData.short_desc} 
                      onChange={e => setFormData({...formData, short_desc: e.target.value})}
                      rows={2}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Long Description</label>
                    <textarea 
                      value={formData.long_desc} 
                      onChange={e => setFormData({...formData, long_desc: e.target.value})}
                      rows={4}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category / Badge</label>
                    <input 
                      type="text" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. Video Editing, Notion"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Icon Name</label>
                    <input 
                      type="text" 
                      value={formData.icon} 
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      placeholder="e.g. Brain, Scissors, Layout"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tags (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={formData.tags} 
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      placeholder="e.g. Growth, AI, ChatGPT"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Features / What's Included (One per line)</label>
                    <textarea 
                      value={formData.features} 
                      onChange={e => setFormData({...formData, features: e.target.value})}
                      rows={4}
                      placeholder="Fully customisable Notion Template&#10;Access to 10+ prompt libraries"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none leading-relaxed" 
                    />
                  </div>

                  {formData.item_type === 'service' && (
                    <div className="md:col-span-3 border-t border-white/5 pt-4 mt-2 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Service Details & Pricing Packages</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Provider Name</label>
                          <input 
                            type="text" 
                            value={formData.service_provider} 
                            onChange={e => setFormData({...formData, service_provider: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Standard Delivery Time</label>
                          <input 
                            type="text" 
                            value={formData.service_delivery} 
                            onChange={e => setFormData({...formData, service_delivery: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Standard Revisions</label>
                          <input 
                            type="number" 
                            value={formData.service_revisions} 
                            onChange={e => setFormData({...formData, service_revisions: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                          />
                        </div>
                      </div>

                      {/* Packages Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        {/* Basic Package */}
                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold text-primary uppercase">Basic Package</h4>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Package Name</label>
                            <input type="text" value={formData.pkg_basic_name} onChange={e => setFormData({...formData, pkg_basic_name: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                            <input type="number" value={formData.pkg_basic_price} onChange={e => setFormData({...formData, pkg_basic_price: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Delivery Time</label>
                            <input type="text" value={formData.pkg_basic_delivery} onChange={e => setFormData({...formData, pkg_basic_delivery: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Revisions</label>
                            <input type="number" value={formData.pkg_basic_revisions} onChange={e => setFormData({...formData, pkg_basic_revisions: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deliverables (one per line)</label>
                            <textarea rows={3} value={formData.pkg_basic_features} onChange={e => setFormData({...formData, pkg_basic_features: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50 leading-normal" />
                          </div>
                        </div>

                        {/* Standard Package */}
                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold text-primary uppercase">Standard Package</h4>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Package Name</label>
                            <input type="text" value={formData.pkg_standard_name} onChange={e => setFormData({...formData, pkg_standard_name: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                            <input type="number" value={formData.pkg_standard_price} onChange={e => setFormData({...formData, pkg_standard_price: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Delivery Time</label>
                            <input type="text" value={formData.pkg_standard_delivery} onChange={e => setFormData({...formData, pkg_standard_delivery: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Revisions</label>
                            <input type="number" value={formData.pkg_standard_revisions} onChange={e => setFormData({...formData, pkg_standard_revisions: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deliverables (one per line)</label>
                            <textarea rows={3} value={formData.pkg_standard_features} onChange={e => setFormData({...formData, pkg_standard_features: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50 leading-normal" />
                          </div>
                        </div>

                        {/* Premium Package */}
                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold text-primary uppercase">Premium Package</h4>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Package Name</label>
                            <input type="text" value={formData.pkg_premium_name} onChange={e => setFormData({...formData, pkg_premium_name: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                            <input type="number" value={formData.pkg_premium_price} onChange={e => setFormData({...formData, pkg_premium_price: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Delivery Time</label>
                            <input type="text" value={formData.pkg_premium_delivery} onChange={e => setFormData({...formData, pkg_premium_delivery: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Revisions</label>
                            <input type="number" value={formData.pkg_premium_revisions} onChange={e => setFormData({...formData, pkg_premium_revisions: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deliverables (one per line)</label>
                            <textarea rows={3} value={formData.pkg_premium_features} onChange={e => setFormData({...formData, pkg_premium_features: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-primary/50 leading-normal" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Media & Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Thumbnail Image</label>
                    <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold truncate">{imageFile ? imageFile.name : (formData.thumbnail_url ? 'Replace Image' : 'Upload Image')}</p>
                          <p className="text-xs text-gray-500">PNG, JPG, WebP</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Downloadable Asset</label>
                    <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-secondary/30 transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        onChange={e => setAssetFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold truncate">{assetFile ? assetFile.name : (formData.file_url ? 'Replace File' : 'Upload File')}</p>
                          <p className="text-xs text-gray-500">ZIP, PDF, DOCX</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">External Link (For interactive tools or external checkout)</label>
                    <input 
                      type="url" 
                      value={formData.external_url} 
                      onChange={e => setFormData({...formData, external_url: e.target.value})}
                      placeholder="https://google.com"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                </div>

              </div>
              
              <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-surface z-20">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-colors">Cancel</button>
                <button 
                  onClick={handleSave} 
                  disabled={!formData.title || uploading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-background hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  {uploading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
