'use client';
import { motion } from 'framer-motion';
import { Binoculars, Wand2, Gem } from 'lucide-react';

const cards = [
  {
    icon: <Binoculars className="w-8 h-8 text-primary" />,
    title: "Talent Discovery",
    desc: "We identify your unique skill and position you for a dedicated audience.",
    delay: 0.2
  },
  {
    icon: <Wand2 className="w-8 h-8 text-primary" />,
    title: "Skill Refinement",
    desc: "We improve your content quality with master trainers and modern frameworks.",
    delay: 0.4
  },
  {
    icon: <Gem className="w-8 h-8 text-secondary" />,
    title: "Monetization System",
    desc: "We design systems to earn & grow through brand deals, IP creation, and community.",
    delay: 0.6
  }
];

export default function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Not just an agency.<br/>
            <span className="text-primary italic">We are Growth Architects.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Creator Nest is a complete transformation platform that turns raw talent into scalable, monetizable brands.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: card.delay }}
              whileHover={{ y: -10 }}
              className="bg-glass p-10 rounded-3xl flex flex-col items-center text-center group cursor-pointer border border-white/5 hover:border-primary/30 transition-all shadow-lg"
            >
              <div className="w-20 h-20 bg-surface rounded-2xl mb-8 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 group-hover:rotate-12 transition-transform">{card.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

