'use client';
import { motion } from 'framer-motion';
import { BadgeCheck, Sparkles, Video, Camera, ArrowRight, Tv } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { allCreators } from '@/app/creators/roster/rosterData';

type HomeCreator = {
  id: string;
  name: string;
  channelName?: string;
  niche: string;
  youtube: string;
  instagram: string;
  img: string;
  featured: boolean;
};

const FEATURED_STATIC: HomeCreator[] = allCreators
  .filter(c => c.featured)
  .slice(0, 8)
  .map(c => ({
    id: String(c.id),
    name: c.name,
    channelName: c.channelName || c.youtubeHandle?.replace(/^@/, '') || 'Creator',
    niche: c.niches && c.niches.length > 0 ? c.niches[0] : c.niche,
    youtube: c.youtube,
    instagram: c.instagram,
    img: c.img,
    featured: c.featured
  }));

export default function FeaturedCreators() {
  const [featured, setFeatured] = useState<HomeCreator[]>(FEATURED_STATIC);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch('/api/admin/roster');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.creators) && json.creators.length > 0) {
            const featuredList = json.creators
              .filter((c: any) => c.show_on_home || c.featured)
              .sort((a: any, b: any) => (Number(a.rank) || 999) - (Number(b.rank) || 999))
              .slice(0, 8)
              .map((c: any) => ({
                id: String(c.id),
                name: c.name,
                channelName: c.channelName || c.youtubeHandle?.replace(/^@/, '') || '',
                niche: (c.niches && Array.isArray(c.niches) && c.niches.length > 0) ? c.niches[0] : (c.niche || 'Tech & AI'),
                youtube: c.youtube || '0',
                instagram: c.instagram || '0',
                img: c.img || '',
                featured: Boolean(c.featured)
              }));
            if (featuredList.length > 0) {
              setFeatured(featuredList);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch featured creators from /api/admin/roster", err);
      }
    };
    loadFeatured();
  }, []);

  return (
    <section id="creators" className="py-24 bg-[#080B0F] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
        <Sparkles className="w-64 h-64 text-primary" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 italic">The Nest <span className="text-primary">Roster</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              A curated network of creators across Tech, Education, Entertainment, Lifestyle & Gaming building real influence, income, and personal brands.
              <span className="block mt-2 text-primary/80 text-sm font-medium tracking-wide">Every creator here is actively growing and monetizing through our ecosystem.</span>
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featured.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: (idx % 4) * 0.12 }}
              whileHover={{ y: -8 }}
              className="bg-[#0B0F15] rounded-2xl p-3 sm:p-3.5 border border-white/10 hover:border-primary/40 transition-all group shadow-xl hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] relative flex flex-col justify-between"
            >
              {/* Creator Photo Box */}
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-white/5">
                {/* Smaller Top Badges */}
                <div className="absolute top-2 left-2 z-10">
                  {idx === 0 ? (
                    <span className="bg-yellow-400/20 backdrop-blur-md border border-yellow-400/40 text-yellow-400 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center shadow-md">
                      <BadgeCheck className="w-2.5 h-2.5 mr-1 text-yellow-400" /> #1 Featured
                    </span>
                  ) : (
                    <span className="bg-primary/20 backdrop-blur-md border border-primary/40 text-primary text-[9px] font-black px-2 py-0.5 rounded-full flex items-center shadow-md">
                      Top Creator
                    </span>
                  )}
                </div>

                {c.img ? (
                  <Image
                    src={c.img}
                    alt={c.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="text-3xl text-primary font-bold">{c.name.charAt(0)}</span>
                  </div>
                )}

                {/* Bottom Shadow Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F15] via-[#0B0F15]/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                {/* Creator Details (Bottom Left Aligned) */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-0.5">
                  {/* Full Creator Name + Verified Badge */}
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center drop-shadow-md group-hover:text-primary transition-colors">
                    <span className="truncate">{c.name}</span>
                    <BadgeCheck className="w-4 h-4 text-primary ml-1 shrink-0 drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]" />
                  </h3>

                  {/* Channel Name */}
                  {c.channelName && (
                    <p className="text-[11px] text-gray-300 font-medium truncate flex items-center gap-1">
                      <Tv className="w-3 h-3 text-red-400 shrink-0" />
                      <span>{c.channelName}</span>
                    </p>
                  )}

                  {/* Primary Niche Only */}
                  <div className="pt-0.5">
                    <span className="inline-block bg-white/10 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-200 tracking-wide">
                      {c.niche}
                    </span>
                  </div>
                </div>
              </div>

              {/* Single-Line Compact Platform Stats Bar */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5">
                {/* YouTube */}
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Video className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-white leading-none">{c.youtube}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">YT</span>
                  </div>
                </div>

                <div className="h-3 w-[1px] bg-white/10 shrink-0" />

                {/* Instagram */}
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Camera className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-white leading-none">{c.instagram}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">IG</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link href="/creators/roster" className="inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-surface/50 border border-white/10 hover:border-primary/50 hover:bg-white/5 rounded-full transition-all group shadow-lg">
            View Complete Roster
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform text-primary" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
