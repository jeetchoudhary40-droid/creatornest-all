'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, ShoppingCart, Loader2, Upload, Image as ImageIcon, Wrench } from 'lucide-react';
import { ITEMS as staticItems } from '@/app/marketplace/marketData';
import { getUUIDFromStaticId } from '@/lib/uuidHelper';

const STATIC_TOOLS = staticItems
  .filter(item => item.type !== 'service')
  .map(item => {
    let priceVal = 0;
    if (item.meta && item.meta.includes('₹')) {
      const numStr = item.meta.replace(/[^0-9]/g, '');
      if (numStr) priceVal = parseInt(numStr, 10);
    }
    return {
      id: getUUIDFromStaticId(String(item.id)),
      item_type: item.type,
      title: item.title,
      short_desc: item.desc,
      long_desc: item.details?.longDesc || item.desc,
      category: item.category,
      icon: item.icon?.name || item.icon?.displayName || 'Wrench',
      accent: item.accent || '#00F2FE',
      plan: item.plan || 'free',
      price: priceVal,
      rating: item.rating || 5.0,
      thumbnail_url: item.thumbnailUrl || '',
      file_url: '',
      external_url: item.href || '',
      tags: item.tags || [],
      features: item.details?.features || []
    };
  });

export default function AdminToolsPage() {
  const [items, setItems] = useState<any[]>(() => STATIC_TOOLS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tools' | 'leads'>('tools');
  const [calculatorLeads, setCalculatorLeads] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    item_type: 'tool',
    title: '',
    short_desc: '',
    long_desc: '',
    category: 'AI Tools',
    icon: 'Brain',
    accent: '#00F2FE',
    plan: 'free',
    price: '0',
    rating: '5.0',
    thumbnail_url: '',
    file_url: '',
    external_url: '',
    tags: '',
    features: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);

  const fetchItems = async () => {
    setLoading(true);

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cn_market_items');
      if (cached) {
        const parsed = JSON.parse(cached);
        const toolsOnly = parsed.filter((i: any) => i.item_type !== 'service');
        if (toolsOnly.length > 0) {
          setItems(toolsOnly);
        }
      }

      const cachedLeads = localStorage.getItem('cn_calculator_leads');
      if (cachedLeads) {
        setCalculatorLeads(JSON.parse(cachedLeads));
      }
    }

    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .neq('item_type', 'service')
        .order('created_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        setItems(data);
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('cn_market_items');
          let allItems = cached ? JSON.parse(cached) : [];
          allItems = allItems.filter((i: any) => i.item_type === 'service');
          allItems = [...allItems, ...data];
          localStorage.setItem('cn_market_items', JSON.stringify(allItems));
        }
      } else {
        if (items.length === 0) {
          setItems(STATIC_TOOLS);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch tools, keeping static fallback", e);
      if (items.length === 0) {
        setItems(STATIC_TOOLS);
      }
    }

    try {
      const { data: leadData } = await supabase
        .from('calculator_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (leadData && leadData.length > 0) {
        setCalculatorLeads(leadData);
      }
    } catch (e) {
      console.warn("Failed to fetch leads from supabase", e);
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
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_type: 'tool', title: '', short_desc: '', long_desc: '', category: 'AI Tools', icon: 'Brain', accent: '#00F2FE', plan: 'free', price: '0', rating: '5.0', thumbnail_url: '', file_url: '', external_url: '', tags: '', features: ''
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
        try {
          const ext = imageFile.name.split('.').pop();
          const name = `${Date.now()}-thumb.${ext}`;
          const { error } = await supabase.storage.from('tools-assets').upload(`images/${name}`, imageFile);
          if (!error) {
            const { data: { publicUrl } } = supabase.storage.from('tools-assets').getPublicUrl(`images/${name}`);
            finalThumb = publicUrl;
          }
        } catch (uploadErr) {
          console.warn("Storage upload failed, keeping original thumbnail", uploadErr);
        }
      }

      // Handle File Upload
      if (assetFile) {
        try {
          const ext = assetFile.name.split('.').pop();
          const name = `${Date.now()}-asset.${ext}`;
          const { error } = await supabase.storage.from('tools-assets').upload(`files/${name}`, assetFile);
          if (!error) {
            const { data: { publicUrl } } = supabase.storage.from('tools-assets').getPublicUrl(`files/${name}`);
            finalFile = publicUrl;
          }
        } catch (uploadErr) {
          console.warn("Storage upload failed, keeping original file", uploadErr);
        }
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
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean)
      };

      let updatedList = [];
      if (editingItem) {
        try {
          await supabase.from('market_items').update(payload).eq('id', editingItem.id);
        } catch (dbErr) {
          console.warn("Offline: Updating tool locally", dbErr);
        }
        updatedList = items.map(item => item.id === editingItem.id ? { ...item, ...payload } : item);
      } else {
        const newItem = {
          id: `item-${Date.now()}`,
          ...payload
        };
        try {
          await supabase.from('market_items').insert([payload]);
        } catch (dbErr) {
          console.warn("Offline: Inserting tool locally", dbErr);
        }
        updatedList = [newItem, ...items];
      }

      setItems(updatedList);

      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cn_market_items');
        let allItems = cached ? JSON.parse(cached) : [];
        allItems = allItems.filter((i: any) => i.item_type === 'service'); // Keep only services
        allItems = [...allItems, ...updatedList];
        localStorage.setItem('cn_market_items', JSON.stringify(allItems));
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert("Error saving tool: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      try {
        await supabase.from('market_items').delete().eq('id', id);
      } catch (dbErr) {
        console.warn("Offline: Deleting tool locally", dbErr);
      }
      const updatedList = items.filter(item => item.id !== id);
      setItems(updatedList);

      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cn_market_items');
        if (cached) {
          let allItems = JSON.parse(cached);
          allItems = allItems.filter((i: any) => String(i.id) !== String(id));
          localStorage.setItem('cn_market_items', JSON.stringify(allItems));
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Tools & Intelligence Management</h1>
            <p className="text-sm text-gray-400">Manage Tools, Templates, Assets & Creator Pricing Calculator Inquiries</p>
          </div>
        </div>
        
        {activeTab === 'tools' && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary text-background px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Tool
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tools & Assets ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>Calculator Creator Leads</span>
          {calculatorLeads.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
              {calculatorLeads.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'tools' ? (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider bg-white/5">
                  <th className="px-6 py-4 font-semibold">Tool Title</th>
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
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading tools...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No tools found. Create one above!</td>
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
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors ml-2 cursor-pointer">
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
      ) : (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Creator Rate Inquiries & Capacity Logs</h3>
              <p className="text-xs text-gray-400">Creators who calculated their brand deal pricing and capacity on the website</p>
            </div>
            <button
              onClick={() => fetchItems()}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/10"
            >
              Refresh Inquiries
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider bg-white/5">
                  <th className="px-4 py-3 font-semibold">Channel / Handle</th>
                  <th className="px-4 py-3 font-semibold">Platform</th>
                  <th className="px-4 py-3 font-semibold">Followers</th>
                  <th className="px-4 py-3 font-semibold">Avg Views</th>
                  <th className="px-4 py-3 font-semibold">Niche</th>
                  <th className="px-4 py-3 font-semibold">Base Deal Rate</th>
                  <th className="px-4 py-3 font-semibold">Monthly Capacity</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {calculatorLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      No calculator leads recorded yet. Try calculating a rate on the tool!
                    </td>
                  </tr>
                ) : (
                  calculatorLeads.map((lead: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        <span className="text-emerald-400">{lead.handle}</span>
                        {lead.email && <span className="block text-[10px] text-gray-400 font-normal">{lead.email}</span>}
                      </td>
                      <td className="px-4 py-3.5 capitalize text-gray-300">{lead.platform}</td>
                      <td className="px-4 py-3.5 font-mono text-gray-300">{(lead.followers || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 font-mono text-gray-300">{(lead.avg_views || lead.avgViews || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-gray-300">{lead.niche}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        ₹{(lead.base_rate || lead.calculatedBaseRate || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-cyan-300">{lead.monthly_capacity || lead.estimatedMonthlyCapacity || '-'}</td>
                      <td className="px-4 py-3.5 text-gray-500 text-[10px]">
                        {lead.created_at || lead.timestamp ? new Date(lead.created_at || lead.timestamp).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit Tool' : 'Add New Tool'}</h2>
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
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                    <input 
                      type="text" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. Scripting, Design, Pack"
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
                      placeholder="e.g. Brain, Scissors, Palette"
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
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Features / Bullet points (One per line)</label>
                    <textarea 
                      value={formData.features} 
                      onChange={e => setFormData({...formData, features: e.target.value})}
                      rows={4}
                      placeholder="Fully customisable Notion Template&#10;Access to 10+ prompt libraries"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none leading-relaxed" 
                    />
                  </div>
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
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">External Link</label>
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
                  {uploading ? 'Saving...' : 'Save Tool'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
