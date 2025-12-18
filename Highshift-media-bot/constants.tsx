
import React from 'react';
import type { Service, Question } from './types';
import { IndustryAgentsIcon } from './components/icons/IndustryAgentsIcon';
import { MarketingHubIcon } from './components/icons/MarketingHubIcon';
import { ClinicIcon, ConstructionIcon, DealershipIcon, RestaurantIcon, SalonIcon } from './components/icons/AgentIcons';
import { EmailIcon, SocialMediaIcon } from './components/icons/MarketingIcons';
import type { IndustryAgent } from './types';

export { IndustryAgentsIcon, MarketingHubIcon, ClinicIcon, ConstructionIcon, DealershipIcon, RestaurantIcon, SalonIcon, EmailIcon, SocialMediaIcon };


export const BrandLogo = ({ className = "h-32 w-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
        <stop offset="100%" stopColor="rgba(30, 58, 138, 0.8)" />
      </linearGradient>
      <filter id="glass_blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
      </filter>
    </defs>
    
    <circle cx="256" cy="256" r="230" fill="url(#bg_grad)" stroke="rgba(255,255,255,0.2)" strokeWidth="4"/>
    
    {/* Specular highlight for glass look */}
    <ellipse cx="180" cy="140" rx="60" ry="30" fill="rgba(255,255,255,0.1)" transform="rotate(-30, 180, 140)" />

    {/* Grid Background */}
    <path d="M120 120H392M120 200H392M120 280H392M120 360H392" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <path d="M120 120V392M200 120V392M280 120V392M360 120V392" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    
    {/* Growth Arrow ZigZag with Gloss */}
    <path d="M80 420L150 340L210 380L310 220L360 270L440 130" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <path d="M80 420L150 340L210 380L310 220L360 270L440 130" stroke="#0ea5e9" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Arrow Tip */}
    <path d="M440 130L370 145M440 130L425 200" stroke="#0ea5e9" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== ICONS =====
const ChatbotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ContentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const AutomationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const WebsiteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ModelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m5 10v4m-2-2h4M5 3a2 2 0 00-2 2v1.5a2.5 2.5 0 005 0V5a2 2 0 00-2-2zm14 0a2 2 0 00-2 2v1.5a2.5 2.5 0 005 0V5a2 2 0 00-2-2zM5 17a2 2 0 00-2 2v1.5a2.5 2.5 0 005 0V19a2 2 0 00-2-2zm14 0a2 2 0 00-2 2v1.5a2.5 2.5 0 005 0V19a2 2 0 00-2-2z" />
  </svg>
);

const GameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BusinessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const VoiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

// Social Media Icons
export const TikTokIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-1.26-.88-2.22-2.19-2.68-3.6-.03 3.14-.04 6.28-.04 9.42 0 1.05-.1 2.13-.42 3.13-.36 1.25-1.14 2.39-2.21 3.12-1.27.87-2.88 1.29-4.41 1.14-1.63-.16-3.18-.94-4.22-2.21-1.16-1.41-1.63-3.27-1.32-5.07.28-1.57 1.16-3.03 2.47-3.95 1.48-1.04 3.4-1.44 5.19-1.07.02 1.48.01 2.97.02 4.45-.63-.2-1.31-.22-1.95-.08-.63.14-1.21.5-1.61 1.02-.4.5-.62 1.14-.61 1.78.01.63.22 1.26.59 1.77.38.52.95.89 1.57 1.04.65.17 1.36.14 1.99-.07.69-.22 1.29-.68 1.67-1.3.36-.6.49-1.3.48-2.01-.01-4.76-.01-9.51-.01-14.27z"/>
  </svg>
);

export const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
  </svg>
);

export const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.337 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export const YoutubeIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/>
  </svg>
);

export const XIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z"/>
  </svg>
);

