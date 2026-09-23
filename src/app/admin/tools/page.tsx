'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, X, Save, ShoppingCart, Loader2, 
  Upload, Image as ImageIcon, Wrench, CheckCircle2, IndianRupee,
  Download, ExternalLink, RefreshCw
} from 'lucide-react';
import { auth } from '@/lib/auth';

export default function AdminToolsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tools' | 'leads' | 'orders'>('tools');
  const [calculatorLeads, setCalculatorLeads] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
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

    // 1. Fetch persistent server tools
    try {
      const token = auth.getToken();
      const res = await fetch('/api/admin/tools', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.tools) {
        setItems(data.tools);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cn_market_items', JSON.stringify(data.tools));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch tools from /api/admin/tools, trying localStorage", e);
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cn_market_items');
        if (cached) setItems(JSON.parse(cached));
      }
    }

    // 2. Fetch leads
    if (typeof window !== 'undefined') {
      const cachedLeads = localStorage.getItem('cn_calculator_leads');
      if (cachedLeads) {
        setCalculatorLeads(JSON.parse(cachedLeads));
      }
    }

    // 3. Fetch Orders
    try {
      const token = auth.getToken();
      const resOrders = await fetch('/api/admin/orders', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const ordersData = await resOrders.json();
      if (ordersData.success && ordersData.orders) {
        setOrders(ordersData.orders);
      }
    } catch (e) {
      console.warn("Failed to fetch orders", e);
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
        category: item.category || 'AI Tools',
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
      const token = auth.getToken();

      // Handle Image Upload via Server API
      if (imageFile) {
        try {
          const imgData = new FormData();
          imgData.append('file', imageFile);
          imgData.append('category', 'thumbnail');

          const uploadRes = await fetch('/api/admin/tools/upload', {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: imgData
          });
          const uploadJson = await uploadRes.json();
          if (uploadJson.success && uploadJson.url) {
            finalThumb = uploadJson.url;
          } else {
            console.warn('Image upload error:', uploadJson.error);
          }
        } catch (uploadErr) {
          console.warn("Server thumbnail upload failed", uploadErr);
        }
      }

      // Handle Digital Asset File Upload via Server API
      if (assetFile) {
        try {
          const fileData = new FormData();
          fileData.append('file', assetFile);
          fileData.append('category', 'asset');

          const uploadRes = await fetch('/api/admin/tools/upload', {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: fileData
          });
          const uploadJson = await uploadRes.json();
          if (uploadJson.success && uploadJson.url) {
            finalFile = uploadJson.url;
          } else {
            console.warn('Asset upload error:', uploadJson.error);
          }
        } catch (uploadErr) {
          console.warn("Server asset upload failed", uploadErr);
        }
      }

      const payload = { 
        id: editingItem ? editingItem.id : undefined,
        item_type: formData.item_type,
        title: formData.title,
        short_desc: formData.short_desc,
        long_desc: formData.long_desc || formData.short_desc,
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
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
        is_published: true
      };

      // Save to server database
      const saveRes = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const saveJson = await saveRes.json();

      if (!saveRes.ok || !saveJson.success) {
        throw new Error(saveJson.error || 'Failed to save tool on server');
      }

      const savedTool = saveJson.tool;

      // Update local state
      let updatedList: any[] = [];
      if (editingItem) {
        updatedList = items.map(item => item.id === editingItem.id ? savedTool : item);
      } else {
        updatedList = [savedTool, ...items];
      }

      setItems(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cn_market_items', JSON.stringify(updatedList));
      }

      setIsModalOpen(false);
      alert('Tool successfully published to live website!');
    } catch (err: any) {
      alert("Error saving tool: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tool? It will be removed from the public website.')) {
      try {
        const token = auth.getToken();
        await fetch(`/api/admin/tools?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        const updatedList = items.filter(item => String(item.id) !== String(id));
        setItems(updatedList);

        if (typeof window !== 'undefined') {
          localStorage.setItem('cn_market_items', JSON.stringify(updatedList));
        }
      } catch (err: any) {
        alert("Failed to delete tool: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Tools & Digital Store Management</h1>
            <p className="text-sm text-gray-400">Sell AI tools, scripts & templates with automated Cashfree payments & downloads</p>
          </div>
        </div>
        
        {activeTab === 'tools' && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary text-background px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add AI Tool
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
          Published Tools ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Orders & Sales</span>
          {orders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono">
              {orders.length}
            </span>
          )}
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

      {/* Tab 1: Tools & Assets */}
      {activeTab === 'tools' && (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider bg-white/5">
                  <th className="px-6 py-4 font-semibold">Tool Title & Asset</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Downloadable File</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading tools from server...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No tools published yet. Click Add Tool to upload your first product!</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                              <Wrench className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-xs">{item.title}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{item.short_desc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2.5 py-1 rounded border border-white/10 bg-white/5 capitalize text-gray-300 font-medium text-xs">
                          {item.category || 'AI Tools'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.plan === 'free' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          item.plan === 'silver' ? 'bg-gray-400/10 text-gray-300 border border-gray-400/20' :
                          item.plan === 'gold' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {item.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white font-mono">
                        {item.price > 0 ? (
                          <span className="text-emerald-400 font-bold">₹{item.price}</span>
                        ) : (
                          <span className="text-green-400 font-bold">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {item.file_url ? (
                          <a 
                            href={`/api/tools/download?tool_id=${item.id}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Asset</span>
                          </a>
                        ) : (
                          <span className="text-gray-500 italic">No asset attached</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Edit Tool">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors ml-2 cursor-pointer" title="Delete Tool">
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
      )}

      {/* Tab 2: Orders & Sales */}
      {activeTab === 'orders' && (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <span>Cashfree Payment Orders & Deliveries</span>
              </h3>
              <p className="text-xs text-gray-400">Real-time log of customer tool purchases and automated downloads</p>
            </div>
            <button
              onClick={() => fetchItems()}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider bg-white/5">
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Tool Purchased</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No customer orders recorded yet. Make a purchase on the public site to test!
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">
                        {order.orderId}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        {order.toolTitle}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-white font-medium block">{order.customerName || 'Customer'}</span>
                        <span className="text-gray-400 text-[10px] block font-mono">{order.customerEmail || order.customerPhone || '-'}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        {order.amount > 0 ? `₹${order.amount}` : 'Free'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {order.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-[10px] font-mono">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leads */}
      {activeTab === 'leads' && (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Creator Rate Inquiries & Capacity Logs</h3>
              <p className="text-xs text-gray-400">Creators who calculated their brand deal pricing and capacity on the website</p>
            </div>
            <button
              onClick={() => fetchItems()}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/10 cursor-pointer"
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

      {/* Add/Edit Tool Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B1017] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#0B1017] z-20">
                <div>
                  <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit AI Tool' : 'Add New AI Tool'}</h2>
                  <p className="text-xs text-gray-400">Configure product details, pricing in ₹, and upload downloadable asset</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Type</label>
                    <select 
                      value={formData.item_type} 
                      onChange={e => setFormData({...formData, item_type: e.target.value})}
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none"
                    >
                      <option value="tool">AI Tool / Software</option>
                      <option value="template">Prompt & Script Template</option>
                      <option value="prompt">Agency Pitch & Contract Kit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Tier</label>
                    <select 
                      value={formData.plan} 
                      onChange={e => setFormData({...formData, plan: e.target.value})}
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none"
                    >
                      <option value="free">Free Access</option>
                      <option value="silver">Silver Tier</option>
                      <option value="gold">Gold Tier</option>
                      <option value="platinum">Platinum Tier</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Title</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. YouTube Viral Script & Hook Suite 2026"
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Short Description</label>
                    <textarea 
                      value={formData.short_desc} 
                      onChange={e => setFormData({...formData, short_desc: e.target.value})}
                      rows={2}
                      placeholder="Brief punchy summary shown on tool directory card"
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Long Description & Guide</label>
                    <textarea 
                      value={formData.long_desc} 
                      onChange={e => setFormData({...formData, long_desc: e.target.value})}
                      rows={4}
                      placeholder="Detailed overview explaining what the buyer receives and how to use it"
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
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
                      placeholder="e.g. AI Tools, Scripting, Design"
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Price (₹ INR)</label>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0 for Free, or 499, 999 etc."
                      className="w-full bg-[#141C28] border border-emerald-500/30 rounded-lg px-4 py-2.5 text-emerald-400 font-bold text-sm focus:border-emerald-400 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Icon Name</label>
                    <input 
                      type="text" 
                      value={formData.icon} 
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      placeholder="e.g. Brain, Zap, FileText, Wrench"
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tags (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={formData.tags} 
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      placeholder="e.g. YouTube, Hooks, Retention, AI Tools"
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Key Features / Deliverables (One per line)</label>
                    <textarea 
                      value={formData.features} 
                      onChange={e => setFormData({...formData, features: e.target.value})}
                      rows={4}
                      placeholder="100+ High retention hooks&#10;Editable Notion workspace&#10;Commercial agency license included"
                      className="w-full bg-[#141C28] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 outline-none leading-relaxed" 
                    />
                  </div>
                </div>

                {/* Media & Files */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Thumbnail Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Product Thumbnail Image</label>
                    <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-primary/40 transition-colors cursor-pointer group bg-[#141C28]">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold truncate text-white">
                            {imageFile ? imageFile.name : (formData.thumbnail_url ? 'Replace Image' : 'Upload Image')}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formData.thumbnail_url || 'PNG, JPG, WebP'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Digital Asset */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Downloadable Product Asset (Delivered upon Payment)
                    </label>
                    <div className="relative border-2 border-dashed border-emerald-500/30 rounded-xl p-4 hover:border-emerald-400 transition-colors cursor-pointer group bg-[#141C28]">
                      <input 
                        type="file" 
                        onChange={e => setAssetFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 text-emerald-400 transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold truncate text-white">
                            {assetFile ? assetFile.name : (formData.file_url ? 'Replace Downloadable File' : 'Upload Product File')}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formData.file_url || 'ZIP, PDF, DOCX, TXT, JSON'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#0B1017] z-20">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={!formData.title || uploading}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-background hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  {uploading ? 'Saving & Uploading...' : 'Save & Publish Tool'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
