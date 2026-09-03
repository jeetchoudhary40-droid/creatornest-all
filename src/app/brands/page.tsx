'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BrandHero from '@/components/landing/BrandHero';
import BrandLogos from '@/components/BrandLogos';
import { BrandProblem, BrandSolution, BrandCaseStudies } from '@/components/landing/BrandSections';
import BrandForm from '@/components/landing/BrandForm';
import LandingSection from '@/components/landing/LandingSection';

export default function BrandLanding() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <BrandHero />
      <BrandLogos />
      <BrandProblem />
      <BrandSolution />
      <BrandCaseStudies />
      <LandingSection className="bg-[#140C08]">
        <BrandForm />
      </LandingSection>
      <Footer />
    </main>
  );
}
