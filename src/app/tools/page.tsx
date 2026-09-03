import MarketCategoryPage from '@/components/MarketCategoryPage';

export default function ToolsPage() {
  return (
    <MarketCategoryPage 
      categoryType="tool"
      pageSubtitle="AI Tools & Software"
      pageTitle={
        <>The Creator Nest <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Intelligence Suite</span></> as unknown as string
      }
      pageDescription="Download our curated AI tools and software built to help you grow and monetize faster."
    />
  );
}
