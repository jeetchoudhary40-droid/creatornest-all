'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  IndianRupee, 
  Share2, 
  MessageSquare, 
  Phone, 
  Mail, 
  Building2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Layers, 
  Video, 
  Smartphone, 
  Megaphone, 
  Copy, 
  Check,
  ChevronRight,
  X,
  Calendar,
  Tag,
  ShieldCheck,
  Award,
  Upload,
  Image as ImageIcon,
  Globe,
  CreditCard,
  Link2,
  FileCheck2
} from 'lucide-react';

interface BrandContact {
  name: string;
  designation: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin?: string;
  city?: string;
  address?: string;
}

interface SecondaryContact {
  name: string;
  designation: string;
  email: string;
  phone: string;
}

interface SelectedCreator {
  creator_id: string;
  creator_name: string;
  handle: string;
  platform: 'youtube' | 'instagram';
  deliverable: string;
  payout: number;
  deliverable_link?: string;
  status: string;
}

interface BrandCampaign {
  id: string;
  campaign_name: string;
  objective: string;
  promotion_type: string;
  budget: number;
  creator_payout_budget: number;
  status: string;
  script_provided: boolean;
  script_status: string;
  script_content?: string;
  talking_points?: string[];
  dos_and_donts?: string;
  mandatory_hashtags?: string;
  cta_link?: string;
  coupon_code?: string;
  brand_assets_url?: string;
  target_creators_count: number;
  selected_creators?: SelectedCreator[];
  start_date: string;
  end_date: string;
  created_at: string;
  executed_metrics?: {
    total_views?: number;
    total_impressions?: number;
    total_clicks?: number;
    engagement_rate?: string;
    roas?: string;
    execution_notes?: string;
  };
}

