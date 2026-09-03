import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BrandLogos from '@/components/BrandLogos';
import StatsBand from '@/components/StatsBand';
import BrandPitchSection from '@/components/BrandPitchSection';
import FeaturedCreators from '@/components/FeaturedCreators';
import CaseStudies from '@/components/CaseStudies';
import Roadmap from '@/components/Roadmap';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      name: 'Creator Nest — All-Category Creator Growth & Talent Ecosystem',
      image: 'https://creatornest.in/images/og-cover.png',
      '@id': 'https://creatornest.in',
      url: 'https://creatornest.in',
      telephone: '+91-9876543210',
      priceRange: '₹₹₹',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 19.0760,
        longitude: 72.8777,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '128',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What creator categories does Creator Nest specialize in?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We represent creators across all major verticals including Education & Upskilling, Tech & AI, Entertainment & Comedy, Lifestyle & Fashion, Gaming, Finance, and Podcasting.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do you help brands achieve higher ROI and lower CAC?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We match brands with vetted creators whose audiences are high-intent and engaged, driving authentic integrations, high watch time, and measurable conversion.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do creators retain full channel and IP ownership?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, absolutely. You retain 100% ownership of your channels, content, and IP. Creator Nest acts as your strategic talent and growth management partner.',
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Navbar />
      <Hero />
      <BrandLogos />
      <StatsBand />
      <BrandPitchSection />
      <FeaturedCreators />
      <CaseStudies />
      <Roadmap />
      <Testimonials />
      <FAQ />
      <CtaSection />
      <Footer />
    </main>
  );
}
