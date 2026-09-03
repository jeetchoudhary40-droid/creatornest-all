'use client';
import { motion } from 'framer-motion';
import { ArrowRight, CornerDownRight } from 'lucide-react';
import Image from 'next/image';

const offerings = [
  {
    title: "Brand Partnerships & Incubation",
    desc: "We don't just secure one-off sponsorships; we forge long-term, high-value brand partnerships. We position you not as temporary ad space, but as a strategic, influential asset for top-tier companies.",
    points: [
      "Premium brand matchmaking",
      "Negotiation & contract structuring",
      "Long-term ambassadorship development",
      "ROI-driven campaign scaling"
    ],
    img: "https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    bgClass: "bg-surface/50 border-y border-white/5",
    textClass: "text-white"
  },
  {
    title: "Owned Content Franchises (IPs)",
    desc: "Move beyond fleeting short-form trends. We help you conceptualize, produce, and launch your own massive digital IPs—from high-production series to flagship podcasts—turning your channel into a modern media network.",
    points: [
      "Original format development",
      "High-end production & creative support",
      "Cross-platform syndication strategy",
      "Audience retention engineering"
    ],
    img: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    bgClass: "bg-primary/5 border-y border-primary/10",
    textClass: "text-white"
  },
  {
    title: "Ecosystem Management",
    desc: "We operate as your entire back-office and strategic growth engine. From day-to-day operational bottlenecks to massive career pivots, we provide the infrastructure needed so you can focus purely on creating.",
    points: [
      "Dedicated 360° strategy team",
      "Revenue stream diversification",
      "Legal, financial & operational guidance",
      "PR & holistic career mapping"
    ],
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    bgClass: "bg-surface/50 border-y border-white/5",
    textClass: "text-white"
  }
];

export default function WhatWeOffer() {
  return (
    <section id="what-we-offer" className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">What we <span className="text-primary italic">offer?</span></h2>
        </motion.div>
      </div>

      <div className="flex flex-col">
        {offerings.map((offer, idx) => (
          <div key={idx} className={`py-16 md:py-24 ${offer.bgClass}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24`}>
                
                {/* Text Content */}
                <motion.div 
                  initial={{ opacity: 0, x: idx % 2 !== 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex-1"
                >
                  <h3 className={`text-3xl md:text-5xl font-bold mb-6 ${offer.textClass}`}>{offer.title}</h3>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    {offer.desc}
                  </p>
                  
                  <ul className="space-y-4">
                    {offer.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start text-gray-300">
                        <CornerDownRight className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
                        <span className="font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Image/Visual Content */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex-1 w-full"
                >
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                    <Image 
                      src={offer.img} 
                      alt={offer.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
