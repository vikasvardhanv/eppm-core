
import React from 'react';
import type { Service } from '../types';
import { SERVICES, BrandLogo, TikTokIcon, FacebookIcon, InstagramIcon, YoutubeIcon, XIcon, WhatsAppIcon } from '../constants';

interface ServiceSelectionProps {
  onSelect: (service: Service) => void;
}

const ServiceCard: React.FC<{ service: Service; onClick: () => void }> = ({ service, onClick }) => (
  <button
    onClick={onClick}
    className="glass-card p-6 rounded-2xl text-left w-full h-full flex flex-col group overflow-hidden relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {service.icon}
      </div>
      <h3 className="font-bold text-lg text-white mb-2">{service.name}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
    </div>
  </button>
);

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    aria-label={label}
    className="text-white/40 hover:text-sky-400 transition-all duration-300 p-2 hover:bg-white/5 rounded-full"
  >
    {icon}
  </a>
);

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 relative">
      {/* Floating WhatsApp FAB */}
      <a 
        href="https://Wa.me/+16307033569" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center gap-3"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold">Chat on WhatsApp</span>
        <WhatsAppIcon />
      </a>

      <div className="text-center mb-16 max-w-4xl flex flex-col items-center">
        <div className="relative mb-10 group">
            <div className="absolute inset-0 bg-sky-500 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <BrandLogo className="h-40 w-40 sm:h-48 sm:w-48 relative z-10 drop-shadow-2xl transition-transform hover:scale-105 duration-700 ease-out" />
        </div>
        
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter liquid-text mb-4">
          Highshift Media
        </h1>
        <p className="text-xl sm:text-2xl text-white/70 font-light tracking-wide max-w-2xl">
          The next era of intelligence. Fluid, fast, and bespoke.
        </p>
         <p className="mt-6 text-sm text-sky-400/60 uppercase tracking-[0.2em] font-bold">
          Choose Your Path
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl w-full px-4">
        {SERVICES.map((service) => (
            <div 
              key={service.id} 
              className={`${service.id === 'snake' || service.id === 'voice_agent' ? 'xl:col-span-2' : ''} h-full`}
            >
                <ServiceCard service={service} onClick={() => onSelect(service)} />
            </div>
        ))}
      </div>
      
       <footer className="w-full text-center mt-20 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <SocialLink href="https://www.tiktok.com/@highshiftmedia?is_from_webapp=1&sender_device=pc" icon={<TikTokIcon />} label="TikTok" />
            <SocialLink href="https://www.facebook.com/profile.php?id=61582587125978" icon={<FacebookIcon />} label="Facebook" />
            <SocialLink href="https://www.instagram.com/highshift_media/" icon={<InstagramIcon />} label="Instagram" />
            <SocialLink href="https://www.youtube.com/@highshiftmedia" icon={<YoutubeIcon />} label="YouTube" />
            <SocialLink href="https://x.com/Highshiftmedia" icon={<XIcon />} label="X" />
        </div>
        <p className="text-xs font-medium tracking-widest text-white/30 uppercase">
          &copy; {new Date().getFullYear()} Highshift Media &bull; Artificial Intelligence Bureau
        </p>
      </footer>
    </div>
  );
};
