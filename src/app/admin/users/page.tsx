'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCog, Search, Loader2, CheckCircle2, X, Plus,
  User, Video, Briefcase, Users, ShieldCheck, Copy,
  ChevronDown, RefreshCw, Eye, Globe, Phone, KeyRound,
  Sparkles, Check, Trash2, ShieldAlert, DollarSign,
  Share2, MessageSquare, ExternalLink
} from 'lucide-react';

export type UserAccount = {
  id: string;
  numeric_id: string;
  full_name: string;
  email: string;
  password?: string;
  role: 'creator' | 'brand' | 'team_member' | 'admin' | 'super_admin';
  user_type?: string;
  plan_tier: string;
  status: 'active' | 'suspended';
  phone?: string;
  whatsapp?: string;
  permissions: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
};

const ROLE_OPTIONS = [
  { id: 'creator', prefix: 'CR', label: 'Creator', icon: Video, color: 'cyan', defaultTier: 'pro', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'brand', prefix: 'BR', label: 'Brand Client', icon: Briefcase, color: 'purple', defaultTier: 'enterprise', badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'team_member', prefix: 'TM', label: 'Team / Freelancer', icon: Users, color: 'blue', defaultTier: 'pro', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'admin', prefix: 'AD', label: 'Admin Manager', icon: ShieldCheck, color: 'amber', defaultTier: 'enterprise', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
];

const SYSTEM_PERMISSIONS = [
  { id: 'wall_of_deals', label: 'Wall of Deals (Live Brand Deals Access & Applications)' },
  { id: 'creator_roster', label: 'Public Roster Profile Listing' },
  { id: 'brand_campaigns', label: 'Brand Campaign Management' },
  { id: 'production_tasks', label: 'Production / Video Editing Workspace' },
  { id: 'ai_tools_access', label: 'AI Tools & Content Workflows' },
  { id: 'courses_access', label: 'Courses & Academy Resources' },
  { id: 'manage_users', label: 'Admin: Manage Users & Roles' },
  { id: 'manage_roster', label: 'Admin: Manage Public Roster' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    role: 'creator' as 'creator' | 'brand' | 'team_member' | 'admin',
    numericId: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    planTier: 'pro',
    permissions: ['wall_of_deals', 'ai_tools_access'],
    notes: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit / Manage User Modal State
  const [detailUser, setDetailUser] = useState<UserAccount | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserAccount>>({});
  const [saving, setSaving] = useState(false);

  // Fetch users from /api/admin/users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-generate numeric ID based on selected role
  const generateNumericId = (role: string) => {
    const roleConfig = ROLE_OPTIONS.find(r => r.id === role);
    const prefix = roleConfig?.prefix || 'USR';
    const existingCount = users.filter(u => (u.numeric_id || '').startsWith(prefix)).length;
    const nextNum = 101 + existingCount;
    return `${prefix}-${nextNum}`;
  };

  const handleOpenCreateModal = () => {
    const defaultId = generateNumericId('creator');
    setCreateForm({
      role: 'creator',
      numericId: defaultId,
      fullName: '',
      email: '',
      password: `nest${Math.floor(1000 + Math.random() * 9000)}`,
      phone: '',
      whatsapp: '',
      planTier: 'pro',
      permissions: ['wall_of_deals', 'ai_tools_access'],
      notes: '',
    });
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleRoleChangeInCreate = (newRole: 'creator' | 'brand' | 'team_member' | 'admin') => {
    const autoId = generateNumericId(newRole);
    let defaultPerms = ['wall_of_deals'];
    if (newRole === 'creator') defaultPerms = ['wall_of_deals', 'creator_roster', 'ai_tools_access'];
    if (newRole === 'brand') defaultPerms = ['wall_of_deals', 'brand_campaigns'];
    if (newRole === 'team_member') defaultPerms = ['wall_of_deals', 'production_tasks', 'ai_tools_access'];
    if (newRole === 'admin') defaultPerms = ['all', 'manage_users', 'manage_roster', 'wall_of_deals'];

    setCreateForm(prev => ({
      ...prev,
      role: newRole,
      numericId: autoId,
      permissions: defaultPerms,
      planTier: newRole === 'brand' || newRole === 'admin' ? 'enterprise' : 'pro',
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim()) {
      setCreateError('Please enter the user full name.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numericId: createForm.numericId.trim().toUpperCase(),
          fullName: createForm.fullName.trim(),
          email: createForm.email.trim() || `${createForm.numericId.toLowerCase()}@creatornest.in`,
          password: createForm.password.trim() || 'nest1234',
          role: createForm.role,
          phone: createForm.phone.trim(),
          whatsapp: createForm.whatsapp.trim() || createForm.phone.trim(),
          planTier: createForm.planTier,
          permissions: createForm.permissions,
          notes: createForm.notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user account.');
      }

      await fetchUsers();
      setShowCreateModal(false);
    } catch (err: any) {
      setCreateError(err.message || 'Error creating user.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenDetail = (user: UserAccount) => {
    setDetailUser(user);
    setEditForm({
      numeric_id: user.numeric_id,
      full_name: user.full_name,
      email: user.email,
      password: user.password || '',
      role: user.role,
      status: user.status,
      plan_tier: user.plan_tier,
      permissions: user.permissions || [],
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      notes: user.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!detailUser) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: detailUser.id,
          numericId: editForm.numeric_id,
          fullName: editForm.full_name,
          email: editForm.email,
          password: editForm.password || undefined,
          role: editForm.role,
          status: editForm.status,
          planTier: editForm.plan_tier,
          permissions: editForm.permissions,
          phone: editForm.phone,
          whatsapp: editForm.whatsapp,
          notes: editForm.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user.');
      }

      await fetchUsers();
      setDetailUser(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: UserAccount) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        if (detailUser && detailUser.id === user.id) {
          setDetailUser(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (user.numeric_id === 'AD-01') {
      alert('Super Admin AD-01 cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete account ${user.numeric_id} (${user.full_name})?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user.');
      }
      setUsers(prev => prev.filter(u => u.id !== user.id));
      if (detailUser && detailUser.id === user.id) setDetailUser(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyCredentials = (user: UserAccount) => {
    const text = `🎉 Welcome to Creator Nest!\n\nYour Account Details:\n• User ID: ${user.numeric_id}\n• Email: ${user.email}\n• Password: ${user.password || '(Managed by Admin)'}\n• Role: ${user.role.toUpperCase()}\n\n🔗 Login Portal: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.numeric_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'creator' && u.role === 'creator') ||
      (filterType === 'brand' && u.role === 'brand') ||
      (filterType === 'team' && (u.role === 'team_member' || (u.role as string) === 'team')) ||
      (filterType === 'admin' && (u.role === 'admin' || u.role === 'super_admin'));

    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: users.length,
    creator: users.filter(u => u.role === 'creator').length,
    brand: users.filter(u => u.role === 'brand').length,
    team: users.filter(u => u.role === 'team_member' || (u.role as string) === 'team').length,
    admin: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Identity & Access Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">User Accounts & Roles</h1>
          <p className="text-sm text-gray-400 mt-1">
            Create and manage verified IDs (<span className="text-cyan-400 font-mono">CR-101</span>, <span className="text-purple-400 font-mono">BR-202</span>, <span className="text-blue-400 font-mono">TM-303</span>, <span className="text-amber-400 font-mono">AD-01</span>) with permissions for upcoming Wall of Deals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-surface border border-white/10 hover:border-white/20 text-gray-300 rounded-xl text-sm font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary hover:to-cyan-300 text-background font-extrabold rounded-xl text-sm shadow-[0_0_20px_rgba(0,242,254,0.25)] hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create User Account</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Accounts', count: counts.all },
            { key: 'creator', label: '🎬 Creators (CR-)', count: counts.creator },
            { key: 'brand', label: '🏢 Brands (BR-)', count: counts.brand },
            { key: 'team', label: '💼 Team / Freelancers (TM-)', count: counts.team },
            { key: 'admin', label: '🛡️ Admins (AD-)', count: counts.admin },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-2 ${
                filterType === tab.key
                  ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                  : 'bg-surface/60 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterType === tab.key ? 'bg-background/25' : 'bg-white/10'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User ID & Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Key Permissions</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading user directory...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No accounts found matching criteria. Click &quot;Create User Account&quot; to add one.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const roleConfig = ROLE_OPTIONS.find(r => r.id === user.role) || ROLE_OPTIONS[0];
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* ID & Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {user.numeric_id?.substring(0, 2) || 'US'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                {user.numeric_id}
                              </span>
                              <span className="font-bold text-white text-sm">{user.full_name}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${roleConfig.badgeBg}`}>
                          {user.role?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all ${
                            user.status === 'active'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {user.status || 'active'}
                        </button>
                      </td>

                      {/* Permissions */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(user.permissions || []).slice(0, 2).map(perm => (
                            <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 border border-white/10 text-gray-300">
                              {perm.replace('_', ' ')}
                            </span>
                          ))}
                          {(user.permissions || []).length > 2 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-primary bg-primary/10">
                              +{(user.permissions || []).length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => copyCredentials(user)}
                            title="Copy credentials to share with user"
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-xs flex items-center space-x-1"
                          >
                            {copiedId === user.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{copiedId === user.id ? 'Copied!' : 'Copy Login'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenDetail(user)}
                            className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>

                          {user.numeric_id !== 'AD-01' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Delete account"
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* ========================================================================= */}
      {/* CREATE USER MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <UserCog className="w-5 h-5 text-primary" />
                  <span>Create User ID & Account</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Assign User ID (e.g. CR-101, BR-202) and permissions.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Select User Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLE_OPTIONS.map(r => {
                    const isSelected = createForm.role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChangeInCreate(r.id as any)}
                        className={`p-3 rounded-xl text-left transition-all border flex flex-col items-center justify-center text-center ${
                          isSelected
                            ? 'bg-primary/15 border-primary text-primary shadow-lg shadow-primary/20 font-bold'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <r.icon className="w-5 h-5 mb-1.5" />
                        <span className="text-xs">{r.label}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5 font-mono">{r.prefix}-###</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User ID & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    User ID <span className="text-primary">(Assigned ID)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.numericId}
                    onChange={e => setCreateForm({ ...createForm, numericId: e.target.value })}
                    placeholder="e.g. CR-101"
                    className="w-full bg-background border border-primary/30 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Full Name / Entity *</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma or Nexus Brands"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="user@creatornest.in"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="nest1234"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 font-mono"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Plan Tier</label>
                  <select
                    value={createForm.planTier}
                    onChange={e => setCreateForm({ ...createForm, planTier: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60"
                  >
                    <option value="free">Free Tier</option>
                    <option value="pro">Pro Member</option>
                    <option value="enterprise">Enterprise / Premium</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">
                  System Permissions (e.g. Wall of Deals Access)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-black/20 rounded-xl border border-white/5">
                  {SYSTEM_PERMISSIONS.map(perm => {
                    const isChecked = createForm.permissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => {
                          setCreateForm(prev => ({
                            ...prev,
                            permissions: isChecked
                              ? prev.permissions.filter(p => p !== perm.id)
                              : [...prev.permissions, perm.id],
                          }));
                        }}
                        className={`p-2 rounded-lg text-left text-xs transition-all border flex items-center justify-between ${
                          isChecked
                            ? 'bg-primary/10 border-primary/40 text-white font-medium'
                            : 'bg-white/3 border-white/5 text-gray-400 hover:border-white/15'
                        }`}
                      >
                        <span className="truncate pr-1">{perm.label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-cyan-400 text-background font-extrabold rounded-xl text-sm hover:from-primary hover:to-cyan-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save & Generate ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / MANAGE MODAL */}
      {/* ========================================================================= */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
                  {detailUser.numeric_id?.substring(0, 2) || 'US'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-sm">
                      {detailUser.numeric_id}
                    </span>
                    <span>{detailUser.full_name}</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">{detailUser.email}</p>
                </div>
              </div>
              <button onClick={() => setDetailUser(null)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name & ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">User ID</label>
                  <input
                    type="text"
                    value={editForm.numeric_id || ''}
                    onChange={e => setEditForm({ ...editForm, numeric_id: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-primary uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name || ''}
                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Update Password</label>
                  <input
                    type="text"
                    value={editForm.password || ''}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Enter new password to reset"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="creator">Creator</option>
                    <option value="brand">Brand</option>
                    <option value="team_member">Team / Freelancer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="suspended">Suspended (Blocked)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">
                  System Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-black/20 rounded-xl border border-white/5">
                  {SYSTEM_PERMISSIONS.map(perm => {
                    const isChecked = (editForm.permissions || []).includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            permissions: isChecked
                              ? (prev.permissions || []).filter(p => p !== perm.id)
                              : [...(prev.permissions || []), perm.id],
                          }));
                        }}
                        className={`p-2 rounded-lg text-left text-xs transition-all border flex items-center justify-between ${
                          isChecked
                            ? 'bg-primary/10 border-primary/40 text-white font-medium'
                            : 'bg-white/3 border-white/5 text-gray-400 hover:border-white/15'
                        }`}
                      >
                        <span className="truncate pr-1">{perm.label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-background font-bold rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyCredentials(detailUser)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Login</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
