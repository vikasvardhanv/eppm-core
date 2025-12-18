import React, { useState, useRef, useEffect } from 'react';
import { ConstructionIcon } from '../../constants';
import { generateAgentResponse } from '../../services/geminiService';

interface ConstructionAgentProps {
  onBack: () => void;
  onRestart: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  actions?: { label: string; action: string; data?: any }[];
}

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'delayed' | 'completed';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  tasks: { name: string; status: string; dueDate: string }[];
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Downtown Office Complex',
    status: 'in-progress',
    progress: 65,
    budget: 12500000,
    spent: 7800000,
    startDate: '2024-06-01',
    endDate: '2025-08-30',
    tasks: [
      { name: 'Foundation Work', status: 'completed', dueDate: '2024-09-01' },
      { name: 'Structural Frame', status: 'completed', dueDate: '2024-11-15' },
      { name: 'Electrical Rough-In', status: 'in-progress', dueDate: '2025-01-30' },
      { name: 'HVAC Installation', status: 'pending', dueDate: '2025-03-15' },
    ]
  },
  {
    id: 'p2',
    name: 'Residential Development Phase 2',
    status: 'planning',
    progress: 15,
    budget: 8000000,
    spent: 450000,
    startDate: '2025-02-01',
    endDate: '2026-01-31',
    tasks: [
      { name: 'Site Survey', status: 'completed', dueDate: '2024-12-15' },
      { name: 'Permit Applications', status: 'in-progress', dueDate: '2025-01-20' },
      { name: 'Material Procurement', status: 'pending', dueDate: '2025-02-28' },
    ]
  },
];

