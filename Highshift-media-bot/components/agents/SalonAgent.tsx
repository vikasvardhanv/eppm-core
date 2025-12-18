import React, { useState, useRef, useEffect } from 'react';
import { SALON_SERVICES, SalonIcon } from '../../constants';
import { generateAgentResponse } from '../../services/geminiService';

interface SalonAgentProps {
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

interface Booking {
  id: string;
  service: string;
  stylist: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  status: 'confirmed' | 'pending';
}

const STYLISTS = [
  { id: 'st1', name: 'Sarah', specialty: 'Hair Coloring', rating: 4.9 },
  { id: 'st2', name: 'Mike', specialty: 'Men\'s Cuts', rating: 4.8 },
  { id: 'st3', name: 'Emma', specialty: 'Styling & Updos', rating: 4.9 },
  { id: 'st4', name: 'Jessica', specialty: 'Nails & Spa', rating: 4.7 },
];

export const SalonAgent: React.FC<SalonAgentProps> = ({ onBack, onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Welcome to Highshift Salon & Spa! ✨ I'm your AI booking assistant. I can help you with:\n\n• Booking appointments\n• Viewing our services & prices\n• Checking stylist availability\n• Rescheduling appointments\n• Special offers\n\nHow may I pamper you today?",
      timestamp: new Date(),
      actions: [
        { label: 'Book Now', action: 'start_booking' },
        { label: 'View Services', action: 'view_services' },
        { label: 'Meet Our Team', action: 'view_stylists' },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Partial<Booking>>({});
  const [bookingStep, setBookingStep] = useState<'idle' | 'service' | 'stylist' | 'date' | 'time' | 'info'>('idle');
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

  const handleAction = async (action: string, data?: any) => {
    switch (action) {
      case 'view_services':
        let servicesText = "💅 **Our Services & Pricing**\n\n";
        SALON_SERVICES.forEach(service => {
          servicesText += `• **${service.name}** - $${service.price}\n  ⏱ ${service.duration} minutes\n`;
        });
        servicesText += "\nReady to book?";
        addMessage('bot', servicesText, [
          { label: 'Book Appointment', action: 'start_booking' },
          { label: 'View Stylists', action: 'view_stylists' },
        ]);
        break;

      case 'view_stylists':
        let stylistsText = "👩‍🎨 **Our Amazing Team**\n\n";
        STYLISTS.forEach(stylist => {
          stylistsText += `**${stylist.name}** ⭐ ${stylist.rating}\n`;
          stylistsText += `Specialty: ${stylist.specialty}\n\n`;
        });
        addMessage('bot', stylistsText, [
          { label: 'Book Appointment', action: 'start_booking' },
          { label: 'View Services', action: 'view_services' },
        ]);
        break;

      case 'start_booking':
        setBookingStep('service');
        addMessage('bot', "Let's get you booked! 📅\n\nFirst, what service would you like?",
          SALON_SERVICES.map(s => ({
            label: `${s.name} ($${s.price})`,
            action: 'select_service',
            data: s
          }))
        );
        break;

      case 'select_service':
        setCurrentBooking({ service: data.name });
        setBookingStep('stylist');
        addMessage('bot', `Great choice! **${data.name}** it is.\n\nNow, do you have a preferred stylist?`,
          [
            ...STYLISTS.map(s => ({
              label: `${s.name} (${s.specialty})`,
              action: 'select_stylist',
              data: s
            })),
            { label: 'No Preference', action: 'select_stylist', data: { name: 'Any Available' } }
          ]
        );
        break;

      case 'select_stylist':
        setCurrentBooking(prev => ({ ...prev, stylist: data.name }));
        setBookingStep('date');
        const dates = ['Today', 'Tomorrow', 'This Saturday', 'Next Week'];
        addMessage('bot', `${data.name === 'Any Available' ? 'No problem!' : `${data.name} is wonderful!`} 🌟\n\nWhen would you like to come in?`,
          dates.map(d => ({
            label: d,
            action: 'select_date',
            data: d
          }))
        );
        break;

      case 'select_date':
        setCurrentBooking(prev => ({ ...prev, date: data }));
        setBookingStep('time');
        const times = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
        addMessage('bot', `${data} works! Here are our available slots:`,
          times.map(t => ({
            label: t,
            action: 'select_time',
            data: t
          }))
        );
        break;

      case 'select_time':
        setCurrentBooking(prev => ({ ...prev, time: data }));
        setBookingStep('info');
        addMessage('bot', `Perfect! You're almost done. 🎉\n\n**Your Selection:**\n• Service: ${currentBooking.service}\n• Stylist: ${currentBooking.stylist}\n• Date: ${currentBooking.date}\n• Time: ${data}\n\nPlease provide your name and phone number to confirm.`);
        break;

      case 'confirm_booking':
        const newBooking: Booking = {
          id: Date.now().toString(),
          service: currentBooking.service || '',
          stylist: currentBooking.stylist || '',
          date: currentBooking.date || '',
          time: currentBooking.time || '',
          customerName: data.name,
          customerPhone: data.phone,
          status: 'confirmed'
        };
        setBookings(prev => [...prev, newBooking]);
        setBookingStep('idle');
        setCurrentBooking({});
        addMessage('bot', `✨ **Booking Confirmed!** ✨\n\n📋 **Details:**\n• Service: ${newBooking.service}\n• Stylist: ${newBooking.stylist}\n• Date: ${newBooking.date} at ${newBooking.time}\n• Name: ${newBooking.customerName}\n\n📱 Confirmation sent to ${newBooking.customerPhone}\n\n💡 **Tips:**\n• Arrive 5-10 minutes early\n• Free parking available\n• Complimentary refreshments\n\nSee you soon! 💖`, [
          { label: 'Book Another Service', action: 'start_booking' },
          { label: 'View My Bookings', action: 'my_bookings' },
        ]);
        break;

      case 'my_bookings':
        if (bookings.length === 0) {
          addMessage('bot', "You don't have any bookings yet. Would you like to schedule one?", [
            { label: 'Book Now', action: 'start_booking' },
          ]);
        } else {
          let bookingsList = "📅 **Your Bookings**\n\n";
          bookings.forEach((b, idx) => {
            bookingsList += `**${idx + 1}. ${b.service}**\n`;
            bookingsList += `• Stylist: ${b.stylist}\n`;
            bookingsList += `• Date: ${b.date} at ${b.time}\n`;
            bookingsList += `• Status: ✅ ${b.status}\n\n`;
          });
          addMessage('bot', bookingsList, [
            { label: 'Book Another', action: 'start_booking' },
            { label: 'Reschedule', action: 'reschedule' },
          ]);
        }
        break;

      case 'special_offers':
        addMessage('bot', "🎁 **Special Offers This Month!**\n\n• **New Client Special:** 20% off your first visit!\n• **Refer a Friend:** Get $20 off your next service\n• **Package Deal:** Book 3 services, get 15% off\n• **Birthday Month:** Free upgrade on any service\n\nWant to take advantage of these offers?", [
          { label: 'Book with Discount', action: 'start_booking' },
          { label: 'Learn More', action: 'contact' },
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
      const phoneMatch = userMessage.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
      const name = userMessage.replace(/\d{3}[-.]?\d{3}[-.]?\d{4}/, '').trim().split(',')[0] || userMessage;
      handleAction('confirm_booking', {
        name: name || 'Guest',
        phone: phoneMatch?.[0] || '(555) 000-0000'
      });
      return;
    }

    setIsLoading(true);

    try {
      const context = `You are an AI assistant for Highshift Salon & Spa.
      Services: ${SALON_SERVICES.map(s => `${s.name} ($${s.price})`).join(', ')}
      Stylists: ${STYLISTS.map(s => s.name).join(', ')}
      Help with: booking appointments, service info, stylist recommendations, and general inquiries.
      Be friendly, warm, and use beauty-related emojis. Make customers feel pampered!`;
      
      const response = await generateAgentResponse('salon', userMessage, context);
      addMessage('bot', response, [
        { label: 'Book Appointment', action: 'start_booking' },
        { label: 'View Services', action: 'view_services' },
      ]);
    } catch (error) {
      addMessage('bot', "I'd love to help! Here are some quick options:", [
        { label: 'Book Appointment', action: 'start_booking' },
        { label: 'View Services', action: 'view_services' },
        { label: 'Special Offers', action: 'special_offers' },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] max-h-[900px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-pink-500/20">
              <SalonIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Salon & Spa AI Agent</h2>
              <p className="text-[11px] font-bold text-pink-400/80 uppercase tracking-widest">Booking & Customer Care Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {bookings.length > 0 && (
              <button 
                onClick={() => handleAction('my_bookings')}
                className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-pink-500/30 transition"
              >
                {bookings.length} Booking{bookings.length > 1 ? 's' : ''}
              </button>
            )}
            <button onClick={onBack} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Back</button>
            <button onClick={onRestart} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Home</button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-pink-500/20 border border-pink-400/30 rounded-2xl rounded-br-none' : 'glass-panel rounded-2xl rounded-bl-none border-white/10'} px-5 py-3`}>
                <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action.action, action.data)}
                        className="bg-pink-500/20 text-pink-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-pink-500/30 transition"
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
                  <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce"></div>
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
              placeholder={bookingStep === 'info' ? "Enter your name and phone number..." : "Ask about services, stylists, or book an appointment..."}
              disabled={isLoading}
              className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-pink-500 text-white rounded-xl p-3 hover:bg-pink-400 transition-all disabled:bg-white/10 disabled:text-white/20"
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
