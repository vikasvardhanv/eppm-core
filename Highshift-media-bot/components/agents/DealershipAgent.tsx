import React, { useState, useRef, useEffect } from 'react';
import { DEALERSHIP_VEHICLES, DealershipIcon } from '../../constants';
import { generateAgentResponse } from '../../services/geminiService';

interface DealershipAgentProps {
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

interface TestDrive {
  id: string;
  vehicle: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const DealershipAgent: React.FC<DealershipAgentProps> = ({ onBack, onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Welcome to Highshift Auto! 🚗 I'm your AI sales assistant. I can help you with:\n\n• Browsing our vehicle inventory\n• Scheduling test drives\n• Answering questions about features & specs\n• Financing options\n• Trade-in valuations\n\nWhat are you looking for today?",
      timestamp: new Date(),
      actions: [
        { label: 'Browse Inventory', action: 'browse_inventory' },
        { label: 'Schedule Test Drive', action: 'schedule_test_drive' },
        { label: 'Financing Options', action: 'financing' },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [currentTestDrive, setCurrentTestDrive] = useState<Partial<TestDrive>>({});
  const [bookingStep, setBookingStep] = useState<'idle' | 'vehicle' | 'date' | 'time' | 'info'>('idle');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const handleAction = async (action: string, data?: any) => {
    switch (action) {
      case 'browse_inventory':
        addMessage('bot', "🚙 Let me show you what we have! What type of vehicle interests you?", [
          { label: 'All Vehicles', action: 'filter_vehicles', data: 'all' },
          { label: 'SUVs', action: 'filter_vehicles', data: 'SUV' },
          { label: 'Sedans', action: 'filter_vehicles', data: 'Sedan' },
          { label: 'Trucks', action: 'filter_vehicles', data: 'Truck' },
          { label: 'Electric', action: 'filter_vehicles', data: 'Electric' },
        ]);
        break;

      case 'filter_vehicles':
        setSelectedFilter(data);
        const filtered = data === 'all' 
          ? DEALERSHIP_VEHICLES 
          : DEALERSHIP_VEHICLES.filter(v => v.type.toLowerCase().includes(data.toLowerCase()));
        
        let vehicleList = `🚗 **${data === 'all' ? 'Our Full' : data} Inventory**\n\n`;
        filtered.forEach(v => {
          vehicleList += `**${v.year} ${v.make} ${v.model}**\n`;
          vehicleList += `• Type: ${v.type}\n`;
          vehicleList += `• Price: ${formatPrice(v.price)}\n`;
          vehicleList += `• Status: ${v.available ? '✅ Available' : '⏳ Coming Soon'}\n\n`;
        });
        vehicleList += "Interested in any of these?";
        addMessage('bot', vehicleList, filtered.filter(v => v.available).map(v => ({
          label: `View ${v.make} ${v.model}`,
          action: 'view_vehicle',
          data: v
        })));
        break;

      case 'view_vehicle':
        const vehicle = data;
        addMessage('bot', `🚙 **${vehicle.year} ${vehicle.make} ${vehicle.model}**\n\n**Overview:**\n• Type: ${vehicle.type}\n• Year: ${vehicle.year}\n• Price: ${formatPrice(vehicle.price)}\n• Availability: ${vehicle.available ? '✅ In Stock' : '⏳ On Order'}\n\n**Key Features:**\n• Advanced Safety Package\n• Premium Sound System\n• Apple CarPlay / Android Auto\n• Heated Seats\n• Backup Camera\n\n**Estimated Payment:** ~$${Math.round(vehicle.price / 72)}/mo (72 months, 0% down)\n\nWould you like to schedule a test drive?`, [
          { label: 'Schedule Test Drive', action: 'start_test_drive', data: vehicle },
          { label: 'Get Quote', action: 'get_quote', data: vehicle },
          { label: 'Compare Models', action: 'browse_inventory' },
        ]);
        break;

      case 'schedule_test_drive':
      case 'start_test_drive':
        if (data) {
          setCurrentTestDrive({ vehicle: `${data.year} ${data.make} ${data.model}` });
          setBookingStep('date');
          const dates = ['Today', 'Tomorrow', 'This Saturday', 'Next Week'];
          addMessage('bot', `Great choice! Let's schedule your test drive for the **${data.year} ${data.make} ${data.model}**! 🎉\n\nWhen would you like to come in?`,
            dates.map(d => ({
              label: d,
              action: 'select_date',
              data: d
            }))
          );
        } else {
          setBookingStep('vehicle');
          addMessage('bot', "Which vehicle would you like to test drive?",
            DEALERSHIP_VEHICLES.filter(v => v.available).map(v => ({
              label: `${v.year} ${v.make} ${v.model}`,
              action: 'start_test_drive',
              data: v
            }))
          );
        }
        break;

      case 'select_date':
        setCurrentTestDrive(prev => ({ ...prev, date: data }));
        setBookingStep('time');
        const times = ['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
        addMessage('bot', `${data} works! What time is best for you?`,
          times.map(t => ({
            label: t,
            action: 'select_time',
            data: t
          }))
        );
        break;

      case 'select_time':
        setCurrentTestDrive(prev => ({ ...prev, time: data }));
        setBookingStep('info');
        addMessage('bot', `Perfect! Your test drive is almost booked.\n\n**Vehicle:** ${currentTestDrive.vehicle}\n**Date:** ${currentTestDrive.date}\n**Time:** ${data}\n\nPlease provide your:\n• Name\n• Phone number\n• Email address`);
        break;

      case 'confirm_test_drive':
        const newTestDrive: TestDrive = {
          id: Date.now().toString(),
          vehicle: currentTestDrive.vehicle || '',
          date: currentTestDrive.date || '',
          time: currentTestDrive.time || '',
          customerName: data.name,
          customerPhone: data.phone,
          customerEmail: data.email,
          status: 'scheduled'
        };
        setTestDrives(prev => [...prev, newTestDrive]);
        setBookingStep('idle');
        setCurrentTestDrive({});
        addMessage('bot', `🎉 **Test Drive Confirmed!**\n\n**Details:**\n• Vehicle: ${newTestDrive.vehicle}\n• Date: ${newTestDrive.date} at ${newTestDrive.time}\n• Name: ${newTestDrive.customerName}\n\n📧 Confirmation sent to ${newTestDrive.customerEmail}\n📱 Reminder will be sent to ${newTestDrive.customerPhone}\n\n**What to Bring:**\n• Valid driver's license\n• Proof of insurance\n\nWe look forward to seeing you! 🚗`, [
          { label: 'Browse More Vehicles', action: 'browse_inventory' },
          { label: 'Financing Info', action: 'financing' },
        ]);
        break;

      case 'financing':
        addMessage('bot', "💰 **Financing Options**\n\n**Current Offers:**\n• 0% APR for 60 months (qualified buyers)\n• $1,000 trade-in bonus\n• First-time buyer program available\n• Military & first responder discounts\n\n**Credit Options:**\n• Excellent Credit: 2.9% APR\n• Good Credit: 4.9% APR\n• Fair Credit: We work with all credit!\n\n**Tools:**\n• Pre-approval in 60 seconds\n• No impact on credit score\n• Instant trade-in value estimate\n\nWant me to help you get pre-approved?", [
          { label: 'Get Pre-Approved', action: 'pre_approval' },
          { label: 'Trade-In Value', action: 'trade_in' },
          { label: 'Browse Vehicles', action: 'browse_inventory' },
        ]);
        break;

      case 'trade_in':
        addMessage('bot', "🔄 **Trade-In Valuation**\n\nTo get an instant estimate, please tell me about your current vehicle:\n\n• Year, Make, Model\n• Approximate mileage\n• Overall condition (Excellent/Good/Fair)\n\nExample: '2018 Honda Civic, 45,000 miles, Good condition'\n\nOur valuations are competitive and we'll match any legitimate offer!");
        break;

      case 'pre_approval':
        addMessage('bot', "📋 **Quick Pre-Approval**\n\nThis won't affect your credit score!\n\nTo get started, I'll need:\n• Full name\n• Phone number\n• Email address\n• Estimated credit score range\n\nOr visit our financing center in person for immediate assistance.", [
          { label: 'Contact Finance Team', action: 'contact' },
          { label: 'Browse Vehicles', action: 'browse_inventory' },
        ]);
        break;

      case 'contact':
        addMessage('bot', "📞 **Contact Us**\n\n• Sales: (555) 123-AUTO\n• Service: (555) 123-SERV\n• Email: sales@highshiftauto.com\n\n**Hours:**\n• Mon-Fri: 9AM - 8PM\n• Saturday: 9AM - 6PM\n• Sunday: 11AM - 5PM\n\n📍 123 Highshift Drive, Auto City", [
          { label: 'Browse Inventory', action: 'browse_inventory' },
          { label: 'Schedule Test Drive', action: 'schedule_test_drive' },
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

    if (bookingStep === 'info') {
      const emailMatch = userMessage.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      const phoneMatch = userMessage.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
      const name = userMessage.split('\n')[0]?.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/, '').replace(/\d{3}[-.]?\d{3}[-.]?\d{4}/, '').trim() || 'Customer';
      
      handleAction('confirm_test_drive', {
        name: name || 'Customer',
        phone: phoneMatch?.[0] || '(555) 000-0000',
        email: emailMatch?.[0] || 'customer@email.com'
      });
      return;
    }

    setIsLoading(true);

    try {
      const context = `You are an AI sales assistant for Highshift Auto dealership.
      Inventory: ${DEALERSHIP_VEHICLES.map(v => `${v.year} ${v.make} ${v.model} (${v.type}, ${formatPrice(v.price)})`).join(', ')}
      Help with: vehicle inquiries, test drives, financing, trade-ins, and features.
      Be enthusiastic, knowledgeable, and helpful. Use car emojis!`;
      
      const response = await generateAgentResponse('dealership', userMessage, context);
      addMessage('bot', response, [
        { label: 'Browse Inventory', action: 'browse_inventory' },
        { label: 'Schedule Test Drive', action: 'schedule_test_drive' },
      ]);
    } catch (error) {
      addMessage('bot', "I'd be happy to help! Here are some quick options:", [
        { label: 'Browse Inventory', action: 'browse_inventory' },
        { label: 'Schedule Test Drive', action: 'schedule_test_drive' },
        { label: 'Financing Options', action: 'financing' },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] max-h-[900px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <DealershipIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Auto Dealership AI Agent</h2>
              <p className="text-[11px] font-bold text-blue-400/80 uppercase tracking-widest">Sales & Test Drives Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {testDrives.length > 0 && (
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-medium">
                {testDrives.length} Test Drive{testDrives.length > 1 ? 's' : ''} Scheduled
              </span>
            )}
            <button onClick={onBack} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Back</button>
            <button onClick={onRestart} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Home</button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500/20 border border-blue-400/30 rounded-2xl rounded-br-none' : 'glass-panel rounded-2xl rounded-bl-none border-white/10'} px-5 py-3`}>
                <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action.action, action.data)}
                        className="bg-blue-500/20 text-blue-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition"
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
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
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
              placeholder={bookingStep === 'info' ? "Enter your name, phone, and email..." : "Ask about vehicles, pricing, financing, or schedule a test drive..."}
              disabled={isLoading}
              className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-500 text-white rounded-xl p-3 hover:bg-blue-400 transition-all disabled:bg-white/10 disabled:text-white/20"
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
