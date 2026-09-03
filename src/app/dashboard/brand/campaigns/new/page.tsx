'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch brands to populate the brand selector
  const { data: brands } = useSWR('/brands?limit=100', fetcher);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand_id: '',
    campaign_type: 'sponsored_content',
    platform: ['instagram'],
    objective: '',
    budget: '',
    start_date: '',
    end_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlatformChange = (platform: string) => {
    if (formData.platform.includes(platform)) {
      setFormData({ ...formData, platform: formData.platform.filter(p => p !== platform) });
    } else {
      setFormData({ ...formData, platform: [...formData.platform, platform] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        brand_id: formData.brand_id || (brands && brands.length > 0 ? brands[0].id : null), // Fallback to first brand
      };
      
      if (!payload.brand_id) {
        throw new Error('Please select a brand');
      }

      const res = await api.post('/campaigns', payload);
      if (res.data.data.id) {
        router.push('/dashboard/brand');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#05070A] min-h-screen text-gray-300 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/brand" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Create New Campaign</h1>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-secondary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Campaign'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">General Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Campaign Title *</label>
                  <input 
                    type="text" 
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Summer Collection Launch"
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea 
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the campaign goals and deliverables..."
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Brand *</label>
                    <select 
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleChange}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                    >
                      <option value="">Select a Brand</option>
                      {brands?.map((brand: any) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Campaign Type</label>
                    <select 
                      name="campaign_type"
                      value={formData.campaign_type}
                      onChange={handleChange}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                    >
                      <option value="sponsored_content">Sponsored Content</option>
                      <option value="ugc">User Generated Content</option>
                      <option value="affiliate">Affiliate / Performance</option>
                      <option value="gifting">Gifting / Seeding</option>
                      <option value="event">Event Attendance</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Platforms */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Platforms</h2>
              <div className="flex flex-wrap gap-3">
                {['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handlePlatformChange(plat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize border transition-colors ${
                      formData.platform.includes(plat) 
                        ? 'bg-secondary/20 border-secondary text-secondary' 
                        : 'bg-background border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Timeline & Budget */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Total Budget (₹)</label>
                  <input 
                    type="number" 
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input 
                    type="date" 
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Objective</label>
                  <input 
                    type="text" 
                    name="objective"
                    value={formData.objective}
                    onChange={handleChange}
                    placeholder="e.g., Brand Awareness"
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
