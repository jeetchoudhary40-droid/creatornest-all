'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreatorHero from '@/components/landing/CreatorHero';
import { CreatorProblem, CreatorSolution, CreatorRoadmap, CreatorResults } from '@/components/landing/CreatorSections';
import OnboardingForm from '@/components/landing/OnboardingForm';
import LandingSection from '@/components/landing/LandingSection';

export default function CreatorLanding() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <CreatorHero />
      <CreatorProblem />
      <CreatorSolution />
      <CreatorRoadmap />
      <CreatorResults />
      <LandingSection className="bg-[#0D1219]">
        <OnboardingForm />
      </LandingSection>
      <Footer />
    </main>
  );
}
