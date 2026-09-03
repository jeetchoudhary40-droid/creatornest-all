import MarketCategoryPage from '@/components/MarketCategoryPage';

export default function ServicesPage() {
  return (
    <MarketCategoryPage 
      categoryType="service"
      pageSubtitle="Expert Services"
      pageTitle={
        <>Done-For-You <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Creator Services</span></> as unknown as string
      }
      pageDescription="Hire our vetted experts to edit your videos, design your brand, and manage your growth."
    />
  );
}
