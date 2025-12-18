import React from 'react';
import { BrandLogo, INDUSTRY_AGENTS } from '../constants';
import type { IndustryAgent } from '../types';

interface IndustryAgentHubProps {
  onSelectAgent: (agentId: string) => void;
  onRestart: () => void;
}

const AgentCard: React.FC<{ agent: IndustryAgent; onClick: () => void }> = ({ agent, onClick }) => (
  <button
    onClick={onClick}
    className="glass-card p-6 rounded-2xl text-left w-full h-full flex flex-col group overflow-hidden relative hover:scale-[1.02] transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {agent.icon}
      </div>
      <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">{agent.industry}</span>
      <h3 className="font-bold text-lg text-white mb-2">{agent.name}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{agent.description}</p>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        {agent.features.slice(0, 3).map((feature, idx) => (
          <span key={idx} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-full border border-white/10">
            {feature}
          </span>
        ))}
        {agent.features.length > 3 && (
          <span className="text-xs text-white/40">+{agent.features.length - 3} more</span>
        )}
      </div>
      
      {agent.demoAvailable && (
        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Live Demo Available</span>
        </div>
      )}
    </div>
  </button>
);

export const IndustryAgentHub: React.FC<IndustryAgentHubProps> = ({ onSelectAgent, onRestart }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-6 sm:p-10 lg:p-16 relative">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-12 w-12" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Industry AI Agents</h1>
              <p className="text-sm text-white/50">Pre-built solutions for every business</p>
            </div>
          </div>
          <button 
            onClick={onRestart}
            className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Description */}
        <div className="glass-panel rounded-2xl p-8 mb-12 border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Intelligent Automation for Every Industry</h2>
          <p className="text-white/60 leading-relaxed">
            Our AI agents are purpose-built for specific industries, handling everything from customer inquiries 
            and appointment booking to order management and reporting. Each agent integrates seamlessly with 
            your existing systems and can be customized to match your brand.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-400">24/7</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">95%</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Query Resolution</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">60%</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">&lt;2min</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Response Time</div>
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRY_AGENTS.map((agent) => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onClick={() => onSelectAgent(agent.id)} 
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-white/40 mb-4">Don't see your industry? We build custom agents too.</p>
          <a 
            href="mailto:info@highshiftmedia.com?subject=Custom AI Agent Inquiry"
            className="inline-flex items-center gap-2 bg-sky-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-sky-400 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact Us for Custom Solutions
          </a>
        </div>
      </div>

      <footer className="w-full text-center mt-20 p-4 text-xs font-medium tracking-widest text-white/30 uppercase">
        &copy; {new Date().getFullYear()} Highshift Media &bull; Industry AI Agents
      </footer>
    </div>
  );
};
