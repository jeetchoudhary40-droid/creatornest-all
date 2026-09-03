'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Archive, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Brand {
  id: string;
  company_name: string;
  brand_name: string;
  industry: string;
  crm_stage: string;
  annual_marketing_budget: number | null;
  status: string;
  total_spend: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, skip: 0, limit: 10 });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'brand')
        .range(pagination.skip, pagination.skip + pagination.limit - 1);
        
      if (search) {
        query = query.ilike('full_name', `%${search}%`);
      }
      if (stageFilter) {
        query = query.eq('status', stageFilter); // Mapping crm_stage to status for now
      }

      const { data, count, error } = await query;
      
      if (!error && data) {
        const mappedBrands: Brand[] = data.map(u => ({
          id: u.id,
          company_name: (u.onboarding_data as any)?.companyName || 'Unknown Company',
          brand_name: u.full_name || 'Unknown Brand',
          industry: (u.onboarding_data as any)?.industry || 'Unknown',
          crm_stage: u.status === 'active' ? 'client' : 'lead',
          annual_marketing_budget: 0,
          status: u.status || 'active',
          total_spend: 0
        }));
        setBrands(mappedBrands);
        setPagination(prev => ({ ...prev, total: count || 0 }));
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [pagination.skip, stageFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.skip === 0) fetchBrands();
      else setPagination(prev => ({ ...prev, skip: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Brand Partners</h1>
          <p className="text-gray-400 mt-1">Pipeline and partnership management for brand clients.</p>
        </div>
        <button className="bg-secondary text-white font-black px-6 py-3 rounded-xl flex items-center space-x-2 shadow-[0_0_20px_rgba(255,81,47,0.2)] hover:scale-105 transition-all self-start">
          <Plus className="w-5 h-5" />
          <span>New Brand Entry</span>
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or brand name..."
            className="w-full bg-surface border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-secondary/50 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-surface border border-white/5 rounded-2xl px-6 py-3 text-white focus:outline-none focus:border-secondary/50 transition-all appearance-none cursor-pointer"
          >
            <option value="">All CRM Stages</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="client">Active Client</option>
          </select>
          <button className="bg-surface border border-white/5 p-3 rounded-2xl text-gray-400 hover:text-white transition-colors">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-black text-gray-500">
                <th className="px-6 py-5">Brand / Company</th>
                <th className="px-6 py-5">Industry</th>
                <th className="px-6 py-5">CRM Stage</th>
                <th className="px-6 py-5">Total Spend</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-white/5 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{brand.brand_name}</p>
                        <p className="text-xs text-gray-500">{brand.company_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium capitalize text-gray-300">{brand.industry}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                      brand.crm_stage === 'client' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {brand.crm_stage}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-white">₹{brand.total_spend.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Budget: ₹{(brand.annual_marketing_budget || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        brand.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {brand.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-secondary transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                        <Archive className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && brands.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500 italic">
                    No brands found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} brands
          </p>
          <div className="flex items-center space-x-2">
            <button 
              disabled={pagination.skip === 0}
              onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
              className="p-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={pagination.skip + pagination.limit >= pagination.total}
              onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
              className="p-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
