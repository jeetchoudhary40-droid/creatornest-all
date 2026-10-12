import MarketCategoryPage from '@/components/MarketCategoryPage';

export default function ToolsPage() {
  return (
    <MarketCategoryPage 
      categoryType="tool"
      pageSubtitle="AI Tools & Software"
      pageTitle={
        <>High-Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">AI Creator Tools</span></> as unknown as string
      }
      pageDescription="Launch intelligent AI generators, interactive rate calculators, and downloadable creator toolkits to scale your channel production."
    />
  );
}