export const WhatsAppIcon = () => (
  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const SERVICES: Service[] = [
  {
    id: 'industry_agents',
    name: 'Industry AI Agents',
    description: 'Pre-built AI agents for Restaurants, Clinics, Salons, Car Dealerships, and Construction companies.',
    icon: <IndustryAgentsIcon />,
    category: 'industry',
  },
  {
    id: 'marketing_hub',
    name: 'Marketing & Automation Hub',
    description: 'Content creation, social media automation, email marketing, and lead generation tools.',
    icon: <MarketingHubIcon />,
    category: 'marketing',
  },
  {
    id: 'whatsapp_bot',
    name: 'WhatsApp Business Bot',
    description: 'AI-powered WhatsApp bot for customer support, lead qualification, bookings, and follow-ups.',
    icon: <WhatsAppIcon />,
    category: 'communication',
  },
  {
    id: 'chatbot',
    name: 'AI Chatbot Development',
    description: 'Engage customers 24/7 with intelligent, conversational AI chatbots tailored to your business needs.',
    icon: <ChatbotIcon />,
    category: 'automation',
  },
  {
    id: 'website_creation',
    name: 'Highshift Website Design',
    description: 'Transform your brand with a high-performance, AI-optimized website built for the modern era.',
    icon: <WebsiteIcon />
  },
  {
    id: 'content',
    name: 'AI-Powered Content Creation',
    description: 'Generate high-quality blog posts, marketing copy, and social media content at scale with AI.',
    icon: <ContentIcon />,
    category: 'marketing',
  },
  {
    id: 'automation',
    name: 'AI Business Automation',
    description: 'Streamline your workflows, automate repetitive tasks, and increase efficiency with custom AI solutions.',
    icon: <AutomationIcon />,
    category: 'automation',
  },
  {
    id: 'model',
    name: 'Custom AI Model Training',
    description: 'Develop and train bespoke AI models on your data to solve unique business challenges.',
    icon: <ModelIcon />,
    category: 'automation',
  },
  {
    id: 'business_plan',
    name: 'AI Business Plan Generator',
    description: 'Answer a few questions to generate a comprehensive business plan, including market and competitor analysis.',
    icon: <BusinessIcon />,
    category: 'other',
  },
  {
    id: 'voice_agent',
    name: 'AI Voice Agent',
    description: 'Experience a live, voice-based conversation with our advanced AI assistant. Perfect for interactive demos.',
    icon: <VoiceIcon />,
    category: 'communication',
  },
  {
    id: 'snake',
    name: 'Just for Fun: Snake',
    description: 'Take a break and play a classic game of Snake. A small demo of interactive development.',
    icon: <GameIcon />,
    category: 'other',
  },
];

const GENERAL_QUESTIONS: Question[] = [
  {
    text: "First, could you describe your business or industry? This helps us understand your unique landscape.",
    options: ["E-commerce", "SaaS / Technology", "Healthcare", "Finance & Fintech", "Education", "Restaurant/Food", "Automotive", "Construction", "Other"]
  },
  {
    text: "What specific challenge or opportunity are you hoping to address with AI?",
    options: ["Improve Customer Support", "Automate Content Creation", "Streamline Business Processes", "Data Analysis & Insights", "Lead Generation & Sales", "Appointment Booking", "Order Management", "Other"]
  },
  {
    text: "What does a successful outcome look like for you?",
    options: ["Increase Revenue", "Reduce Operational Costs", "Improve Team Efficiency", "Enhance Customer Satisfaction", "Gain a Competitive Edge", "24/7 Availability", "Other"]
  },
  {
    text: "What's your current experience level with AI solutions?",
    options: ["Just starting to explore", "We use some basic AI tools", "We have an in-house team", "Actively researching vendors", "Other"]
  },
  {
    text: "Finally, what is your estimated budget and timeline for this project? This helps us scope the solution.",
    options: ["<$5k, 1-3 months", "$5k-$15k, 1-3 months", "$15k-$50k, 3-6 months", ">$50k, 6+ months", "Flexible / Undecided"]
  }
];

const WEBSITE_QUESTIONS: Question[] = [
  {
    text: "Let's build your presence. What is your brand name?",
    options: []
  },
  {
    text: "What is your specific niche or industry?",
    options: []
  },
  {
    text: "Which color palette fits your brand best?",
    options: [
        "Midnight: Navy Blue, Electric Cyan, Slate Grey",
        "Creative: Deep Purple, Vivid Magenta, Gold",
        "Nature: Forest Green, Emerald, Warm Sand"
    ]
  },
  {
    text: "Do you have any specific color suggestions or hex codes in mind?",
    options: []
  },
  {
    text: "What is the primary goal of your website? (e.g., Sell products, Professional Portfolio, Informational Blog)",
    options: ["E-commerce", "Portfolio", "Landing Page", "Lead Generation", "Corporate Site"]
  }
];

export const QUESTIONS: Record<string, Question[]> = {
  chatbot: GENERAL_QUESTIONS,
  content: GENERAL_QUESTIONS,
  automation: GENERAL_QUESTIONS,
  model: GENERAL_QUESTIONS,
  website_creation: WEBSITE_QUESTIONS,
};

export const BUSINESS_PLAN_QUESTIONS: string[] = [
  "What industry or market will your business operate in? (e.g., 'Gourmet Coffee Shops', 'Sustainable Fashion E-commerce')",
  "Describe the primary product or service you will offer. What makes it unique?",
  "Who is your target customer? Be as specific as possible. (e.g., 'Urban professionals aged 25-40', 'Eco-conscious families')",
  "What is the primary goal of your business for the first year? (e.g., 'Reach $100k in revenue', 'Acquire 1,000 paying customers')",
  "What is your proposed business name? (This will be used to personalize your plan)"
];

// ===== RESTAURANT MENU (for demo) =====
export const SAMPLE_MENU = {
  categories: [
    {
      name: 'Starters',
      items: [
        { id: 's1', name: 'Garlic Bread', price: 5.99, description: 'Crispy bread with garlic butter' },
        { id: 's2', name: 'Caesar Salad', price: 8.99, description: 'Fresh romaine with caesar dressing' },
        { id: 's3', name: 'Soup of the Day', price: 6.99, description: 'Ask about today\'s special' },
      ]
    },
    {
      name: 'Main Courses',
      items: [
        { id: 'm1', name: 'Grilled Salmon', price: 22.99, description: 'Atlantic salmon with seasonal vegetables' },
        { id: 'm2', name: 'Chicken Parmesan', price: 18.99, description: 'Breaded chicken with marinara sauce' },
        { id: 'm3', name: 'Beef Burger', price: 15.99, description: 'Angus beef with all the fixings' },
        { id: 'm4', name: 'Pasta Primavera', price: 14.99, description: 'Fresh vegetables in creamy sauce' },
      ]
    },
    {
      name: 'Desserts',
      items: [
        { id: 'd1', name: 'Chocolate Cake', price: 7.99, description: 'Rich chocolate layer cake' },
        { id: 'd2', name: 'Cheesecake', price: 8.99, description: 'New York style cheesecake' },
        { id: 'd3', name: 'Ice Cream', price: 5.99, description: 'Three scoops of your choice' },
      ]
    }
  ]
};

// ===== SAMPLE SERVICES (for Salon demo) =====
export const SALON_SERVICES = [
  { id: 'haircut', name: 'Haircut', duration: 30, price: 35 },
  { id: 'coloring', name: 'Hair Coloring', duration: 90, price: 85 },
  { id: 'styling', name: 'Styling', duration: 45, price: 50 },
  { id: 'manicure', name: 'Manicure', duration: 30, price: 25 },
  { id: 'pedicure', name: 'Pedicure', duration: 45, price: 35 },
  { id: 'facial', name: 'Facial Treatment', duration: 60, price: 65 },
];

// ===== SAMPLE DOCTORS (for Clinic demo) =====
export const CLINIC_DOCTORS = [
  { id: 'dr1', name: 'Dr. Sarah Johnson', specialty: 'General Practice', available: ['Mon', 'Wed', 'Fri'] },
  { id: 'dr2', name: 'Dr. Michael Chen', specialty: 'Pediatrics', available: ['Tue', 'Thu', 'Sat'] },
  { id: 'dr3', name: 'Dr. Emily Williams', specialty: 'Dermatology', available: ['Mon', 'Tue', 'Wed'] },
  { id: 'dr4', name: 'Dr. James Brown', specialty: 'Cardiology', available: ['Wed', 'Thu', 'Fri'] },
];

// ===== SAMPLE VEHICLES (for Dealership demo) =====
export const DEALERSHIP_VEHICLES = [
  { id: 'v1', make: 'Toyota', model: 'Camry', year: 2024, price: 28500, type: 'Sedan', available: true },
  { id: 'v2', make: 'Honda', model: 'CR-V', year: 2024, price: 32000, type: 'SUV', available: true },
  { id: 'v3', make: 'Ford', model: 'F-150', year: 2024, price: 45000, type: 'Truck', available: true },
  { id: 'v4', make: 'Tesla', model: 'Model 3', year: 2024, price: 42000, type: 'Electric', available: false },
  { id: 'v5', make: 'BMW', model: 'X5', year: 2024, price: 65000, type: 'Luxury SUV', available: true },
];

export const INDUSTRY_AGENTS: IndustryAgent[] = [
  {
    id: 'clinic',
    name: 'Clinic Agent',
    industry: 'Healthcare',
    description: 'Automated patient scheduling, triage, and FAQs for medical clinics.',
    icon: <ClinicIcon />,
    features: ['Appointment Booking', 'Symptom Triage', 'Patient FAQs', 'Prescription Refills'],
    demoAvailable: true
  },
  {
    id: 'construction',
    name: 'Construction Agent',
    industry: 'Construction',
    description: 'Project management, safety compliance, and resource allocation assistant.',
    icon: <ConstructionIcon />,
    features: ['Project Tracking', 'Safety Checklists', 'Resource Management', 'Daily Reports'],
    demoAvailable: true
  },
  {
    id: 'dealership',
    name: 'Dealership Agent',
    industry: 'Automotive',
    description: 'Vehicle inventory, test drive scheduling, and service appointments.',
    icon: <DealershipIcon />,
    features: ['Inventory Search', 'Test Drive Booking', 'Service Scheduling', 'Financing Calc'],
    demoAvailable: true
  },
  {
    id: 'restaurant',
    name: 'Restaurant Agent',
    industry: 'Hospitality',
    description: 'Table reservations, menu inquiries, and order management.',
    icon: <RestaurantIcon />,
    features: ['Table Reservations', 'Menu Q&A', 'Order Taking', 'Event Booking'],
    demoAvailable: true
  },
  {
    id: 'salon',
    name: 'Salon Agent',
    industry: 'Beauty & Wellness',
    description: 'Appointment booking, stylist selection, and service consultations.',
    icon: <SalonIcon />,
    features: ['Appointment Booking', 'Stylist Selection', 'Service Menu', 'Reminders'],
    demoAvailable: true
  }
];
