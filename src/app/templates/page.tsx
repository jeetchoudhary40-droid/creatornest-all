import MarketCategoryPage from '@/components/MarketCategoryPage';

export default function TemplatesPage() {
  return (
    <MarketCategoryPage 
      categoryType="template"
      pageSubtitle="Premium Templates"
      pageTitle={
        <>Plug & Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Notion & CapCut Templates</span></> as unknown as string
      }
      pageDescription="Skip the setup. Download our ready-to-use templates to streamline your workflow instantly."
    />
  );
}
