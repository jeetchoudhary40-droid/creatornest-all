import MarketCategoryPage from '@/components/MarketCategoryPage';

export default function PromptsPage() {
  return (
    <MarketCategoryPage 
      categoryType="prompt"
      pageSubtitle="AI Prompt Library"
      pageTitle={
        <>Master ChatGPT <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">With Our Prompt Library</span></> as unknown as string
      }
      pageDescription="Unlock the full power of AI with our battle-tested prompts for scripting, ideation, and marketing."
    />
  );
}