export const ConstructionAgent: React.FC<ConstructionAgentProps> = ({ onBack, onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Welcome to Highshift Construction Command Center! 🏗️ I'm your AI project assistant. I can help you with:\n\n• Project scheduling & planning\n• Progress tracking & reporting\n• Cost estimation & budget analysis\n• Safety compliance monitoring\n• Resource allocation\n• Document management\n\nWhat would you like to work on?",
      timestamp: new Date(),
      actions: [
        { label: 'View Projects', action: 'view_projects' },
        { label: 'Generate Report', action: 'generate_report' },
        { label: 'Safety Dashboard', action: 'safety_dashboard' },
        { label: 'Cost Estimator', action: 'cost_estimator' },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender: 'user' | 'bot', text: string, actions?: Message['actions']) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
      actions
    }]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      case 'delayed': return '⚠️';
      case 'planning': return '📋';
      default: return '•';
    }
  };

  const handleAction = async (action: string, data?: any) => {
    switch (action) {
      case 'view_projects':
        let projectsList = "📊 **Active Projects Overview**\n\n";
        SAMPLE_PROJECTS.forEach(project => {
          projectsList += `**${project.name}**\n`;
          projectsList += `${getStatusEmoji(project.status)} Status: ${project.status.replace('-', ' ').toUpperCase()}\n`;
          projectsList += `📈 Progress: ${project.progress}%\n`;
          projectsList += `💰 Budget: ${formatCurrency(project.budget)} (${formatCurrency(project.spent)} spent)\n\n`;
        });
        addMessage('bot', projectsList, SAMPLE_PROJECTS.map(p => ({
          label: `View ${p.name.split(' ')[0]}`,
          action: 'view_project_detail',
          data: p
        })));
        break;

      case 'view_project_detail':
        const project = data as Project;
        setSelectedProject(project);
        const budgetRemaining = project.budget - project.spent;
        const onBudget = budgetRemaining > 0;
        
        let detailText = `🏗️ **${project.name}**\n\n`;
        detailText += `**Project Status**\n`;
        detailText += `• Status: ${getStatusEmoji(project.status)} ${project.status.replace('-', ' ').toUpperCase()}\n`;
        detailText += `• Progress: ${project.progress}% complete\n`;
        detailText += `• Timeline: ${project.startDate} to ${project.endDate}\n\n`;
        detailText += `**Budget Analysis**\n`;
        detailText += `• Total Budget: ${formatCurrency(project.budget)}\n`;
        detailText += `• Spent: ${formatCurrency(project.spent)}\n`;
        detailText += `• Remaining: ${formatCurrency(budgetRemaining)} ${onBudget ? '✅' : '⚠️'}\n\n`;
        detailText += `**Key Tasks**\n`;
        project.tasks.forEach(task => {
          detailText += `${getStatusEmoji(task.status)} ${task.name} (Due: ${task.dueDate})\n`;
        });
        
        addMessage('bot', detailText, [
          { label: 'Schedule Analysis', action: 'schedule_analysis', data: project },
          { label: 'Cost Breakdown', action: 'cost_breakdown', data: project },
          { label: 'Generate Report', action: 'generate_project_report', data: project },
          { label: 'Back to Projects', action: 'view_projects' },
        ]);
        break;

      case 'schedule_analysis':
        const proj = data as Project;
        addMessage('bot', `📅 **Schedule Analysis: ${proj.name}**\n\n**Critical Path Items:**\n• Electrical Rough-In → HVAC Installation → Interior Finishing\n• Any delay in electrical work will impact HVAC by 2 weeks\n\n**Schedule Health:**\n• Current Status: ${proj.progress}% complete\n• Expected: 68% at this date\n• Variance: ${proj.progress - 68}% ${proj.progress >= 68 ? '(Ahead)' : '(Behind)'}\n\n**Risk Factors:**\n• Material delivery delays: Medium Risk\n• Weather impacts: Low Risk\n• Labor availability: Low Risk\n\n**Recommendations:**\n1. Expedite electrical contractor schedule\n2. Pre-order HVAC equipment to avoid delays\n3. Consider adding weekend shifts to catch up`, [
          { label: 'Simulate Delay', action: 'simulate_delay', data: proj },
          { label: 'View Milestones', action: 'view_milestones', data: proj },
          { label: 'Back to Project', action: 'view_project_detail', data: proj },
        ]);
        break;

      case 'cost_breakdown':
        const p = data as Project;
        addMessage('bot', `💰 **Cost Breakdown: ${p.name}**\n\n**Category Spending:**\n• Labor: ${formatCurrency(p.spent * 0.4)} (40%)\n• Materials: ${formatCurrency(p.spent * 0.35)} (35%)\n• Equipment: ${formatCurrency(p.spent * 0.15)} (15%)\n• Permits & Fees: ${formatCurrency(p.spent * 0.05)} (5%)\n• Contingency: ${formatCurrency(p.spent * 0.05)} (5%)\n\n**Budget Status:**\n• Budget Utilization: ${Math.round((p.spent / p.budget) * 100)}%\n• Projected Final Cost: ${formatCurrency(p.budget * 1.02)}\n• Variance: +2% (within acceptable range)\n\n**Cost Alerts:**\n⚠️ Material costs trending 5% above estimate\n✅ Labor costs on track\n✅ Equipment rental under budget`, [
          { label: 'Export Report', action: 'export_cost_report', data: p },
          { label: 'Back to Project', action: 'view_project_detail', data: p },
        ]);
        break;

      case 'safety_dashboard':
        addMessage('bot', `🦺 **Safety Dashboard**\n\n**Current Safety Score: 94/100** ✅\n\n**Recent Inspections:**\n• Site A (Downtown): ✅ Passed (Dec 15)\n• Site B (Residential): ✅ Passed (Dec 12)\n\n**Active Safety Alerts:**\n⚠️ Hard hat compliance needed in Zone 3\n⚠️ Equipment certification due in 5 days\n\n**Statistics (Last 30 Days):**\n• Days Without Incident: 47\n• Near Misses Reported: 2\n• Safety Training Completed: 15 sessions\n\n**Upcoming:**\n• Monthly safety drill: Dec 20\n• Equipment inspection: Dec 22`, [
          { label: 'Report Incident', action: 'report_incident' },
          { label: 'Schedule Inspection', action: 'schedule_inspection' },
          { label: 'Training Records', action: 'training_records' },
        ]);
        break;

      case 'cost_estimator':
        addMessage('bot', "🧮 **AI Cost Estimator**\n\nI can help you estimate project costs! Please provide:\n\n• Project type (residential, commercial, industrial)\n• Approximate square footage\n• Location/region\n• Special requirements\n\nOr describe your project and I'll provide a preliminary estimate.\n\n_Example: \"2-story commercial office building, 15,000 sq ft, downtown area\"_");
        break;

      case 'generate_report':
        addMessage('bot', "📑 **Report Generator**\n\nWhat type of report would you like to generate?", [
          { label: 'Weekly Progress', action: 'report_weekly' },
          { label: 'Budget Summary', action: 'report_budget' },
          { label: 'Safety Report', action: 'report_safety' },
          { label: 'Executive Summary', action: 'report_executive' },
        ]);
        break;

      case 'report_executive':
        addMessage('bot', `📊 **Executive Summary Report**\n_Generated: ${new Date().toLocaleDateString()}_\n\n**Portfolio Overview:**\n• Active Projects: 2\n• Total Budget: ${formatCurrency(20500000)}\n• Total Spent: ${formatCurrency(8250000)}\n• Overall Progress: 45%\n\n**Key Highlights:**\n✅ Downtown Office Complex on schedule\n✅ Safety record: 47 days incident-free\n⚠️ Residential Phase 2 permits pending\n\n**Financial Summary:**\n• YTD Revenue: ${formatCurrency(15200000)}\n• YTD Expenses: ${formatCurrency(8250000)}\n• Projected Margin: 18%\n\n**Action Items:**\n1. Expedite residential permit approvals\n2. Review Q1 material pricing contracts\n3. Schedule quarterly safety review\n\n_Report ID: EXE-2024-1217_`, [
          { label: 'Export as PDF', action: 'export_pdf' },
          { label: 'Email Report', action: 'email_report' },
          { label: 'View Projects', action: 'view_projects' },
        ]);
        break;

      case 'export_pdf':
      case 'email_report':
        addMessage('bot', "✅ Report has been prepared! In a production environment, this would:\n\n• Generate a formatted PDF document\n• Include charts and visualizations\n• Send via email to specified recipients\n• Archive in document management system\n\nWould you like to do something else?", [
          { label: 'View Projects', action: 'view_projects' },
          { label: 'Safety Dashboard', action: 'safety_dashboard' },
        ]);
        break;

      default:
        break;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const context = `You are an AI assistant for Highshift Construction Management.
      Active projects: ${SAMPLE_PROJECTS.map(p => `${p.name} (${p.progress}% complete, ${p.status})`).join(', ')}
      Help with: project scheduling, cost estimation, safety monitoring, progress tracking, and construction management.
      Be professional, use construction terminology, and provide actionable insights.`;
      
      const response = await generateAgentResponse('construction', userMessage, context);
      addMessage('bot', response, [
        { label: 'View Projects', action: 'view_projects' },
        { label: 'Generate Report', action: 'generate_report' },
      ]);
    } catch (error) {
      addMessage('bot', "I can help you with that! Here are some options:", [
        { label: 'View Projects', action: 'view_projects' },
        { label: 'Cost Estimator', action: 'cost_estimator' },
        { label: 'Safety Dashboard', action: 'safety_dashboard' },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] max-h-[900px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <ConstructionIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Construction AI Agent</h2>
              <p className="text-[11px] font-bold text-yellow-400/80 uppercase tracking-widest">Project Management Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
              2 Active Projects
            </span>
            <button onClick={onBack} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Back</button>
            <button onClick={onRestart} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Home</button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] ${msg.sender === 'user' ? 'bg-yellow-500/20 border border-yellow-400/30 rounded-2xl rounded-br-none' : 'glass-panel rounded-2xl rounded-bl-none border-white/10'} px-5 py-3`}>
                <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action.action, action.data)}
                        className="bg-yellow-500/20 text-yellow-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-yellow-500/30 transition"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-panel rounded-xl px-4 py-2 border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-yellow-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-white/5">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about projects, schedules, costs, safety, or generate reports..."
              disabled={isLoading}
              className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-yellow-500 text-black rounded-xl p-3 hover:bg-yellow-400 transition-all disabled:bg-white/10 disabled:text-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
