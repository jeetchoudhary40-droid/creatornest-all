export interface Creator {
  id: number;
  name: string;
  niche: string;
  niches?: string[];
  channelName?: string;
  platform: "Youtube" | "Instagram" | "Both";
  youtube: string;
  youtubeNum: number;
  instagram: string;
  instaNum: number;
  location: string;
  avd: string;
  avgViewsLast10?: number | string;
  topGrowing: boolean;
  featured: boolean;
  rank: number;
  img: string;
  bio: string;
  youtubeUrl?: string;
  youtubeHandle?: string;
  instaUrl?: string;
  instaHandle?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  businessEmail?: string;
}

export const allCreators: Creator[] = [
  {
    id: 1,
    name: "Jeet Choudhary",
    channelName: "Election Guide",
    niche: "EdTech & App Reviews",
    niches: [
      "EdTech & App Reviews",
      "Cybersecurity & Data",
      "AI & Automation"
    ],
    platform: "Both",
    youtube: "110K",
    youtubeNum: 110000,
    instagram: "45K",
    instaNum: 45000,
    location: "Delhi",
    avd: "82%",
    avgViewsLast10: 40000,
    topGrowing: true,
    featured: true,
    rank: 1,
    img: "/images/creators/jeet-choudhary.png",
    bio: "Founder of @ElectionGuide (110K+ Subscribers). Leading EdTech & App Review creator specializing in digital governance apps, educational workflows, tech tutorials, and software walkthroughs.",
    youtubeUrl: "https://www.youtube.com/@ElectionGuide",
    youtubeHandle: "@ElectionGuide",
    instaUrl: "https://instagram.com/electionguide",
    instaHandle: "@electionguide",
    businessEmail: "collabs@creatornest.in"
  },
  {
    id: 2,
    name: "Damini Tripathi",
    channelName: "Damini Tripathi",
    niche: "AI & Automation",
    niches: [
      "AI & Automation",
      "EdTech & App Reviews",
      "SaaS & Cloud Tools"
    ],
    platform: "Both",
    youtube: "346K",
    youtubeNum: 346000,
    instagram: "812K",
    instaNum: 812000,
    location: "Bhopal",
    avd: "78%",
    avgViewsLast10: 54000,
    topGrowing: true,
    featured: true,
    rank: 2,
    img: "/images/creators/damini-tripathi.jpg",
    bio: "Digital marketing educator & agency founder (1.15M+ community). Teaching real & raw Meta Ads, Google AI Studio automations, WhatsApp marketing, and e-commerce growth.",
    youtubeUrl: "https://www.youtube.com/@daminitripathia",
    youtubeHandle: "@daminitripathia",
    instaUrl: "https://www.instagram.com/damini.creator/",
    instaHandle: "@damini.creator",
    websiteUrl: "https://marketian.io",
    businessEmail: "collabs@creatornest.in"
  },
  {
    id: 3,
    name: "Hitesh Choudhary",
    channelName: "Chai aur Code",
    niche: "Coding & Tech Education",
    niches: [
      "Coding & Tech Education",
      "Web Development",
      "AI & Automation"
    ],
    platform: "Both",
    youtube: "927K",
    youtubeNum: 927000,
    instagram: "204K",
    instaNum: 204000,
    location: "India",
    avd: "85%",
    avgViewsLast10: 120000,
    topGrowing: true,
    featured: true,
    rank: 3,
    img: "/images/creators/hitesh-choudhary.jpg",
    bio: "Founder of Chai aur Code (927K+ subscribers). Teaching coding & DSA in Hindi over a cup of chai. Full-stack dev, educator, and tech entrepreneur. Stepped into 45+ countries.",
    youtubeUrl: "https://www.youtube.com/@chaiaurcode",
    youtubeHandle: "@chaiaurcode",
    instaUrl: "https://www.instagram.com/hiteshchoudharyofficial/",
    instaHandle: "@hiteshchoudharyofficial",
    websiteUrl: "https://chaicode.com",
    businessEmail: "team@hiteshchoudhary.com"
  },
  {
    id: 4,
    name: "Shradha Khapra",
    channelName: "Apna College",
    niche: "Coding & Tech Education",
    niches: [
      "Coding & Tech Education",
      "Full-Stack & DevOps",
      "AI & Automation"
    ],
    platform: "Both",
    youtube: "7.87M",
    youtubeNum: 7870000,
    instagram: "873K",
    instaNum: 873000,
    location: "Delhi, India",
    avd: "86%",
    avgViewsLast10: 450000,
    topGrowing: true,
    featured: true,
    rank: 4,
    img: "/images/creators/shradha-khapra.jpg",
    bio: "Founder of Apna College (7.87M+ subscribers, 10M+ community). Ex-Microsoft Software Engineer, Google SPS & DRDO. Leading tech educator teaching DSA, AI Full-Stack Web Development, and placement preparation.",
    youtubeUrl: "https://www.youtube.com/@ApnaCollegeOfficial",
    youtubeHandle: "@ApnaCollegeOfficial",
    instaUrl: "https://www.instagram.com/shradhakhapra/",
    instaHandle: "@shradhakhapra",
    linkedinUrl: "https://linkedin.com/in/shradha-khapra",
    websiteUrl: "https://apnacollege.in",
    businessEmail: "partnerships@apnacollege.in"
  },
  {
    id: 5,
    name: "Abhijeet Kalamkar",
    channelName: "AI Learners India",
    niche: "AI & Automation",
    niches: [
      "AI & Automation",
      "SaaS & Cloud Tools",
      "EdTech & App Reviews"
    ],
    platform: "Both",
    youtube: "172K",
    youtubeNum: 172000,
    instagram: "34.2K",
    instaNum: 34200,
    location: "India",
    avd: "79%",
    avgViewsLast10: 14000,
    topGrowing: true,
    featured: true,
    rank: 5,
    img: "/images/creators/abhijeet-kalamkar.jpg",
    bio: "Founder of AI Learners India (172K+ subscribers). AI Engineer & educator specializing in AI Agents, n8n automations, LLM workflows, Claude Code, and practical business automation.",
    youtubeUrl: "https://www.youtube.com/@AILearnersbyabhijeet",
    youtubeHandle: "@AILearnersbyabhijeet",
    instaUrl: "https://www.instagram.com/abhijeet.kalamkar.ai/",
    instaHandle: "@abhijeet.kalamkar.ai",
    linkedinUrl: "https://linkedin.com/in/ailearnersindia",
    twitterUrl: "https://x.com/AILearnersIndia",
    websiteUrl: "https://www.youtube.com/channel/UCjFCA87HP52yFjKyRW4-8Hw/join",
    businessEmail: "collabs@creatornest.in"
  },
  {
    id: 6,
    name: "Saumya Singh",
    channelName: "Saumya Singh",
    niche: "Coding & Tech Education",
    niches: [
      "Coding & Tech Education",
      "AI & Automation",
      "EdTech & App Reviews"
    ],
    platform: "Both",
    youtube: "283K",
    youtubeNum: 283000,
    instagram: "622K",
    instaNum: 622000,
    location: "Delhi, India",
    avd: "80%",
    avgViewsLast10: 45000,
    topGrowing: true,
    featured: true,
    rank: 6,
    img: "/images/creators/saumya-singh.jpg",
    bio: "Software Engineer (5+ yrs), 4x TEDx Speaker, LinkedIn Top Voice & Tech Educator (1M+ community). Ex-upGrad, Scaler, Newton School mentor. GSoC mentor & SIH winner teaching Coding, CS fundamentals & AI workflows.",
    youtubeUrl: "https://www.youtube.com/@saumya1singh",
    youtubeHandle: "@saumya1singh",
    instaUrl: "https://www.instagram.com/saumya1singh/",
    instaHandle: "@saumya1singh",
    linkedinUrl: "https://linkedin.com/in/saumya1singh",
    twitterUrl: "https://twitter.com/saumya1singh",
    websiteUrl: "https://topmate.io/saumya1singh",
    businessEmail: "collabs@creatornest.in"
  },
  {
    id: 7,
    name: "Praveen Janawa",
    channelName: "Dear Kisan",
    niche: "Agriculture & Farming",
    niches: [
      "Agriculture & Farming",
      "Education & Upskilling",
      "Rural Tech & Innovation"
    ],
    platform: "Both",
    youtube: "745K",
    youtubeNum: 745000,
    instagram: "142K",
    instaNum: 142000,
    location: "Haryana, India",
    avd: "76%",
    avgViewsLast10: 85000,
    topGrowing: true,
    featured: true,
    rank: 7,
    img: "/images/creators/praveen-janawa.jpg",
    bio: "Founder of Dear Kisan (745K+ subscribers, 120M+ views). India's leading agriculture & farming YouTuber from Haryana — covering crop management, farming tips, pesticide research, modern machinery reviews, and kisan welfare. Empowering Indian farmers with practical field knowledge since 2019.",
    youtubeUrl: "https://www.youtube.com/@dear_kisan",
    youtubeHandle: "@dear_kisan",
    instaUrl: "https://www.instagram.com/dear_kisan/",
    instaHandle: "@dear_kisan",
    websiteUrl: "https://dearkisan.com",
    businessEmail: "collabs@creatornest.in"
  }
];

export const niches = [
  "All",
  "Education & Upskilling",
  "EdTech & App Reviews",
  "Entertainment & Comedy",
  "Lifestyle & Fashion",
  "Gaming & Esports",
  "Finance & Business",
  "Tech & Gadgets",
  "AI & Automation",
  "Coding & Tech Education",
  "Web Development",
  "Mobile Apps Review",
  "Podcasting & Storytelling",
  "Cybersecurity & Data",
  "Agriculture & Farming"
];

export const platforms = ["All", "Youtube", "Instagram"];
export const subscriberTiers = [
  { label: "All", min: 0 },
  { label: "100K+", min: 100000 },
  { label: "500K+", min: 500000 },
  { label: "1M+", min: 1000000 },
  { label: "2M+", min: 2000000 },
  { label: "5M+", min: 5000000 },
];
export const sorts = ["Highest Subs", "Top Growing", "Highest AVD", "Name A-Z"];
