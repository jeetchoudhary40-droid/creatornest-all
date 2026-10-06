'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, X, Save, ShoppingCart, Loader2, 
  Upload, Image as ImageIcon, Wrench, CheckCircle2, IndianRupee,
  Download, ExternalLink, RefreshCw, Mail, Phone, Search,
  Filter, Eye, Sparkles, Check, Copy, ArrowUpRight,
  TrendingUp, AlertCircle, AlertTriangle
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
  const [toolLeads, setToolLeads] = useState<any[]>([]);
  const [leadToolFilter, setLeadToolFilter] = useState<string>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
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

    // 2. Fetch Universal Tool Leads (from /api/tools/lead)
    try {
      const resLeads = await fetch('/api/tools/lead');
      const leadsData = await resLeads.json();
      if (leadsData.success && leadsData.leads) {
        setToolLeads(leadsData.leads);
        setCalculatorLeads(leadsData.leads);
      }
    } catch (e) {
      console.warn("Failed to fetch leads from /api/tools/lead, checking localStorage", e);
      if (typeof window !== 'undefined') {
        const cachedLeads = localStorage.getItem('cn_calculator_leads');
        if (cachedLeads) {
          try {
            const parsed = JSON.parse(cachedLeads);
            setToolLeads(parsed);
            setCalculatorLeads(parsed);
          } catch {}
        }
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

  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/tools/lead', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setToolLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        setCalculatorLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const exportLeadsCSV = () => {
    if (!filteredToolLeads || filteredToolLeads.length === 0) {
      alert('No leads available to export.');
      return;
    }
    const headers = ['ID', 'Tool', 'Handle', 'Email', 'Phone', 'Subscribers', 'Avg Views', 'Niche', 'Score', 'Primary Need', 'Est Revenue', 'Status', 'Date'];
    const rows = filteredToolLeads.map(l => [
      l.id,
      l.tool_name || l.tool || 'AI Tool',
      l.handle || '',
      l.email || '',
      l.phone || '',
      l.subscribers || l.followers || 0,
      l.avg_views || 0,
      l.niche || '',
      l.overall_score || l.score || '',
      `"${(l.primary_need || l.need || '').replace(/"/g, '""')}"`,
      `"${(l.estimated_monthly_revenue || l.base_rate || '').replace(/"/g, '""')}"`,
      l.status || 'NEW',
      l.created_at || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `creatornest_tool_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredToolLeads = useMemo(() => {
    return toolLeads.filter(lead => {
      if (leadToolFilter !== 'all') {
        const tId = lead.tool_id?.toLowerCase() || '';
        const tName = (lead.tool_name || lead.tool || '').toLowerCase();
        if (leadToolFilter === 'youtube' && !tId.includes('youtube') && !tName.includes('youtube')) return false;
        if (leadToolFilter === 'calculator' && !tId.includes('calculator') && !tName.includes('calculator') && !tName.includes('brand deal')) return false;
        if (leadToolFilter === 'mediakit' && !tId.includes('kit') && !tName.includes('kit')) return false;
      }
      if (leadStatusFilter !== 'all' && (lead.status || 'NEW').toUpperCase() !== leadStatusFilter.toUpperCase()) {
        return false;
      }
      if (leadSearchQuery.trim()) {
        const q = leadSearchQuery.toLowerCase();
        const handleMatch = lead.handle?.toLowerCase().includes(q);
        const emailMatch = lead.email?.toLowerCase().includes(q);
        const nicheMatch = lead.niche?.toLowerCase().includes(q);
        const needMatch = (lead.primary_need || lead.need || '').toLowerCase().includes(q);
        if (!handleMatch && !emailMatch && !nicheMatch && !needMatch) return false;
      }
      return true;
    });
  }, [toolLeads, leadToolFilter, leadStatusFilter, leadSearchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Tools & Creator Telemetry Hub</h1>
            <p className="text-sm text-gray-400">Manage live AI tools, inspect user leads across YouTube audits & calculators, and reach out to creators</p>
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
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>All Tool Leads & Creator Inquiries</span>
          {toolLeads.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
              {toolLeads.length}
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

      {/* Tab 3: Universal Tool Leads & Creator Inquiries */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Creator Leads</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{toolLeads.length}</p>
              <p className="text-[11px] text-gray-500 mt-1">Across all public tools & audits</p>
            </div>

            <div className="bg-surface border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">YouTube Audits</span>
                <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold">▶</div>
              </div>
              <p className="text-2xl font-black text-white">
                {toolLeads.filter(l => (l.tool_id?.includes('youtube') || l.tool_name?.toLowerCase().includes('youtube'))).length}
              </p>
              <p className="text-[11px] text-red-400/80 mt-1">Monetization audits run</p>
            </div>

            <div className="bg-surface border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Deal Calculations</span>
                <IndianRupee className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white">
                {toolLeads.filter(l => (!l.tool_id?.includes('youtube') && !l.tool_name?.toLowerCase().includes('youtube'))).length}
              </p>
              <p className="text-[11px] text-cyan-400/80 mt-1">Pricing & Media kit valuations</p>
            </div>

            <div className="bg-surface border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Contactable Leads</span>
                <Mail className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">
                {toolLeads.filter(l => l.email || l.phone).length}
              </p>
              <p className="text-[11px] text-amber-400/80 mt-1">With email or phone captured</p>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Tool Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Tool:
              </span>
              {[
                { id: 'all', label: 'All Tools' },
                { id: 'youtube', label: 'YouTube Monetization Audit' },
                { id: 'calculator', label: 'Brand Deal Calculator' },
                { id: 'mediakit', label: 'Media Kit Builder' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLeadToolFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    leadToolFilter === f.id
                      ? 'bg-primary text-background'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Status Filter, Search & Export */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <select
                value={leadStatusFilter}
                onChange={e => setLeadStatusFilter(e.target.value)}
                className="bg-[#141C28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="NEW">New Leads</option>
                <option value="CONTACTED">Contacted</option>
                <option value="IN_DISCUSSION">In Discussion</option>
                <option value="CONVERTED">Converted</option>
              </select>

              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={leadSearchQuery}
                  onChange={e => setLeadSearchQuery(e.target.value)}
                  placeholder="Search channel, email, need..."
                  className="w-full bg-[#141C28] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-primary/50"
                />
              </div>

              <button
                onClick={exportLeadsCSV}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                title="Download CSV of filtered leads"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={() => fetchItems()}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Refresh leads"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-wider bg-white/5">
                    <th className="px-5 py-3.5 font-bold">Channel & Contact</th>
                    <th className="px-4 py-3.5 font-bold">Tool / Lang</th>
                    <th className="px-4 py-3.5 font-bold">Audience / Score</th>
                    <th className="px-5 py-3.5 font-bold min-w-[240px]">Creator Need & Growth Bottleneck</th>
                    <th className="px-4 py-3.5 font-bold">Monetization Value</th>
                    <th className="px-4 py-3.5 font-bold">Lead Status</th>
                    <th className="px-5 py-3.5 font-bold text-right">Outreach Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredToolLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-60" />
                        <p className="font-semibold text-white">No tool leads found matching your filters</p>
                        <p className="text-xs text-gray-500 mt-1">Run an audit or calculation on the website to capture real creator leads!</p>
                      </td>
                    </tr>
                  ) : (
                    filteredToolLeads.map((lead: any) => {
                      const isYT = lead.tool_id?.includes('youtube') || lead.tool_name?.toLowerCase().includes('youtube');
                      const score = lead.overall_score || lead.score;
                      return (
                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Channel & Contact */}
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isYT ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {isYT ? '▶' : '₹'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white hover:text-primary transition-colors truncate">
                                    {lead.handle}
                                  </span>
                                  {isYT && lead.handle && (
                                    <a
                                      href={`https://youtube.com/${lead.handle.startsWith('@') ? lead.handle : `@${lead.handle}`}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-500 hover:text-red-400 transition-colors"
                                      title="Open YouTube Channel"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                {lead.channel_title && lead.channel_title !== lead.handle && (
                                  <p className="text-[11px] text-gray-400 truncate">{lead.channel_title}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  {lead.email ? (
                                    <span className="text-[11px] text-emerald-400 font-mono truncate flex items-center gap-1">
                                      <Mail className="w-2.5 h-2.5" /> {lead.email}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-500 italic">No email captured</span>
                                  )}
                                  {lead.phone && (
                                    <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                                      <Phone className="w-2.5 h-2.5" /> {lead.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tool Source */}
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              isYT 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : lead.tool_name?.includes('Media Kit') 
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {isYT ? 'YT Monetization Audit' : (lead.tool_name || 'Rate Calculator')}
                            </span>
                            <span className="block text-[10px] text-gray-500 mt-1 capitalize">{lead.niche || 'General'}</span>
                            {(lead.language === 'hi' || lead.metadata?.auditLanguage === 'Hindi') && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                🇮🇳 हिन्दी
                              </span>
                            )}
                          </td>

                          {/* Audience & Score */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <p className="font-mono text-gray-200 font-semibold">
                                {(lead.subscribers || lead.followers || 0).toLocaleString('en-IN')} subs
                              </p>
                              {score !== undefined && score !== null && (
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                    score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    Score: {score}/100
                                  </span>
                                  <span className="text-[10px] text-gray-400">{lead.monetization_status}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Creator Need & Pain Point */}
                          <td className="px-5 py-4">
                            <div className="bg-[#141C28] border border-white/5 rounded-xl p-2.5">
                              <p className="text-white text-xs font-semibold leading-relaxed line-clamp-2">
                                {lead.primary_need || lead.need || 'General Channel Monetization Optimization'}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                                <span>Opportunity:</span>
                                <span className="text-emerald-400 font-medium">Ready for Creator Nest outreach</span>
                              </div>
                            </div>
                          </td>

                          {/* Monetization Value */}
                          <td className="px-4 py-4">
                            <span className="font-mono font-bold text-emerald-400 text-xs block">
                              {lead.estimated_monthly_revenue || (lead.base_rate ? `₹${Number(lead.base_rate).toLocaleString('en-IN')}` : '₹0')}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {isYT ? 'Est. Monthly AdSense' : '1-Deal Base Fee'}
                            </span>
                          </td>

                          {/* Lead Status */}
                          <td className="px-4 py-4">
                            <select
                              value={lead.status || 'NEW'}
                              onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                lead.status === 'CONVERTED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                                lead.status === 'IN_DISCUSSION' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
                                lead.status === 'CONTACTED' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' :
                                'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              }`}
                            >
                              <option value="NEW">🟡 New</option>
                              <option value="CONTACTED">🔵 Contacted</option>
                              <option value="IN_DISCUSSION">🟣 In Discussion</option>
                              <option value="CONVERTED">🟢 Converted</option>
                            </select>
                            <span className="block text-[9px] text-gray-500 font-mono mt-1">
                              {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : 'Recent'}
                            </span>
                          </td>

                          {/* Outreach Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}?subject=${encodeURIComponent(`Creator Nest x ${lead.handle}: Monetization & Growth Consultation`)}&body=${encodeURIComponent(`Hi ${lead.handle},\n\nWe saw you recently ran an audit on Creator Nest for your channel. We noticed your channel stats (${lead.subscribers?.toLocaleString()} subscribers) and identified key monetization opportunities for you.\n\nLet's connect for a quick 10-minute strategy call!\n\nBest regards,\nCreator Nest Team\nhttps://creatornest.in`)}`}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                                  title="Send Email to Creator"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {lead.phone && (
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.handle}, this is Creator Nest reaching out regarding your YouTube Monetization Audit!`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors"
                                  title="Reach out on WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                title="View Full Lead Snapshot"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lead Snapshot Details Modal */}
          {selectedLead && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0B1017] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {selectedLead.tool_id?.includes('youtube') ? '▶' : '₹'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedLead.handle}</h3>
                      <p className="text-xs text-gray-400">{selectedLead.tool_name} • {selectedLead.niche}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-1 text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Subscribers</p>
                    <p className="text-base font-bold text-white font-mono mt-0.5">
                      {(selectedLead.subscribers || selectedLead.followers || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Audit Score</p>
                    <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                      {selectedLead.overall_score || selectedLead.score || '—'}/100
                    </p>
                  </div>
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">YPP Status</p>
                    <p className="text-xs font-bold text-cyan-400 mt-1">
                      {selectedLead.monetization_status || 'Calculated'}
                    </p>
                  </div>
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Est. Revenue</p>
                    <p className="text-xs font-bold text-amber-400 font-mono mt-1">
                      {selectedLead.estimated_monthly_revenue || (selectedLead.base_rate ? `₹${Number(selectedLead.base_rate).toLocaleString('en-IN')}` : '—')}
                    </p>
                  </div>
                </div>

                {/* Language + Additional Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Audit Language</p>
                    <p className="text-sm font-bold text-white">
                      {(selectedLead.language === 'hi' || selectedLead.metadata?.auditLanguage === 'Hindi') 
                        ? '🇮🇳 हिन्दी' 
                        : '🇺🇸 English'}
                    </p>
                  </div>
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Total Views</p>
                    <p className="text-sm font-bold text-white font-mono">
                      {(selectedLead.total_views || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Videos</p>
                    <p className="text-sm font-bold text-white font-mono">{selectedLead.video_count || '—'}</p>
                  </div>
                  <div className="bg-[#141C28] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Country</p>
                    <p className="text-sm font-bold text-white">{selectedLead.country || 'India'}</p>
                  </div>
                </div>

                {/* Key Need */}
                <div className="bg-[#141C28] border border-white/10 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Primary Creator Need & Growth Gap
                  </h4>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">
                    {selectedLead.primary_need || selectedLead.need || 'Creator requires monetization optimization, brand deal pricing, and sponsor packaging.'}
                  </p>
                </div>

                {/* Top Strengths & Critical Issues from audit metadata */}
                {(selectedLead.metadata?.topStrengths?.length > 0 || selectedLead.metadata?.criticalIssues?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedLead.metadata?.topStrengths?.length > 0 && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Top Channel Strengths
                        </h4>
                        <ul className="space-y-1">
                          {selectedLead.metadata.topStrengths.slice(0, 3).map((s: string, i: number) => (
                            <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedLead.metadata?.criticalIssues?.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Critical Issues Detected
                        </h4>
                        <ul className="space-y-1">
                          {selectedLead.metadata.criticalIssues.slice(0, 3).map((c: string, i: number) => (
                            <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedLead.notes && (
                  <div className="bg-white/3 border border-white/10 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-xs text-gray-300">{selectedLead.notes}</p>
                  </div>
                )}

                {/* Contact Actions */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">Direct Creator Outreach</p>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Email: {selectedLead.email || 'Not provided'} • Phone: {selectedLead.phone || 'Not provided'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Lead captured: {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString('en-IN') : 'Recently'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedLead.email && (
                      <a
                        href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(`Creator Nest x ${selectedLead.handle}: Strategy Consultation`)}&body=${encodeURIComponent(`Hi ${selectedLead.handle},\n\nWe noticed you recently ran an audit on Creator Nest and found some exciting monetization opportunities for your channel (${(selectedLead.subscribers || 0).toLocaleString()} subscribers).\n\nWould love to connect for a quick 15-minute strategy session!\n\nBest,\nCreator Nest Team\nhttps://creatornest.in`)}`}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-background font-bold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email Creator
                      </a>
                    )}
                    {selectedLead.phone && (
                      <a
                        href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedLead.handle}! Creator Nest here. We saw your YouTube channel audit results and would love to help you scale your monetization. Free 15-min call?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-green-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-green-600 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
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
