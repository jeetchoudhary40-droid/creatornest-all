'use client';

import { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, Sparkles, Loader2, ArrowLeft, Copy, CheckCircle2, Lock, FileText, Video, MessageSquare, Zap
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import BrandDealCalculator from '@/components/BrandDealCalculator';

const TOOLS_DATA: Record<string, any> = {
  'brand-deal-calculator': {
    title: 'Brand Deal Pricing & Capacity Calculator',
    description: 'Calculate your exact creator rate card in ₹, deliverable pricing, CPM/CPE, and compare rates across 13 niches.',
    icon: FileText,
    accent: '#10B981',
    planRequired: 'free',
    isCalculator: true
  },
  'script-generator': {
    title: 'YouTube Script Generator',
    description: 'Generate high-retention YouTube scripts with viral hooks and clear storytelling arcs.',
    icon: FileText,
    accent: '#00F2FE',
    planRequired: 'free'
  },
  'caption-writer': {
    title: 'Viral Caption Writer',
    description: 'Write engaging captions for Instagram Reels and TikTok that drive comments and shares.',
    icon: MessageSquare,
    accent: '#F59E0B',
    planRequired: 'free'
  },
  'youtube-seo': {
    title: 'YouTube SEO Optimizer',
    description: 'Generate high-ranking titles, tags, and descriptions for your videos.',
    icon: Video,
    accent: '#10B981',
    planRequired: 'silver'
  }
};

export default function AIToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tool = TOOLS_DATA[slug];

  if (slug === 'brand-deal-calculator') {
    return (
      <main className="min-h-screen bg-[#070B11] text-white">
        <Navbar />
        <div className="pt-28 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/tools" className="text-primary text-xs font-bold hover:underline flex items-center gap-1 mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools Directory
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Brand Deal Pricing & Capacity Calculator</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">India 2026 Edition with dual-niche comparison & deliverable rate card</p>
          </div>
          <BrandDealCalculator />
        </div>
      </main>
    );
  }

  if (!tool) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl text-white font-bold">Tool Not Found</h1>
          <Link href="/tools" className="text-primary mt-4 inline-block hover:underline">Back to Tools</Link>
        </div>
      </main>
    );
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !user) return;

    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_slug: slug,
          prompt: prompt,
          context: { plan_tier: user.plan_tier || 'free' }
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.error || 'Failed to generate content');
      }

      setResult(data.result);
      if (data.credits_remaining !== null) {
        setCreditsLeft(data.credits_remaining);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = tool.icon;

  return (
    <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${tool.accent}15 0%, transparent 70%)` }} />

      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
        
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Input Form */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${tool.accent}15` }}>
                <Icon className="w-6 h-6" style={{ color: tool.accent }} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{tool.title}</h1>
              <p className="text-gray-400">{tool.description}</p>
            </div>

            {!user ? (
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                <Lock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Sign in to use this tool</h3>
                <p className="text-sm text-gray-400 mb-4">Join Creator Nest for free to get access to AI tools, courses, and more.</p>
                <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-xl font-bold text-sm">
                  Sign In with Google
                </Link>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl">
                <label className="block text-sm font-bold text-white mb-2">What do you want to create?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A 5-minute video about how the YouTube algorithm works in 2026..."
                  className="w-full h-32 bg-background border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors custom-scrollbar mb-4"
                  required
                />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    {creditsLeft !== null ? (
                      <span>{creditsLeft} credits remaining today</span>
                    ) : user.plan_tier === 'gold' || user.plan_tier === 'platinum' ? (
                      <span className="text-green-400">Unlimited credits</span>
                    ) : (
                      <span>Uses daily credits</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${tool.accent}, #0070F3)`, color: '#0B0F14' }}
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  {isGenerating ? 'Generating...' : 'Generate Content'}
                </button>

                {error && (
                  <p className="mt-4 text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    {error} {error.includes('exhausted') && <Link href="/pricing" className="underline font-bold ml-1">Upgrade Plan</Link>}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Right Column: Output Area */}
          <div className="bg-surface border border-white/10 rounded-2xl p-6 min-h-[500px] flex flex-col relative overflow-hidden group shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Generated Result
              </h2>
              {result && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-16 h-16 relative mb-4">
                      <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                      <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <p className="text-primary font-bold text-sm">AI is thinking...</p>
                    <p className="text-gray-500 text-xs mt-1">Analyzing prompts and fetching data</p>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed"
                  >
                    {result}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-50"
                  >
                    <Wand2 className="w-12 h-12 text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm">Your generated content will appear here.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
