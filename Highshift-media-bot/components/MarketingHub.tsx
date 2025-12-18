import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo, MarketingHubIcon, EmailIcon, SocialMediaIcon } from '../constants';
import { generateMarketingContent, generateEmailCampaign } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarketingHubProps {
  onRestart: () => void;
}

type TabType = 'overview' | 'content' | 'social' | 'email';

interface ContentItem {
  id: string;
  type: string;
  platform: string;
  content: string;
  createdAt: Date;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduledTime: Date;
  status: 'scheduled' | 'published' | 'failed';
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: '📘' },
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '📸' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
  { id: 'twitter', name: 'X (Twitter)', color: 'bg-black', icon: '🐦' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600', icon: '▶️' },
];

export const MarketingHub: React.FC<MarketingHubProps> = ({ onRestart }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [emailCampaign, setEmailCampaign] = useState<string | null>(null);

  // Content Generation Form
  const [contentTopic, setContentTopic] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [contentTone, setContentTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('');

  // Email Campaign Form
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [emailAudience, setEmailAudience] = useState('');

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTopic.trim() || !selectedPlatform) return;

    setIsLoading(true);
    try {
      const content = await generateMarketingContent('social_post', {
        platform: selectedPlatform,
        topic: contentTopic,
        tone: contentTone,
        targetAudience: targetAudience || 'general audience',
      });

      const newContent: ContentItem = {
        id: Date.now().toString(),
        type: 'social_post',
        platform: selectedPlatform,
        content,
        createdAt: new Date(),
      };

      setGeneratedContent(prev => [newContent, ...prev]);
      setContentTopic('');
    } catch (error) {
      console.error('Error generating content:', error);
    }
    setIsLoading(false);
  };

  const handleSchedulePost = (content: ContentItem) => {
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platform: content.platform,
      content: content.content,
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'scheduled',
    };
    setScheduledPosts(prev => [...prev, newPost]);
  };

  const handleGenerateEmailCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !campaignGoal.trim()) return;

    setIsLoading(true);
    try {
      const campaign = await generateEmailCampaign({
        businessName,
        industry: industry || 'General',
        campaignGoal,
        targetAudience: emailAudience || 'potential customers',
        numberOfEmails: 3,
      });
      setEmailCampaign(campaign);
    } catch (error) {
      console.error('Error generating email campaign:', error);
      setEmailCampaign('Failed to generate email campaign. Please try again.');
    }
    setIsLoading(false);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border-white/5">
          <div className="text-3xl font-bold text-sky-400">{generatedContent.length}</div>
          <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Content Created</div>
        </div>
        <div className="glass-panel rounded-xl p-4 border-white/5">
          <div className="text-3xl font-bold text-emerald-400">{scheduledPosts.length}</div>
          <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Scheduled Posts</div>
        </div>
        <div className="glass-panel rounded-xl p-4 border-white/5">
          <div className="text-3xl font-bold text-purple-400">6</div>
          <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Platforms</div>
        </div>
        <div className="glass-panel rounded-xl p-4 border-white/5">
          <div className="text-3xl font-bold text-orange-400">24/7</div>
          <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Automation</div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('content')}
          className="glass-panel rounded-xl p-6 border-white/5 text-left group hover:border-sky-500/30 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 rounded-lg bg-sky-500/20 group-hover:bg-sky-500/30 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">AI Content Generator</h3>
          </div>
          <p className="text-white/50 text-sm">Generate engaging posts, captions, and copy for any platform using AI.</p>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className="glass-panel rounded-xl p-6 border-white/5 text-left group hover:border-indigo-500/30 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition">
              <SocialMediaIcon />
            </div>
            <h3 className="text-lg font-bold text-white">Social Scheduler</h3>
          </div>
          <p className="text-white/50 text-sm">Schedule and automate posts across Facebook, Instagram, LinkedIn, X, TikTok, and YouTube.</p>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className="glass-panel rounded-xl p-6 border-white/5 text-left group hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition">
              <EmailIcon />
            </div>
            <h3 className="text-lg font-bold text-white">Email Campaigns</h3>
          </div>
          <p className="text-white/50 text-sm">Create personalized email sequences that nurture leads and drive conversions.</p>
        </button>

        <div className="glass-panel rounded-xl p-6 border-white/5 text-left group">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Analytics (Coming Soon)</h3>
          </div>
          <p className="text-white/50 text-sm">Track performance, engagement, and ROI across all your marketing channels.</p>
        </div>
      </div>

      {/* Recent Activity */}
      {(generatedContent.length > 0 || scheduledPosts.length > 0) && (
        <div className="glass-panel rounded-xl p-6 border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {generatedContent.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <span className="text-2xl">{PLATFORMS.find(p => p.id === item.platform)?.icon || '📝'}</span>
                <span className="text-white/70 flex-1 truncate">{item.content.slice(0, 50)}...</span>
                <span className="text-white/30 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContentGenerator = () => (
    <div className="space-y-6">
      <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Overview
      </button>

      <div className="glass-panel rounded-xl p-6 border-white/5">
        <h3 className="text-xl font-bold text-white mb-6">AI Content Generator</h3>
        
        <form onSubmit={handleGenerateContent} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">What do you want to post about?</label>
            <input
              type="text"
              value={contentTopic}
              onChange={(e) => setContentTopic(e.target.value)}
              placeholder="e.g., New product launch, holiday sale, industry tips..."
              className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Select Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPlatform === platform.id
                      ? 'bg-sky-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {platform.icon} {platform.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Tone</label>
              <select
                value={contentTone}
                onChange={(e) => setContentTone(e.target.value)}
                className="w-full bg-white/5 text-white rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual & Friendly</option>
                <option value="humorous">Humorous</option>
                <option value="inspirational">Inspirational</option>
                <option value="urgent">Urgent/Action-oriented</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., small business owners"
                className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !contentTopic.trim() || !selectedPlatform}
            className="w-full bg-sky-500 text-white font-bold py-3 rounded-xl hover:bg-sky-400 transition disabled:bg-white/10 disabled:text-white/30"
          >
            {isLoading ? 'Generating...' : '✨ Generate Content'}
          </button>
        </form>
      </div>

      {/* Generated Content */}
      {generatedContent.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white">Generated Content</h4>
          {generatedContent.map(item => (
            <div key={item.id} className="glass-panel rounded-xl p-4 border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm text-white/60">
                  {PLATFORMS.find(p => p.id === item.platform)?.icon} {PLATFORMS.find(p => p.id === item.platform)?.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(item.content)}
                    className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-lg hover:bg-white/20 transition"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleSchedulePost(item)}
                    className="text-xs bg-sky-500/20 text-sky-400 px-3 py-1 rounded-lg hover:bg-sky-500/30 transition"
                  >
                    Schedule
                  </button>
                </div>
              </div>
              <p className="text-white/80 text-sm whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSocialScheduler = () => (
    <div className="space-y-6">
      <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Overview
      </button>

      <div className="glass-panel rounded-xl p-6 border-white/5">
        <h3 className="text-xl font-bold text-white mb-4">Social Media Scheduler</h3>
        <p className="text-white/50 mb-6">Automatically post content across all your social channels.</p>

        {/* Connected Platforms */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {PLATFORMS.map(platform => (
            <div key={platform.id} className="glass-panel rounded-xl p-4 border-white/5 flex items-center gap-3">
              <span className="text-2xl">{platform.icon}</span>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{platform.name}</div>
                <div className="text-emerald-400 text-xs">Connected</div>
              </div>
              <span className="h-2 w-2 bg-emerald-400 rounded-full"></span>
            </div>
          ))}
        </div>

        {/* Scheduled Posts */}
        <h4 className="text-lg font-bold text-white mb-4">Scheduled Posts</h4>
        {scheduledPosts.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <p>No scheduled posts yet.</p>
            <button
              onClick={() => setActiveTab('content')}
              className="mt-4 text-sky-400 hover:text-sky-300 text-sm"
            >
              Generate content to schedule →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledPosts.map(post => (
              <div key={post.id} className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
                <span className="text-2xl">{PLATFORMS.find(p => p.id === post.platform)?.icon}</span>
                <div className="flex-1">
                  <p className="text-white/80 text-sm truncate">{post.content.slice(0, 60)}...</p>
                  <p className="text-white/40 text-xs mt-1">
                    Scheduled: {post.scheduledTime.toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  post.status === 'scheduled' ? 'bg-sky-500/20 text-sky-400' :
                  post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderEmailCampaigns = () => (
    <div className="space-y-6">
      <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Overview
      </button>

      {!emailCampaign ? (
        <div className="glass-panel rounded-xl p-6 border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">AI Email Campaign Generator</h3>
          
          <form onSubmit={handleGenerateEmailCampaign} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your company name"
                  className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., E-commerce, SaaS, Healthcare"
                  className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Campaign Goal</label>
              <select
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
                className="w-full bg-white/5 text-white rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="">Select a goal...</option>
                <option value="welcome_sequence">Welcome New Subscribers</option>
                <option value="product_launch">Product Launch Promotion</option>
                <option value="nurture_leads">Nurture & Educate Leads</option>
                <option value="re_engagement">Re-engage Inactive Users</option>
                <option value="sales_promotion">Sales & Discount Promotion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Target Audience</label>
              <input
                type="text"
                value={emailAudience}
                onChange={(e) => setEmailAudience(e.target.value)}
                placeholder="e.g., new subscribers, past customers, leads"
                className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !businessName.trim() || !campaignGoal}
              className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-400 transition disabled:bg-white/10 disabled:text-white/30"
            >
              {isLoading ? 'Generating Campaign...' : '📧 Generate Email Campaign'}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-6 border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Your Email Campaign</h3>
            <button
              onClick={() => setEmailCampaign(null)}
              className="text-sm bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition"
            >
              Create New Campaign
            </button>
          </div>
          <div className="prose prose-invert prose-purple max-w-none overflow-auto max-h-[60vh]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{emailCampaign}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'content':
        return renderContentGenerator();
      case 'social':
        return renderSocialScheduler();
      case 'email':
        return renderEmailCampaigns();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] max-h-[900px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-rose-500/10 to-purple-500/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-rose-500/20">
              <MarketingHubIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Marketing & Automation Hub</h2>
              <p className="text-[11px] font-bold text-rose-400/80 uppercase tracking-widest">Content • Social • Email</p>
            </div>
          </div>
          <button onClick={onRestart} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">
            Back to Home
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
