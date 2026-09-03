'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface LandingSectionProps extends HTMLMotionProps<'section'> {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  variant?: 'default' | 'surface' | 'dark';
}

const variants = {
  default: 'bg-background',
  surface: 'bg-surface',
  dark: 'bg-[#05070A]',
};

export default function LandingSection({
  children,
  id,
  className = '',
  containerClassName = '',
  variant = 'default',
  ...props
}: LandingSectionProps) {
  return (
    <motion.section
      id={id}
      className={`py-20 md:py-32 overflow-hidden ${variants[variant]} ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      {...props}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </motion.section>
  );
}
