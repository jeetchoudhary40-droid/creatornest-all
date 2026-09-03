'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, DollarSign, Target, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function CampaignDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: campaign, error, isLoading } = useSWR(`/campaigns/${id}`, fetcher);
  const { data: creators } = useSWR(`/campaigns/${id}/creators`, fetcher);

  if (isLoading) return <div className="p-8 text-white">Loading campaign details...</div>;
  if (error || !campaign) return <div className="p-8 text-red-500">Failed to load campaign.</div>;

  return (
    <div className="flex-1 bg-[#05070A] min-h-screen text-gray-300 font-sans p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/dashboard/brand" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{campaign.title}</h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  campaign.status === 'active' ? 'bg-green-500/10 text-green-400' :
                  campaign.status === 'completed' ? 'bg-secondary/10 text-secondary' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {campaign.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-400 font-mono">{campaign.campaign_code}</span>
              </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Edit Campaign
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-medium text-sm">Budget</span>
            </div>
            <span className="text-2xl font-bold text-white">₹{(campaign.budget || 0).toLocaleString()}</span>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-medium text-sm">Objective</span>
            </div>
            <span className="text-lg font-bold text-white capitalize">{campaign.objective || 'N/A'}</span>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-medium text-sm">Timeline</span>
            </div>
            <span className="text-sm font-medium text-white">
              {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'TBD'} - 
              {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'TBD'}
            </span>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-5">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-medium text-sm">Type</span>
            </div>
            <span className="text-lg font-bold text-white capitalize">{campaign.campaign_type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Details & Description */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Description</h2>
          <p className="text-gray-400 whitespace-pre-wrap">
            {campaign.description || 'No description provided.'}
          </p>
          
          <div className="mt-6 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-gray-400 mb-3">Target Platforms</h3>
            <div className="flex gap-2">
              {campaign.platform?.map((p: string) => (
                <span key={p} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white capitalize">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Creators Roster */}
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assigned Creators
            </h3>
            <button className="text-xs font-bold bg-secondary/20 text-secondary px-3 py-1.5 rounded-md hover:bg-secondary/30 transition-colors">
              + Find Creators
            </button>
          </div>
          
          <div className="p-6">
            {!creators || creators.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No creators have been assigned to this campaign yet.</p>
                <button className="bg-primary text-background font-bold px-6 py-2 rounded-lg hover:bg-white transition-colors">
                  Match Creators
                </button>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-sm text-gray-400">
                    <th className="pb-3 font-medium">Creator</th>
                    <th className="pb-3 font-medium">Platform Handle</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {creators.map((c: any) => (
                    <tr key={c.id}>
                      <td className="py-4 text-white font-medium">{c.creator_id}</td>
                      <td className="py-4 text-gray-400">{c.platform_handle || 'N/A'}</td>
                      <td className="py-4 text-gray-400 capitalize">{c.role}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-300 capitalize">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 text-white font-medium text-right">
                        ₹{(c.agreed_fee || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
