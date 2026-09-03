'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Video, Briefcase, Users, Wrench, GraduationCap, PlayCircle, Star } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="pt-32 pb-20 relative overflow-hidden flex-1">
        {/* Background Decorative */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(0,242,254,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.6) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">{user?.full_name || 'User'}</span>
            </h1>
            <p className="text-gray-400">
              Access your free resources, manage your profile, or upgrade your account by applying for a role.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Role Applications */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="md:col-span-1 space-y-6"
            >
              <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Upgrade Your Profile
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  Unlock advanced features by applying for a specific role in our ecosystem.
                </p>
                
                <div className="space-y-3">
                  <Link href="/join?role=creator" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-lg text-primary">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm text-gray-200 group-hover:text-white">Apply as Creator</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                  </Link>

                  <Link href="/join?role=brand" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-secondary/50 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary/20 p-2 rounded-lg text-secondary">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm text-gray-200 group-hover:text-white">Join as Brand</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-secondary transition-colors" />
                  </Link>

                  <Link href="/join?role=career" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/50 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-lg text-white">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm text-gray-200 group-hover:text-white">Join the Team</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Free Resources */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="md:col-span-2 space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Tools Card */}
                <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Free Tools</h3>
                  <p className="text-sm text-gray-400 mb-6 flex-1">
                    Access our suite of basic tools to help you manage your content and workflow.
                  </p>
                  <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                    Explore Tools <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Courses Card */}
                <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Free Courses</h3>
                  <p className="text-sm text-gray-400 mb-6 flex-1">
                    Learn the basics of content creation, brand deals, and audience growth.
                  </p>
                  <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                    Browse Courses <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Services Card */}
                <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:col-span-2">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <PlayCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Basic Services</h3>
                  <p className="text-sm text-gray-400 mb-6 flex-1">
                    Discover standard services offered by CreatorNest to kickstart your journey.
                  </p>
                  <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors">
                    View Services <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