interface BrandPartner {
  id: string;
  numeric_id: string;
  brand_name: string;
  company_legal_name: string;
  logo_url?: string;
  website_url?: string;
  industry: string;
  sub_industry?: string;
  tier: string;
  status: string;
  account_manager: string;
  primary_contact: BrandContact;
  secondary_contact?: SecondaryContact;
  gstin?: string;
  pan_number?: string;
  billing_address?: string;
  payment_terms?: string;
  target_audience_pref?: string;
  social_profiles?: {
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  total_spend: number;
  active_campaigns_count: number;
  total_campaigns_count: number;
  notes?: string;
  campaigns: BrandCampaign[];
  created_at: string;
  updated_at: string;
}

interface BrandStats {
  totalBrands: number;
  activeBrands: number;
  totalCampaigns: number;
  activeCampaigns: number;
  executedCampaigns: number;
  totalPipelineBudget: number;
  totalHistoricalSpend: number;
  scriptsPendingReview: number;
}

const PROMOTION_TYPES = [
  'Dedicated Video',
  'Integrated Shoutout (60-90s)',
  'YouTube Shorts / Reels',
  'Instagram Story Sequence',
  'Unboxing & Review',
  'Podcast Sponsorship',
  'Live Stream Overlay'
];

const CAMPAIGN_OBJECTIVES = [
  'Brand Awareness',
  'Product Launch',
  'Performance & Installs',
  'Festive Sale',
  'Lead Generation',
  'Community Building'
];

const INDUSTRIES = [
  'Consumer Tech & Audio',
  'Smartphones & Consumer Electronics',
  'FinTech & Wealth Management',
  'Food Tech & Hyperlocal',
  'Beauty & Personal Care',
  'Fashion & Apparel',
  'Gaming & Esports',
  'EdTech & Learning',
  'Health & Wellness',
  'Automobile & EV',
  'Travel & Hospitality'
];

const BRAND_TIERS = [
  'Enterprise',
  'High-Growth D2C',
  'Mid-Market',
  'Agency Partner',
  'Early Stage'
];

const PAYMENT_TERMS_OPTIONS = [
  '100% Advance',
  '50% Advance, 50% on Live',
  'Net 15 Days',
  'Net 30 Days',
  'Net 45 Days',
  'Net 60 Days'
];

const SCRIPT_STATUS_COLORS: Record<string, string> = {
  'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Under Brand Review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Draft Submitted': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Revisions Required': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  'Not Applicable': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  'Brief Received': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Creator Shortlisting': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  'Script Review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'In Production': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Live': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/30',
};

// Generates fallback initials for brands without logo
function getBrandInitials(name: string): string {
  if (!name) return 'BR';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AdminBrandsHub() {
  const [brands, setBrands] = useState<BrandPartner[]>([]);
  const [stats, setStats] = useState<BrandStats>({
    totalBrands: 0,
    activeBrands: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    executedCampaigns: 0,
    totalPipelineBudget: 0,
    totalHistoricalSpend: 0,
    scriptsPendingReview: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'brands' | 'campaigns' | 'executed'>('brands');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [promotionFilter, setPromotionFilter] = useState('');

  // Modals state
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [selectedBrandForCampaign, setSelectedBrandForCampaign] = useState<string>('');
  const [viewingBrandDossier, setViewingBrandDossier] = useState<BrandPartner | null>(null);
  const [viewingScriptCampaign, setViewingScriptCampaign] = useState<{ campaign: BrandCampaign; brandName: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // File Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRefAdd = useRef<HTMLInputElement | null>(null);
  const fileInputRefEdit = useRef<HTMLInputElement | null>(null);

  // New Brand Form State
  const [brandForm, setBrandForm] = useState({
    id: '',
    brand_name: '',
    company_legal_name: '',
    logo_url: '',
    website_url: '',
    industry: 'Consumer Tech & Audio',
    sub_industry: '',
    tier: 'High-Growth D2C',
    status: 'Active Client',
    poc_name: '',
    poc_designation: 'Head of Creator Partnerships',
    poc_email: '',
    poc_phone: '',
    poc_whatsapp: '',
    poc_linkedin: '',
    poc_city: 'Mumbai',
    poc_address: '',
    secondary_name: '',
    secondary_designation: 'Accounts / Finance Lead',
    secondary_email: '',
    secondary_phone: '',
    gstin: '',
    pan_number: '',
    billing_address: '',
    payment_terms: '50% Advance, 50% on Live',
    target_audience_pref: '',
    instagram_url: '',
    youtube_url: '',
    linkedin_url: '',
    notes: '',
  });

  // New Campaign Form State
  const [newCampForm, setNewCampForm] = useState({
    brand_id: '',
    campaign_name: '',
    objective: 'Brand Awareness',
    promotion_type: 'Integrated Shoutout (60-90s)',
    budget: 250000,
    creator_payout_budget: 200000,
    status: 'Brief Received',
    script_provided: true,
    script_status: 'Draft Submitted',
    script_content: '',
    talking_points: '',
    dos_and_donts: '',
    mandatory_hashtags: '#Sponsored #BrandPartner',
    cta_link: '',
    coupon_code: '',
    brand_assets_url: '',
    target_creators_count: 2,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
      'Content-Type': 'application/json',
      'x-admin-token': token || 'mock_access_token_admin',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchBrandsData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch brands data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandsData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Image File Upload Handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'brands');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-admin-token': token || 'mock_access_token_admin',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setBrandForm(prev => ({ ...prev, logo_url: json.url }));
      } else {
        alert(json.error || 'Failed to upload logo image.');
      }
    } catch (err: any) {
      alert(err.message || 'Image upload error.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Edit Brand Modal
  const openEditBrandModal = (brand: BrandPartner) => {
    setBrandForm({
      id: brand.id,
      brand_name: brand.brand_name || '',
      company_legal_name: brand.company_legal_name || '',
      logo_url: brand.logo_url || '',
      website_url: brand.website_url || '',
      industry: brand.industry || 'Consumer Tech & Audio',
      sub_industry: brand.sub_industry || '',
      tier: brand.tier || 'High-Growth D2C',
      status: brand.status || 'Active Client',
      poc_name: brand.primary_contact?.name || '',
      poc_designation: brand.primary_contact?.designation || '',
      poc_email: brand.primary_contact?.email || '',
      poc_phone: brand.primary_contact?.phone || '',
      poc_whatsapp: brand.primary_contact?.whatsapp || '',
      poc_linkedin: brand.primary_contact?.linkedin || '',
      poc_city: brand.primary_contact?.city || '',
      poc_address: brand.primary_contact?.address || '',
      secondary_name: brand.secondary_contact?.name || '',
      secondary_designation: brand.secondary_contact?.designation || '',
      secondary_email: brand.secondary_contact?.email || '',
      secondary_phone: brand.secondary_contact?.phone || '',
      gstin: brand.gstin || '',
      pan_number: brand.pan_number || '',
      billing_address: brand.billing_address || '',
      payment_terms: brand.payment_terms || '50% Advance, 50% on Live',
      target_audience_pref: brand.target_audience_pref || '',
      instagram_url: brand.social_profiles?.instagram || '',
      youtube_url: brand.social_profiles?.youtube || '',
      linkedin_url: brand.social_profiles?.linkedin || '',
      notes: brand.notes || '',
    });
    setIsEditBrandOpen(true);
  };

  // Open Add Brand Modal (reset fields)
  const openAddBrandModal = () => {
    setBrandForm({
      id: '',
      brand_name: '',
      company_legal_name: '',
      logo_url: '',
      website_url: '',
      industry: 'Consumer Tech & Audio',
      sub_industry: '',
      tier: 'High-Growth D2C',
      status: 'Active Client',
      poc_name: '',
      poc_designation: 'Head of Partnerships',
      poc_email: '',
      poc_phone: '',
      poc_whatsapp: '',
      poc_linkedin: '',
      poc_city: 'Mumbai',
      poc_address: '',
      secondary_name: '',
      secondary_designation: 'Accounts / Finance Lead',
      secondary_email: '',
      secondary_phone: '',
      gstin: '',
      pan_number: '',
      billing_address: '',
      payment_terms: '50% Advance, 50% on Live',
      target_audience_pref: '',
      instagram_url: '',
      youtube_url: '',
      linkedin_url: '',
      notes: '',
    });
    setIsAddBrandOpen(true);
  };

  // Create Brand Handler
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.brand_name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'create_brand',
          brandData: {
            brand_name: brandForm.brand_name,
            company_legal_name: brandForm.company_legal_name || brandForm.brand_name,
            logo_url: brandForm.logo_url,
            website_url: brandForm.website_url,
            industry: brandForm.industry,
            sub_industry: brandForm.sub_industry,
            tier: brandForm.tier,
            status: brandForm.status,
            gstin: brandForm.gstin,
            pan_number: brandForm.pan_number,
            billing_address: brandForm.billing_address,
            payment_terms: brandForm.payment_terms,
            target_audience_pref: brandForm.target_audience_pref,
            social_profiles: {
              instagram: brandForm.instagram_url,
              youtube: brandForm.youtube_url,
              linkedin: brandForm.linkedin_url,
            },
            notes: brandForm.notes,
            primary_contact: {
              name: brandForm.poc_name,
              designation: brandForm.poc_designation,
              email: brandForm.poc_email,
              phone: brandForm.poc_phone,
              whatsapp: brandForm.poc_whatsapp || brandForm.poc_phone,
              linkedin: brandForm.poc_linkedin,
              city: brandForm.poc_city,
              address: brandForm.poc_address,
            },
            secondary_contact: brandForm.secondary_name ? {
              name: brandForm.secondary_name,
              designation: brandForm.secondary_designation,
              email: brandForm.secondary_email,
              phone: brandForm.secondary_phone,
            } : null,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsAddBrandOpen(false);
        await fetchBrandsData();
      } else {
        alert(json.error || 'Failed to create brand.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating brand partner.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Brand Handler (Edit existing)
  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.id || !brandForm.brand_name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          brandId: brandForm.id,
          brandData: {
            brand_name: brandForm.brand_name,
            company_legal_name: brandForm.company_legal_name || brandForm.brand_name,
            logo_url: brandForm.logo_url,
            website_url: brandForm.website_url,
            industry: brandForm.industry,
            sub_industry: brandForm.sub_industry,
            tier: brandForm.tier,
            status: brandForm.status,
            gstin: brandForm.gstin,
            pan_number: brandForm.pan_number,
            billing_address: brandForm.billing_address,
            payment_terms: brandForm.payment_terms,
            target_audience_pref: brandForm.target_audience_pref,
            social_profiles: {
              instagram: brandForm.instagram_url,
              youtube: brandForm.youtube_url,
              linkedin: brandForm.linkedin_url,
            },
            notes: brandForm.notes,
            primary_contact: {
              name: brandForm.poc_name,
              designation: brandForm.poc_designation,
              email: brandForm.poc_email,
              phone: brandForm.poc_phone,
              whatsapp: brandForm.poc_whatsapp || brandForm.poc_phone,
              linkedin: brandForm.poc_linkedin,
              city: brandForm.poc_city,
              address: brandForm.poc_address,
            },
            secondary_contact: brandForm.secondary_name ? {
              name: brandForm.secondary_name,
              designation: brandForm.secondary_designation,
              email: brandForm.secondary_email,
              phone: brandForm.secondary_phone,
            } : null,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsEditBrandOpen(false);
        await fetchBrandsData();
        if (viewingBrandDossier && viewingBrandDossier.id === brandForm.id) {
          setViewingBrandDossier(json.brand);
        }
      } else {
        alert(json.error || 'Failed to update brand.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating brand.');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Campaign Handler
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetBrandId = newCampForm.brand_id || selectedBrandForCampaign;
    if (!targetBrandId || !newCampForm.campaign_name.trim()) {
      alert('Please select a brand and enter campaign name.');
      return;
    }

    setSubmitting(true);
    try {
      const talkingPointsArr = newCampForm.talking_points
        ? newCampForm.talking_points.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'add_campaign',
          brandId: targetBrandId,
          campaignData: {
            campaign_name: newCampForm.campaign_name,
            objective: newCampForm.objective,
            promotion_type: newCampForm.promotion_type,
            budget: Number(newCampForm.budget),
            creator_payout_budget: Number(newCampForm.creator_payout_budget),
            status: newCampForm.status,
            script_provided: newCampForm.script_provided,
            script_status: newCampForm.script_status,
            script_content: newCampForm.script_content,
            talking_points: talkingPointsArr,
            dos_and_donts: newCampForm.dos_and_donts,
            mandatory_hashtags: newCampForm.mandatory_hashtags,
            cta_link: newCampForm.cta_link,
            coupon_code: newCampForm.coupon_code,
            brand_assets_url: newCampForm.brand_assets_url,
            target_creators_count: Number(newCampForm.target_creators_count),
            start_date: newCampForm.start_date,
            end_date: newCampForm.end_date,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsAddCampaignOpen(false);
        setNewCampForm({
          brand_id: '',
          campaign_name: '',
          objective: 'Brand Awareness',
          promotion_type: 'Integrated Shoutout (60-90s)',
          budget: 250000,
          creator_payout_budget: 200000,
          status: 'Brief Received',
          script_provided: true,
          script_status: 'Draft Submitted',
          script_content: '',
          talking_points: '',
          dos_and_donts: '',
          mandatory_hashtags: '#Sponsored #BrandPartner',
          cta_link: '',
          coupon_code: '',
          brand_assets_url: '',
          target_creators_count: 2,
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
        });
        await fetchBrandsData();
      } else {
        alert(json.error || 'Failed to create campaign.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Campaign Status Inline
  const handleUpdateCampaignStatus = async (brandId: string, campaignId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          brandId,
          campaignId,
          campaignData: { status: newStatus },
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBrandsData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Update Script Status Inline
  const handleUpdateScriptStatus = async (brandId: string, campaignId: string, newScriptStatus: string) => {
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          brandId,
          campaignId,
          campaignData: { script_status: newScriptStatus },
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBrandsData();
        if (viewingScriptCampaign) {
          setViewingScriptCampaign(prev => prev ? {
            ...prev,
            campaign: { ...prev.campaign, script_status: newScriptStatus }
          } : null);
        }
      }
    } catch (err) {
      console.error('Error updating script status:', err);
    }
  };

  // Delete Brand Handler
  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete brand "${brandName}" and all associated campaigns? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/brands?brandId=${brandId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBrandsData();
        if (viewingBrandDossier?.id === brandId) setViewingBrandDossier(null);
      } else {
        alert(data.error || 'Failed to delete brand.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting brand.');
    }
  };

  // Filtered Brands
  const filteredBrands = brands.filter((brand) => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      brand.brand_name.toLowerCase().includes(q) ||
      brand.company_legal_name.toLowerCase().includes(q) ||
      brand.primary_contact.name.toLowerCase().includes(q) ||
      brand.primary_contact.email.toLowerCase().includes(q) ||
      brand.numeric_id.toLowerCase().includes(q) ||
      (brand.sub_industry || '').toLowerCase().includes(q);

    const matchIndustry = !industryFilter || brand.industry === industryFilter;
    const matchTier = !tierFilter || brand.tier === tierFilter;
    return matchSearch && matchIndustry && matchTier;
  });

  // Extract all active campaigns
  const allActiveCampaigns = brands.flatMap(b => 
    (b.campaigns || [])
      .filter(c => c.status !== 'Completed' && c.status !== 'Cancelled')
      .map(c => ({ ...c, brand: b }))
  ).filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      c.campaign_name.toLowerCase().includes(q) ||
      c.brand.brand_name.toLowerCase().includes(q) ||
      (c.coupon_code || '').toLowerCase().includes(q);
    const matchPromo = !promotionFilter || c.promotion_type === promotionFilter;
    return matchSearch && matchPromo;
  });

  // Extract all executed campaigns
  const allExecutedCampaigns = brands.flatMap(b => 
    (b.campaigns || [])
      .filter(c => c.status === 'Completed')
      .map(c => ({ ...c, brand: b }))
  ).filter(c => {
    const q = search.toLowerCase();
    return !q || c.campaign_name.toLowerCase().includes(q) || c.brand.brand_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 pb-20">
      {/* ── Top Header & Global Actions ─────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Brand Partners & Campaigns Hub</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider">
                  Super Admin CRM
                </span>
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Manage brand partners, upload optional logos, edit existing details, configure commercial promotion types & track executed deals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedBrandForCampaign('');
              setIsAddCampaignOpen(true);
            }}
            className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2.5 rounded-xl border border-white/10 flex items-center space-x-2 text-sm transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Launch Campaign</span>
          </button>
          <button
            onClick={openAddBrandModal}
            className="bg-gradient-to-r from-primary to-secondary text-white font-black px-5 py-2.5 rounded-xl flex items-center space-x-2 text-sm shadow-[0_0_25px_rgba(255,81,47,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            <span>+ Onboard Brand Partner</span>
          </button>
        </div>
      </header>

      {/* ── Executive KPI Ribbon ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Brands */}
        <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Brand Clients</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{stats.totalBrands}</span>
            <span className="text-xs text-emerald-400 font-bold">({stats.activeBrands} Active Clients)</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">High-growth D2C & Enterprise sponsors</p>
        </div>

        {/* Active Pipeline Budget */}
        <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Live Pipeline Budget</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">₹{(stats.totalPipelineBudget / 100000).toFixed(1)}L</span>
            <span className="text-xs text-amber-400 font-bold">({stats.activeCampaigns} In-Flight)</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Active commercial capital across campaigns</p>
        </div>

        {/* Script Review Queue */}
        <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Script Review Queue</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{stats.scriptsPendingReview}</span>
            <span className="text-xs text-purple-400 font-bold">Scripts Pending</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Requiring brand approval or revision</p>
        </div>

        {/* Executed Campaigns & Lifetime Spend */}
        <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Gross Delivered Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">₹{(stats.totalHistoricalSpend / 100000).toFixed(1)}L</span>
            <span className="text-xs text-emerald-400 font-bold">({stats.executedCampaigns} Delivered)</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Verified campaigns with audience delivery</p>
        </div>
      </div>

      {/* ── Main Navigation Tabs & Filter Bar ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-surface border border-white/5 p-1 rounded-2xl self-start">
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === 'brands'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Brands Directory ({brands.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === 'campaigns'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Active Campaigns ({allActiveCampaigns.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('executed')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === 'executed'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Executed History ({allExecutedCampaigns.length})</span>
          </button>
        </div>

        {/* Global Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, POC, sub-industry..."
              className="w-full bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {activeTab === 'brands' && (
            <>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="bg-surface border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-primary/50"
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-surface border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-primary/50"
              >
                <option value="">All Tiers</option>
                {BRAND_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          )}

          {activeTab === 'campaigns' && (
            <select
              value={promotionFilter}
              onChange={(e) => setPromotionFilter(e.target.value)}
              className="bg-surface border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-primary/50"
            >
              <option value="">All Promotion Types</option>
              {PROMOTION_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* ── TAB 1: BRANDS DIRECTORY (CRM & CONTACTS) ────────── */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-surface/50 border border-white/5 rounded-3xl animate-pulse p-6" />
            ))
          ) : filteredBrands.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 bg-surface/30 rounded-3xl border border-white/5">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
              <p className="text-sm font-semibold">No brand partners found matching filters.</p>
              <button
                onClick={() => { setSearch(''); setIndustryFilter(''); setTierFilter(''); }}
                className="mt-3 text-xs text-primary font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <motion.div
                key={brand.id}
                layout
                className="bg-surface/70 border border-white/5 hover:border-white/20 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all group shadow-xl hover:shadow-2xl hover:shadow-primary/5 relative"
              >
                <div>
                  {/* Top row: Brand Identity & Tier */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      {/* Logo or Stylized Initials Fallback */}
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-primary/20 border border-white/10 flex items-center justify-center shrink-0">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.brand_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback on image broken error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="font-black text-sm tracking-wider text-amber-300">
                            {getBrandInitials(brand.brand_name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-black text-lg text-white group-hover:text-primary transition-colors">
                            {brand.brand_name}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                            {brand.numeric_id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{brand.company_legal_name}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border shrink-0 ${
                      brand.status === 'Active Client' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {brand.status}
                    </span>
                  </div>

                  {/* Industry, Sub-Industry & Tier tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-white/5 text-gray-300 border border-white/10">
                      {brand.industry}
                    </span>
                    {brand.sub_industry && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {brand.sub_industry}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {brand.tier}
                    </span>
                    {brand.gstin && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        GST: {brand.gstin}
                      </span>
                    )}
                  </div>

                  {/* Primary Decision Maker Contact Card */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>{brand.primary_contact.name}</span>
                          <span className="text-[10px] font-normal text-gray-400">({brand.primary_contact.designation})</span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{brand.primary_contact.city || 'India'}</p>
                      </div>

                      {/* Quick Communication Shortcuts */}
                      <div className="flex items-center space-x-1.5">
                        {brand.primary_contact.whatsapp && (
                          <a
                            href={`https://wa.me/${brand.primary_contact.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {brand.primary_contact.email && (
                          <a
                            href={`mailto:${brand.primary_contact.email}`}
                            title="Send Email"
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {brand.primary_contact.phone && (
                          <a
                            href={`tel:${brand.primary_contact.phone}`}
                            title="Call Phone"
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {brand.website_url && (
                          <a
                            href={brand.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Website"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Secondary Contact preview if available */}
                    {brand.secondary_contact && brand.secondary_contact.name && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Billing POC: <strong className="text-gray-300">{brand.secondary_contact.name}</strong></span>
                        <span>{brand.payment_terms || 'Net 30'}</span>
                      </div>
                    )}
                  </div>

                  {/* Commercials summary badge */}
                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Total Deals</span>
                      <p className="font-black text-white mt-0.5">₹{brand.total_spend.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Campaigns</span>
                      <p className="font-bold text-amber-400 mt-0.5">
                        {brand.active_campaigns_count} Active / {brand.total_campaigns_count} Total
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (with EDIT OPTION) */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingBrandDossier(brand)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/5"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>Dossier</span>
                  </button>

                  {/* EDIT BRAND BUTTON */}
                  <button
                    onClick={() => openEditBrandModal(brand)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 text-xs font-bold transition-all flex items-center space-x-1"
                    title="Edit Brand Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* ADD CAMPAIGN BUTTON */}
                  <button
                    onClick={() => {
                      setSelectedBrandForCampaign(brand.id);
                      setNewCampForm(prev => ({ ...prev, brand_id: brand.id }));
                      setIsAddCampaignOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all flex items-center space-x-1"
                    title="Add Campaign for this Brand"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Campaign</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBrand(brand.id, brand.brand_name)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: ACTIVE CAMPAIGNS OPERATIONS ───────────────── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {allActiveCampaigns.length === 0 ? (
            <div className="py-20 text-center text-gray-500 bg-surface/30 rounded-3xl border border-white/5">
              <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
              <p className="text-sm font-semibold">No active in-flight campaigns found.</p>
              <button
                onClick={() => setIsAddCampaignOpen(true)}
                className="mt-3 text-xs bg-primary text-white font-bold px-4 py-2 rounded-xl"
              >
                + Launch a Brand Campaign
              </button>
            </div>
          ) : (
            allActiveCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-surface/70 border border-white/5 hover:border-white/10 rounded-3xl p-6 backdrop-blur-xl transition-all shadow-xl space-y-4"
              >
                {/* Header row: Brand & Campaign Title + Badges */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {camp.brand.logo_url ? (
                        <img src={camp.brand.logo_url} alt={camp.brand.brand_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-xs text-amber-300">
                          {getBrandInitials(camp.brand.brand_name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{camp.brand.brand_name}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs font-semibold text-primary">{camp.objective}</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">{camp.campaign_name}</h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Promotion Type */}
                    <span className="text-xs px-3 py-1 rounded-xl bg-white/5 text-gray-200 border border-white/10 font-bold flex items-center space-x-1.5">
                      <Video className="w-3.5 h-3.5 text-primary" />
                      <span>{camp.promotion_type}</span>
                    </span>

                    {/* Script Provided Indicator (User Request) */}
                    <span className={`text-xs px-3 py-1 rounded-xl font-bold border flex items-center space-x-1.5 ${
                      camp.script_provided 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      <FileText className="w-3.5 h-3.5" />
                      <span>{camp.script_provided ? 'Brand Provided Script' : 'Creator Talking Points'}</span>
                    </span>

                    {/* Script Review Status */}
                    <span className={`text-xs px-3 py-1 rounded-xl font-black uppercase tracking-wider border ${
                      SCRIPT_STATUS_COLORS[camp.script_status] || 'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      Script: {camp.script_status}
                    </span>

                    {/* Campaign Status Dropdown */}
                    <select
                      value={camp.status}
                      onChange={(e) => handleUpdateCampaignStatus(camp.brand.id, camp.id, e.target.value)}
                      className={`text-xs px-3 py-1 rounded-xl font-black uppercase tracking-wider border cursor-pointer focus:outline-none ${
                        CAMPAIGN_STATUS_COLORS[camp.status] || 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      <option value="Brief Received" className="bg-[#12141a] text-white">Brief Received</option>
                      <option value="Creator Shortlisting" className="bg-[#12141a] text-white">Creator Shortlisting</option>
                      <option value="Script Review" className="bg-[#12141a] text-white">Script Review</option>
                      <option value="In Production" className="bg-[#12141a] text-white">In Production</option>
                      <option value="Live" className="bg-[#12141a] text-white">Live</option>
                      <option value="Completed" className="bg-[#12141a] text-white">Completed</option>
                      <option value="Cancelled" className="bg-[#12141a] text-white">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Middle details: Commercials & Creative Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Campaign Budget</span>
                    <p className="text-base font-black text-white mt-0.5">₹{camp.budget.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400">Creator Pool: ₹{camp.creator_payout_budget.toLocaleString()}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Target Creators</span>
                    <p className="text-base font-black text-white mt-0.5">
                      {camp.selected_creators?.length || 0} / {camp.target_creators_count} Deployed
                    </p>
                    <p className="text-[11px] text-amber-400">
                      {camp.target_creators_count - (camp.selected_creators?.length || 0) > 0 ? 'Slots Remaining' : 'Roster Filled'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Campaign Timeline</span>
                    <p className="text-xs font-bold text-gray-200 mt-1 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{camp.start_date} {camp.end_date ? `to ${camp.end_date}` : ''}</span>
                    </p>
                    <p className="text-[11px] text-gray-400">Brand POC: {camp.brand.primary_contact.name}</p>
                  </div>

                  <div className="flex flex-col justify-center space-y-1.5">
                    {camp.coupon_code && (
                      <div className="flex items-center justify-between text-xs bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <span className="text-[10px] text-gray-400 font-mono">CODE: {camp.coupon_code}</span>
                        <button
                          onClick={() => handleCopy(camp.coupon_code!, `code_${camp.id}`)}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedKey === `code_${camp.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                    {camp.cta_link && (
                      <a
                        href={camp.cta_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">Tracking Link</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Row: View Script Details & Deployed Creators */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewingScriptCampaign({ campaign: camp, brandName: camp.brand.brand_name })}
                      className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold flex items-center space-x-1.5 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Script & Creative Brief</span>
                    </button>

                    {camp.brand_assets_url && (
                      <a
                        href={camp.brand_assets_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 text-xs font-bold flex items-center space-x-1.5 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Brand Assets Folder</span>
                      </a>
                    )}
                  </div>

                  {/* Deployed creators preview */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-bold">Creators:</span>
                    {camp.selected_creators && camp.selected_creators.length > 0 ? (
                      <div className="flex items-center space-x-1.5">
                        {camp.selected_creators.map((c, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white border border-white/10 font-medium">
                            {c.creator_name} ({c.handle})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 font-medium italic">No creators assigned yet.</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 3: EXECUTED CAMPAIGNS & HISTORY ─────────────── */}
      {activeTab === 'executed' && (
        <div className="space-y-4">
          {allExecutedCampaigns.length === 0 ? (
            <div className="py-20 text-center text-gray-500 bg-surface/30 rounded-3xl border border-white/5">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
              <p className="text-sm font-semibold">No completed campaigns in archive.</p>
            </div>
          ) : (
            allExecutedCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-surface/70 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-xl space-y-4 shadow-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shrink-0 flex items-center justify-center">
                      {camp.brand.logo_url ? (
                        <img src={camp.brand.logo_url} alt={camp.brand.brand_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-xs text-emerald-400">
                          {getBrandInitials(camp.brand.brand_name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400">{camp.brand.brand_name}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs font-semibold text-emerald-400">{camp.promotion_type}</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">{camp.campaign_name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black uppercase tracking-wider flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Campaign Successfully Executed</span>
                    </span>
                  </div>
                </div>

                {/* Execution Metrics Bar */}
                {camp.executed_metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl p-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Views</span>
                      <p className="text-base font-black text-white mt-0.5">
                        {camp.executed_metrics.total_views?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Impressions</span>
                      <p className="text-base font-black text-white mt-0.5">
                        {camp.executed_metrics.total_impressions?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Clicks Generated</span>
                      <p className="text-base font-black text-white mt-0.5">
                        {camp.executed_metrics.total_clicks?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Engagement Rate</span>
                      <p className="text-base font-black text-emerald-400 mt-0.5">
                        {camp.executed_metrics.engagement_rate || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Measured ROAS</span>
                      <p className="text-base font-black text-emerald-400 mt-0.5">
                        {camp.executed_metrics.roas || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Performance Notes & Live Links */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 text-xs text-gray-400">
                  <p className="italic">
                    "{camp.executed_metrics?.execution_notes || 'Campaign completed and verified with all deliverables delivered.'}"
                  </p>

                  <div className="flex items-center space-x-2 shrink-0">
                    {camp.selected_creators?.map((c, i) => c.deliverable_link && (
                      <a
                        key={i}
                        href={c.deliverable_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center space-x-1.5 border border-white/10"
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                        <span>Live Deliverable ({c.creator_name})</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MODAL: ONBOARD BRAND PARTNER (With Optional Image Upload) ── */}
      <AnimatePresence>
        {isAddBrandOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141a] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Onboard New Brand Partner</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Configure corporate details, contacts, tax info & optional logo</p>
                </div>
                <button onClick={() => setIsAddBrandOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBrand} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* 1. Optional Logo Upload & Preview Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-black uppercase text-amber-400 tracking-wider">
                        Brand Logo (Optional)
                      </label>
                      <p className="text-[11px] text-gray-400">Upload a file or enter an image URL. If skipped, stylish initials are generated automatically.</p>
                    </div>
                    {brandForm.logo_url && (
                      <button
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, logo_url: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Preview Box */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-primary/20 border border-white/10 flex items-center justify-center shrink-0">
                      {brandForm.logo_url ? (
                        <img src={brandForm.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-lg text-amber-300">
                          {getBrandInitials(brandForm.brand_name || 'Brand')}
                        </span>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="file"
                        ref={fileInputRefAdd}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => fileInputRefAdd.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center space-x-1.5 border border-white/10 transition-all disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image File (Optional)'}</span>
                        </button>
                        <span className="text-[11px] text-gray-500">or paste URL below</span>
                      </div>

                      <input
                        type="url"
                        placeholder="https://... (Optional web image URL)"
                        value={brandForm.logo_url}
                        onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Core Brand Identity Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. boAt, Mamaearth, Noise"
                      value={brandForm.brand_name}
                      onChange={(e) => setBrandForm({ ...brandForm, brand_name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Company Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Imagine Marketing Ltd."
                      value={brandForm.company_legal_name}
                      onChange={(e) => setBrandForm({ ...brandForm, company_legal_name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Industry Category *</label>
                    <select
                      value={brandForm.industry}
                      onChange={(e) => setBrandForm({ ...brandForm, industry: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#12141a]">{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Sub-Industry / Niche</label>
                    <input
                      type="text"
                      placeholder="e.g. Smart Wearables, Audio"
                      value={brandForm.sub_industry}
                      onChange={(e) => setBrandForm({ ...brandForm, sub_industry: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Brand Tier</label>
                    <select
                      value={brandForm.tier}
                      onChange={(e) => setBrandForm({ ...brandForm, tier: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      {BRAND_TIERS.map(t => <option key={t} value={t} className="bg-[#12141a]">{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Website URL</label>
                    <input
                      type="url"
                      placeholder="https://brand.com"
                      value={brandForm.website_url}
                      onChange={(e) => setBrandForm({ ...brandForm, website_url: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Client Status</label>
                    <select
                      value={brandForm.status}
                      onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      <option value="Active Client" className="bg-[#12141a]">Active Client</option>
                      <option value="Prospect" className="bg-[#12141a]">Prospect / Inbound</option>
                      <option value="Lead" className="bg-[#12141a]">Lead</option>
                    </select>
                  </div>
                </div>

                {/* 3. Primary Contact Person (POC) */}
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2">Primary Decision Maker (POC)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">POC Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sameer Mehta"
                        value={brandForm.poc_name}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Designation / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Head of Creator Partnerships"
                        value={brandForm.poc_designation}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_designation: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Official Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="partnerships@brand.com"
                        value={brandForm.poc_email}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Direct Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 98201 XXXXX"
                        value={brandForm.poc_phone}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">WhatsApp (For 1-Click Chat)</label>
                      <input
                        type="tel"
                        placeholder="+91 98201 XXXXX"
                        value={brandForm.poc_whatsapp}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_whatsapp: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Headquarters / City</label>
                      <input
                        type="text"
                        placeholder="Mumbai, Bengaluru, Gurugram, Delhi"
                        value={brandForm.poc_city}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_city: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={brandForm.poc_linkedin}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_linkedin: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Tax, Commercial Terms & Billing Details */}
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs font-black uppercase text-primary tracking-wider mb-2">Billing & Tax Compliance (India)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">GSTIN Number</label>
                      <input
                        type="text"
                        placeholder="27AAACI1234F1Z8"
                        value={brandForm.gstin}
                        onChange={(e) => setBrandForm({ ...brandForm, gstin: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">PAN Number</label>
                      <input
                        type="text"
                        placeholder="AAACI1234F"
                        value={brandForm.pan_number}
                        onChange={(e) => setBrandForm({ ...brandForm, pan_number: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Payment Terms</label>
                      <select
                        value={brandForm.payment_terms}
                        onChange={(e) => setBrandForm({ ...brandForm, payment_terms: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      >
                        {PAYMENT_TERMS_OPTIONS.map(p => <option key={p} value={p} className="bg-[#12141a]">{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-[11px] font-bold uppercase text-gray-400">Billing Address</label>
                    <input
                      type="text"
                      placeholder="Registered billing address for invoices..."
                      value={brandForm.billing_address}
                      onChange={(e) => setBrandForm({ ...brandForm, billing_address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                </div>

                {/* 5. Audience Preferences & Internal Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Target Audience Preference</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Tier-1 youth 18-28 interested in tech reviews and gaming..."
                      value={brandForm.target_audience_pref}
                      onChange={(e) => setBrandForm({ ...brandForm, target_audience_pref: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Internal Super Admin Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Contract terms, past sponsor insights, discount preferences..."
                      value={brandForm.notes}
                      onChange={(e) => setBrandForm({ ...brandForm, notes: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddBrandOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-primary to-secondary text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {submitting ? 'Onboarding...' : 'Complete Onboarding'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: EDIT BRAND PARTNER (EDIT OPTION FOR ALREADY ADDED BRANDS) ── */}
      <AnimatePresence>
        {isEditBrandOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141a] border border-amber-500/20 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black text-white">Edit Brand Partner</h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      Edit Mode
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Update corporate identity, contact POC, billing or upload new logo</p>
                </div>
                <button onClick={() => setIsEditBrandOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateBrand} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* 1. Optional Logo Upload & Preview Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-black uppercase text-amber-400 tracking-wider">
                        Brand Logo (Optional Upload)
                      </label>
                      <p className="text-[11px] text-gray-400">Replace current logo with an image upload or URL, or remove to use initials avatar.</p>
                    </div>
                    {brandForm.logo_url && (
                      <button
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, logo_url: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Preview Box */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-primary/20 border border-white/10 flex items-center justify-center shrink-0">
                      {brandForm.logo_url ? (
                        <img src={brandForm.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-lg text-amber-300">
                          {getBrandInitials(brandForm.brand_name || 'Brand')}
                        </span>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="file"
                        ref={fileInputRefEdit}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => fileInputRefEdit.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center space-x-1.5 border border-white/10 transition-all disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>{uploadingImage ? 'Uploading Image...' : 'Upload New Image File'}</span>
                        </button>
                        <span className="text-[11px] text-gray-500">or paste URL below</span>
                      </div>

                      <input
                        type="url"
                        placeholder="https://... (Optional web image URL)"
                        value={brandForm.logo_url}
                        onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Core Brand Identity Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={brandForm.brand_name}
                      onChange={(e) => setBrandForm({ ...brandForm, brand_name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Company Legal Name</label>
                    <input
                      type="text"
                      value={brandForm.company_legal_name}
                      onChange={(e) => setBrandForm({ ...brandForm, company_legal_name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Industry Category *</label>
                    <select
                      value={brandForm.industry}
                      onChange={(e) => setBrandForm({ ...brandForm, industry: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#12141a]">{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Sub-Industry / Niche</label>
                    <input
                      type="text"
                      placeholder="e.g. Smart Wearables, Audio"
                      value={brandForm.sub_industry}
                      onChange={(e) => setBrandForm({ ...brandForm, sub_industry: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Brand Tier</label>
                    <select
                      value={brandForm.tier}
                      onChange={(e) => setBrandForm({ ...brandForm, tier: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      {BRAND_TIERS.map(t => <option key={t} value={t} className="bg-[#12141a]">{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Website URL</label>
                    <input
                      type="url"
                      value={brandForm.website_url}
                      onChange={(e) => setBrandForm({ ...brandForm, website_url: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Client Status</label>
                    <select
                      value={brandForm.status}
                      onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      <option value="Active Client" className="bg-[#12141a]">Active Client</option>
                      <option value="Prospect" className="bg-[#12141a]">Prospect / Inbound</option>
                      <option value="Lead" className="bg-[#12141a]">Lead</option>
                    </select>
                  </div>
                </div>

                {/* 3. Primary Contact Person (POC) */}
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2">Primary Decision Maker (POC)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">POC Full Name *</label>
                      <input
                        type="text"
                        required
                        value={brandForm.poc_name}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Designation / Role</label>
                      <input
                        type="text"
                        value={brandForm.poc_designation}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_designation: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={brandForm.poc_email}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Direct Phone</label>
                      <input
                        type="tel"
                        value={brandForm.poc_phone}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">WhatsApp (For 1-Click Chat)</label>
                      <input
                        type="tel"
                        value={brandForm.poc_whatsapp}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_whatsapp: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Headquarters / City</label>
                      <input
                        type="text"
                        value={brandForm.poc_city}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_city: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={brandForm.poc_linkedin}
                        onChange={(e) => setBrandForm({ ...brandForm, poc_linkedin: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Tax, Commercial Terms & Billing Details */}
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs font-black uppercase text-primary tracking-wider mb-2">Billing & Tax Compliance (India)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">GSTIN Number</label>
                      <input
                        type="text"
                        value={brandForm.gstin}
                        onChange={(e) => setBrandForm({ ...brandForm, gstin: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">PAN Number</label>
                      <input
                        type="text"
                        value={brandForm.pan_number}
                        onChange={(e) => setBrandForm({ ...brandForm, pan_number: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Payment Terms</label>
                      <select
                        value={brandForm.payment_terms}
                        onChange={(e) => setBrandForm({ ...brandForm, payment_terms: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      >
                        {PAYMENT_TERMS_OPTIONS.map(p => <option key={p} value={p} className="bg-[#12141a]">{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-[11px] font-bold uppercase text-gray-400">Billing Address</label>
                    <input
                      type="text"
                      value={brandForm.billing_address}
                      onChange={(e) => setBrandForm({ ...brandForm, billing_address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                </div>

                {/* 5. Audience Preferences & Internal Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Target Audience Preference</label>
                    <textarea
                      rows={2}
                      value={brandForm.target_audience_pref}
                      onChange={(e) => setBrandForm({ ...brandForm, target_audience_pref: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Internal Super Admin Notes</label>
                    <textarea
                      rows={2}
                      value={brandForm.notes}
                      onChange={(e) => setBrandForm({ ...brandForm, notes: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditBrandOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-amber-500 to-primary text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {submitting ? 'Saving Changes...' : 'Save Brand Updates'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: LAUNCH NEW CAMPAIGN ──────────────────────── */}
      <AnimatePresence>
        {isAddCampaignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141a] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Launch Brand Campaign</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Specify promotion format, budget allocation, and script guidelines</p>
                </div>
                <button onClick={() => setIsAddCampaignOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Brand selection & campaign name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Target Brand Partner *</label>
                    <select
                      required
                      value={newCampForm.brand_id || selectedBrandForCampaign}
                      onChange={(e) => {
                        setNewCampForm({ ...newCampForm, brand_id: e.target.value });
                        setSelectedBrandForCampaign(e.target.value);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      <option value="" className="bg-[#12141a]">-- Select Brand Partner --</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id} className="bg-[#12141a]">
                          {b.brand_name} ({b.numeric_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Campaign Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Festive Mega Launch, Q4 Performance Push"
                      value={newCampForm.campaign_name}
                      onChange={(e) => setNewCampForm({ ...newCampForm, campaign_name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Objective & Type of Brand Promotion (Core User Requirement) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Campaign Objective</label>
                    <select
                      value={newCampForm.objective}
                      onChange={(e) => setNewCampForm({ ...newCampForm, objective: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      {CAMPAIGN_OBJECTIVES.map(o => <option key={o} value={o} className="bg-[#12141a]">{o}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Type of Brand Promotion *</label>
                    <select
                      value={newCampForm.promotion_type}
                      onChange={(e) => setNewCampForm({ ...newCampForm, promotion_type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-bold text-primary"
                    >
                      {PROMOTION_TYPES.map(p => <option key={p} value={p} className="bg-[#12141a]">{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Pipeline Status</label>
                    <select
                      value={newCampForm.status}
                      onChange={(e) => setNewCampForm({ ...newCampForm, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    >
                      <option value="Brief Received" className="bg-[#12141a]">Brief Received</option>
                      <option value="Creator Shortlisting" className="bg-[#12141a]">Creator Shortlisting</option>
                      <option value="Script Review" className="bg-[#12141a]">Script Review</option>
                      <option value="In Production" className="bg-[#12141a]">In Production</option>
                    </select>
                  </div>
                </div>

                {/* Budget & Commercials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Total Brand Budget (₹) *</label>
                    <input
                      type="number"
                      required
                      min={10000}
                      value={newCampForm.budget}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewCampForm({
                          ...newCampForm,
                          budget: val,
                          creator_payout_budget: Math.round(val * 0.85),
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Creator Pool Budget (₹)</label>
                    <input
                      type="number"
                      value={newCampForm.creator_payout_budget}
                      onChange={(e) => setNewCampForm({ ...newCampForm, creator_payout_budget: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">Target Creators Count</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newCampForm.target_creators_count}
                      onChange={(e) => setNewCampForm({ ...newCampForm, target_creators_count: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                    />
                  </div>
                </div>

                {/* ── Script & Creative Details ────────────────────────── */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-purple-400 tracking-wider">
                        Script & Creative Guidelines
                      </p>
                      <p className="text-[11px] text-gray-400">Did the brand supply a fixed script or talking points?</p>
                    </div>

                    {/* Script Provided Toggle */}
                    <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setNewCampForm({ ...newCampForm, script_provided: true, script_status: 'Draft Submitted' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          newCampForm.script_provided 
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Brand Provided Script
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCampForm({ ...newCampForm, script_provided: false, script_status: 'Not Applicable' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          !newCampForm.script_provided 
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Creator Talking Points
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Script Review Status</label>
                      <select
                        value={newCampForm.script_status}
                        onChange={(e) => setNewCampForm({ ...newCampForm, script_status: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      >
                        <option value="Draft Submitted" className="bg-[#12141a]">Draft Submitted</option>
                        <option value="Under Brand Review" className="bg-[#12141a]">Under Brand Review</option>
                        <option value="Approved" className="bg-[#12141a]">Approved</option>
                        <option value="Revisions Required" className="bg-[#12141a]">Revisions Required</option>
                        <option value="Not Applicable" className="bg-[#12141a]">Not Applicable</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Coupon / Promo Code</label>
                      <input
                        type="text"
                        placeholder="e.g. NESTBOAT15, SWIGGY50"
                        value={newCampForm.coupon_code}
                        onChange={(e) => setNewCampForm({ ...newCampForm, coupon_code: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400">
                      {newCampForm.script_provided ? 'Script Content / Copy Draft' : 'Creative Angle Overview'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={newCampForm.script_provided 
                        ? "Paste exact script dialogue, scenes, intro hook, mid-section product demo, and closing CTA..."
                        : "Describe the recommended creative angle, hook, and how the creator should seamlessly integrate the product..."
                      }
                      value={newCampForm.script_content}
                      onChange={(e) => setNewCampForm({ ...newCampForm, script_content: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:border-primary resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Key Talking Points (One per line)</label>
                      <textarea
                        rows={2}
                        placeholder="Highlight 50hr battery life&#10;Zero commission on orders&#10;Made in India pride"
                        value={newCampForm.talking_points}
                        onChange={(e) => setNewCampForm({ ...newCampForm, talking_points: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:border-primary resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Do's & Don'ts</label>
                      <textarea
                        rows={2}
                        placeholder="Do: Wear earphones on camera. Don't: Mention direct competitors or claim medical benefits."
                        value={newCampForm.dos_and_donts}
                        onChange={(e) => setNewCampForm({ ...newCampForm, dos_and_donts: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:border-primary resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Target CTA Link</label>
                      <input
                        type="url"
                        placeholder="https://brand.com/product?utm_source=creatornest"
                        value={newCampForm.cta_link}
                        onChange={(e) => setNewCampForm({ ...newCampForm, cta_link: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-400">Brand Assets Folder (Google Drive / Figma)</label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={newCampForm.brand_assets_url}
                        onChange={(e) => setNewCampForm({ ...newCampForm, brand_assets_url: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddCampaignOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-primary to-secondary text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {submitting ? 'Launching...' : 'Launch Campaign'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: SCRIPT & CREATIVE BRIEF VIEWER ─────────────── */}
      <AnimatePresence>
        {viewingScriptCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141a] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    {viewingScriptCampaign.brandName} • Creative Brief
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    {viewingScriptCampaign.campaign.campaign_name}
                  </h2>
                </div>
                <button onClick={() => setViewingScriptCampaign(null)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Script status badge & quick toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-400">Script Mode:</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      viewingScriptCampaign.campaign.script_provided
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {viewingScriptCampaign.campaign.script_provided ? 'Brand Provided Fixed Script' : 'Creator Talking Points'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-400">Status:</span>
                    <select
                      value={viewingScriptCampaign.campaign.script_status}
                      onChange={(e) => {
                        const targetBrand = brands.find(b => (b.campaigns || []).some(c => c.id === viewingScriptCampaign.campaign.id));
                        if (targetBrand) {
                          handleUpdateScriptStatus(targetBrand.id, viewingScriptCampaign.campaign.id, e.target.value);
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-xl font-black uppercase tracking-wider border cursor-pointer ${
                        SCRIPT_STATUS_COLORS[viewingScriptCampaign.campaign.script_status] || 'bg-white/5 text-gray-300'
                      }`}
                    >
                      <option value="Draft Submitted" className="bg-[#12141a]">Draft Submitted</option>
                      <option value="Under Brand Review" className="bg-[#12141a]">Under Brand Review</option>
                      <option value="Approved" className="bg-[#12141a]">Approved</option>
                      <option value="Revisions Required" className="bg-[#12141a]">Revisions Required</option>
                      <option value="Not Applicable" className="bg-[#12141a]">Not Applicable</option>
                    </select>
                  </div>
                </div>

                {/* Script Content */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                    Script Content / Creative Dialogue
                  </h4>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-line">
                    {viewingScriptCampaign.campaign.script_content || 'No detailed script content provided yet.'}
                  </div>
                </div>

                {/* Key Talking points */}
                {viewingScriptCampaign.campaign.talking_points && viewingScriptCampaign.campaign.talking_points.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      Mandatory Talking Points & USPs
                    </h4>
                    <ul className="space-y-1.5">
                      {viewingScriptCampaign.campaign.talking_points.map((tp, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Do's and Don'ts */}
                {viewingScriptCampaign.campaign.dos_and_donts && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      Do's & Don'ts (Brand Safety)
                    </h4>
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                      {viewingScriptCampaign.campaign.dos_and_donts}
                    </div>
                  </div>
                )}

                {/* CTA, Coupon & Drive Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
                  {viewingScriptCampaign.campaign.coupon_code && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Promo Coupon Code</span>
                      <p className="font-mono font-bold text-white text-sm mt-0.5">{viewingScriptCampaign.campaign.coupon_code}</p>
                    </div>
                  )}

                  {viewingScriptCampaign.campaign.mandatory_hashtags && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Mandatory Tags</span>
                      <p className="font-mono text-primary text-xs mt-0.5">{viewingScriptCampaign.campaign.mandatory_hashtags}</p>
                    </div>
                  )}
                </div>

                {viewingScriptCampaign.campaign.brand_assets_url && (
                  <a
                    href={viewingScriptCampaign.campaign.brand_assets_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Brand Assets Folder (Figma / Google Drive)</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DRAWER / MODAL: BRAND DOSSIER (With Edit Button) ──── */}
      <AnimatePresence>
        {viewingBrandDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12141a] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-8"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-primary/20 border border-white/10 flex items-center justify-center">
                    {viewingBrandDossier.logo_url ? (
                      <img src={viewingBrandDossier.logo_url} alt={viewingBrandDossier.brand_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-xl text-amber-300">
                        {getBrandInitials(viewingBrandDossier.brand_name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-black text-white">{viewingBrandDossier.brand_name}</h2>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                        {viewingBrandDossier.numeric_id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                        {viewingBrandDossier.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {viewingBrandDossier.company_legal_name} • {viewingBrandDossier.industry} {viewingBrandDossier.sub_industry ? `(${viewingBrandDossier.sub_industry})` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      openEditBrandModal(viewingBrandDossier);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Brand</span>
                  </button>

                  <button onClick={() => setViewingBrandDossier(null)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Dossier Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Contact Card & Corporate Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Decision Maker */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Primary Decision Maker (POC)</span>
                    <h4 className="text-sm font-bold text-white">{viewingBrandDossier.primary_contact.name}</h4>
                    <p className="text-xs text-gray-400">{viewingBrandDossier.primary_contact.designation}</p>
                    <div className="pt-2 text-xs space-y-1.5 text-gray-300">
                      <p className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <a href={`mailto:${viewingBrandDossier.primary_contact.email}`} className="hover:underline">{viewingBrandDossier.primary_contact.email}</a>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-purple-400" />
                        <span>{viewingBrandDossier.primary_contact.phone || 'N/A'}</span>
                      </p>
                      {viewingBrandDossier.primary_contact.whatsapp && (
                        <p className="flex items-center space-x-2 text-emerald-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <a href={`https://wa.me/${viewingBrandDossier.primary_contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            WhatsApp: {viewingBrandDossier.primary_contact.whatsapp}
                          </a>
                        </p>
                      )}
                      <p className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{viewingBrandDossier.primary_contact.city || 'India'}</span>
                      </p>
                      {viewingBrandDossier.primary_contact.linkedin && (
                        <p className="flex items-center space-x-2 text-primary">
                          <Link2 className="w-3.5 h-3.5" />
                          <a href={viewingBrandDossier.primary_contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[240px]">
                            LinkedIn Profile
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Commercials, Tax & Billing Details */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">Commercials & Billing</span>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Lifetime Spend</span>
                        <p className="text-base font-black text-white">₹{viewingBrandDossier.total_spend.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total Campaigns</span>
                        <p className="text-base font-black text-amber-400">{viewingBrandDossier.campaigns?.length || 0}</p>
                      </div>
                    </div>

                    <div className="pt-2 text-xs space-y-1 text-gray-300 border-t border-white/5">
                      {viewingBrandDossier.gstin && (
                        <p className="font-mono flex items-center justify-between">
                          <span className="text-gray-400">GSTIN:</span>
                          <span className="font-bold text-white">{viewingBrandDossier.gstin}</span>
                        </p>
                      )}
                      {viewingBrandDossier.pan_number && (
                        <p className="font-mono flex items-center justify-between">
                          <span className="text-gray-400">PAN:</span>
                          <span className="font-bold text-white">{viewingBrandDossier.pan_number}</span>
                        </p>
                      )}
                      <p className="flex items-center justify-between">
                        <span className="text-gray-400">Payment Terms:</span>
                        <span className="font-bold text-emerald-400">{viewingBrandDossier.payment_terms || '50% Advance, 50% on Live'}</span>
                      </p>
                      {viewingBrandDossier.website_url && (
                        <a
                          href={viewingBrandDossier.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center space-x-1 pt-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{viewingBrandDossier.website_url}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audience Preferences & Notes */}
                {(viewingBrandDossier.target_audience_pref || viewingBrandDossier.notes) && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                    {viewingBrandDossier.target_audience_pref && (
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400">Target Audience Preference</span>
                        <p className="text-gray-300 mt-0.5">{viewingBrandDossier.target_audience_pref}</p>
                      </div>
                    )}
                    {viewingBrandDossier.notes && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase text-gray-400">Internal Super Admin Notes</span>
                        <p className="text-gray-300 mt-0.5 italic">{viewingBrandDossier.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Campaigns List in Dossier */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center space-x-2">
                      <span>Brand Campaigns History</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                        {viewingBrandDossier.campaigns?.length || 0}
                      </span>
                    </h3>

                    <button
                      onClick={() => {
                        setSelectedBrandForCampaign(viewingBrandDossier.id);
                        setNewCampForm(prev => ({ ...prev, brand_id: viewingBrandDossier.id }));
                        setIsAddCampaignOpen(true);
                      }}
                      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Campaign</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(!viewingBrandDossier.campaigns || viewingBrandDossier.campaigns.length === 0) ? (
                      <p className="text-xs text-gray-500 italic p-4 text-center bg-white/[0.01] rounded-2xl">
                        No campaigns initiated for this brand yet.
                      </p>
                    ) : (
                      viewingBrandDossier.campaigns.map((camp) => (
                        <div
                          key={camp.id}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-white">{camp.campaign_name}</h4>
                              <p className="text-[11px] text-gray-400">{camp.promotion_type} • Budget: ₹{camp.budget.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                                SCRIPT_STATUS_COLORS[camp.script_status] || 'bg-white/5 text-gray-400'
                              }`}>
                                Script: {camp.script_status}
                              </span>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                                CAMPAIGN_STATUS_COLORS[camp.status] || 'bg-white/5 text-gray-400'
                              }`}>
                                {camp.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-white/5">
                            <span>Deployed: {camp.selected_creators?.length || 0} creators</span>
                            <button
                              onClick={() => setViewingScriptCampaign({ campaign: camp, brandName: viewingBrandDossier.brand_name })}
                              className="text-primary hover:underline font-bold"
                            >
                              View Script Details →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
