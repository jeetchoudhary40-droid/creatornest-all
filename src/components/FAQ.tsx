'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Do I need to be a large creator to join?",
    answer: "No. We look for potential, not just numbers. Whether you have 10K followers with high engagement or 1M+ followers needing strategy, if your content shows promise, we want to work with you."
  },
  {
    question: "How does Creator Nest make money?",
    answer: "We only win when you win. We take a transparent percentage commission on the brand deals and IP revenue we help you generate. There are no upfront fees for joining the roster."
  },
  {
    question: "Do you own my channel or content?",
    answer: "Absolutely not. You retain 100% ownership of your channels, content, and intellectual property. We are your partners and managers, not your owners."
  },
  {
    question: "What kind of brands do you work with?",
    answer: "We partner with top-tier brands across tech, finance, lifestyle, gaming, and FMCG. We prioritize long-term, high-value partnerships over one-off transactional shoutouts."
  },
  {
    question: "How long is the typical commitment?",
    answer: "We build long-term relationships, but our standard initial agreement is 12 months. This gives us the runway to implement strategy, build your brand, and secure high-value deals."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-background relative border-t border-white/5">
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Got <span className="text-primary italic">Questions?</span></h2>
          <p className="text-gray-400 text-lg">Everything you need to know about partnering with Creator Nest.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface/50 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:bg-white/5"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-left text-white text-lg">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
