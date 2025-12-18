import React, { useState, useRef, useEffect } from 'react';
import { WhatsAppIcon } from '../constants';
import { generateAgentResponse } from '../services/geminiService';

interface WhatsAppBotProps {
  onRestart: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

interface Lead {
  name: string;
  phone: string;
  email: string;
  interest: string;
  qualified: boolean;
}

export const WhatsAppBot: React.FC<WhatsAppBotProps> = ({ onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! Welcome to our WhatsApp Business Assistant.\n\nI'm here to help you 24/7 with:\n• 📋 Product information\n• 🛒 Place orders\n• 📅 Book appointments\n• ❓ Answer your questions\n• 💬 Connect with support\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);
  const [leadInfo, setLeadInfo] = useState<Partial<Lead>>({});
  const [collectedLeads, setCollectedLeads] = useState<Lead[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies: QuickReply[] = [
    { id: '1', text: '📋 Product Info', action: 'product_info' },
    { id: '2', text: '🛒 Place Order', action: 'place_order' },
    { id: '3', text: '📅 Book Appointment', action: 'book_appointment' },
    { id: '4', text: '💼 Business Inquiry', action: 'business_inquiry' },
    { id: '5', text: '❓ FAQ', action: 'faq' },
    { id: '6', text: '👤 Talk to Human', action: 'human_support' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleQuickReply = async (action: string) => {
    let userText = '';
    let botResponse = '';

    switch (action) {
      case 'product_info':
        userText = '📋 I want product information';
        botResponse = "📦 **Our Products & Services**\n\nWe offer a wide range of solutions:\n\n1. **AI Chatbots** - 24/7 customer support\n2. **Automation Tools** - Streamline your workflow\n3. **Marketing Suite** - Grow your business\n4. **Analytics Dashboard** - Track performance\n\nWhich product interests you? Reply with the number or ask me anything!";
        break;

      case 'place_order':
        userText = '🛒 I want to place an order';
        setCurrentFlow('order');
        botResponse = "🛒 **Start Your Order**\n\nI'll help you place an order quickly!\n\nFirst, please tell me:\n**What product are you interested in?**\n\n• AI Chatbot Setup - $499/mo\n• Automation Suite - $299/mo\n• Marketing Package - $399/mo\n• Full Bundle (Save 20%) - $799/mo\n\nJust type the product name or number!";
        break;

      case 'book_appointment':
        userText = '📅 I want to book an appointment';
        setCurrentFlow('appointment');
        botResponse = "📅 **Schedule a Consultation**\n\nGreat choice! Let's get you scheduled.\n\n**Please share your name** to get started.";
        break;

      case 'business_inquiry':
        userText = '💼 Business inquiry';
        setCurrentFlow('lead_capture');
        botResponse = "💼 **Business Inquiry**\n\nWe'd love to learn more about your business needs!\n\n**What's your name?** (This helps us personalize your experience)";
        break;

      case 'faq':
        userText = '❓ FAQ';
        botResponse = "❓ **Frequently Asked Questions**\n\n**1. What are your business hours?**\nWe're available 24/7 via WhatsApp!\n\n**2. How do I get started?**\nJust send us a message or book a free consultation.\n\n**3. Do you offer custom solutions?**\nYes! We tailor our services to your needs.\n\n**4. What's your response time?**\nAI responds instantly. Human support within 1 hour.\n\n**5. Do you offer refunds?**\nYes, 30-day money-back guarantee.\n\nNeed more help? Just ask! 🙋";
        break;

      case 'human_support':
        userText = '👤 Connect me to a human';
        botResponse = "👤 **Human Support Request**\n\nI understand you'd like to speak with a team member.\n\n🕐 A support representative will contact you within **15 minutes** during business hours (9 AM - 6 PM).\n\n📱 Alternatively, call us directly: **+1 (555) 123-4567**\n\nWould you like me to help with anything else while you wait?";
        break;

      default:
        botResponse = "I'm here to help! Please select an option or type your question.";
    }

    addMessage(userText, 'user');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addMessage(botResponse, 'bot');
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsTyping(true);

    let botResponse = '';

    // Handle different flows
    if (currentFlow === 'lead_capture') {
      if (!leadInfo.name) {
        setLeadInfo({ ...leadInfo, name: userMessage });
        botResponse = `Nice to meet you, ${userMessage}! 👋\n\n**What's your phone number?** (We'll only use this to contact you about your inquiry)`;
      } else if (!leadInfo.phone) {
        setLeadInfo({ ...leadInfo, phone: userMessage });
        botResponse = "Great! 📧 **What's your email address?**";
      } else if (!leadInfo.email) {
        setLeadInfo({ ...leadInfo, email: userMessage });
        botResponse = "Perfect! Last question:\n\n**What services are you most interested in?**\n• AI Chatbots\n• Marketing Automation\n• Full Business Suite\n\nOr describe your specific needs!";
      } else if (!leadInfo.interest) {
        const completedLead: Lead = {
          name: leadInfo.name!,
          phone: leadInfo.phone!,
          email: userMessage.includes('@') ? userMessage : leadInfo.email || '',
          interest: userMessage.includes('@') ? 'General Interest' : userMessage,
          qualified: true,
        };
        if (!userMessage.includes('@')) {
          completedLead.email = leadInfo.email!;
        }
        setCollectedLeads([...collectedLeads, completedLead]);
        setLeadInfo({});
        setCurrentFlow(null);
        botResponse = `✅ **Thank you, ${completedLead.name}!**\n\nYour inquiry has been recorded:\n• 📱 Phone: ${completedLead.phone}\n• 📧 Email: ${completedLead.email}\n• 💡 Interest: ${completedLead.interest}\n\nOur team will reach out within **24 hours**. In the meantime, is there anything else I can help you with?`;
      }
    } else if (currentFlow === 'appointment') {
      if (!leadInfo.name) {
        setLeadInfo({ ...leadInfo, name: userMessage });
        botResponse = `Great, ${userMessage}! 📱\n\n**What's your phone number?** (We'll send you appointment reminders)`;
      } else if (!leadInfo.phone) {
        setLeadInfo({ ...leadInfo, phone: userMessage });
        botResponse = "📅 **Choose a day for your consultation:**\n\n• Monday\n• Tuesday\n• Wednesday\n• Thursday\n• Friday\n\nJust type the day that works best!";
      } else if (!leadInfo.interest) {
        setLeadInfo({ ...leadInfo, interest: userMessage });
        botResponse = `⏰ **What time works for you on ${userMessage}?**\n\nAvailable slots:\n• 9:00 AM\n• 11:00 AM\n• 2:00 PM\n• 4:00 PM\n\nType your preferred time!`;
      } else {
        const appointmentDetails = {
          name: leadInfo.name!,
          phone: leadInfo.phone!,
          day: leadInfo.interest!,
          time: userMessage,
        };
        setLeadInfo({});
        setCurrentFlow(null);
        botResponse = `✅ **Appointment Confirmed!**\n\n📋 **Details:**\n• 👤 Name: ${appointmentDetails.name}\n• 📱 Phone: ${appointmentDetails.phone}\n• 📅 Day: ${appointmentDetails.day}\n• ⏰ Time: ${userMessage}\n\n📱 You'll receive a confirmation SMS shortly.\n📧 A calendar invite will be sent to your email.\n\nNeed to reschedule? Just message us anytime!`;
      }
    } else if (currentFlow === 'order') {
      setCurrentFlow(null);
      botResponse = `🎉 **Great Choice!**\n\nYou've selected: **${userMessage}**\n\nTo complete your order, please:\n1. Click here to checkout: [Payment Link]\n2. Or call us: +1 (555) 123-4567\n\n💳 We accept all major credit cards and PayPal.\n🔒 100% secure checkout\n\nWould you like me to help with anything else?`;
    } else {
      // General AI response
      try {
        const context = `Business: Highshift Media. 
          Conversation history: ${messages.map(m => `${m.sender}: ${m.text}`).join('\n')}`;
        botResponse = await generateAgentResponse('whatsapp', userMessage, context);
      } catch (error) {
        botResponse = "I'm here to help! You can:\n\n• Ask about our products and services\n• Place an order\n• Book a consultation\n• Get answers to common questions\n\nWhat would you like to do?";
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      addMessage(botResponse, 'bot');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[90vh] max-h-[700px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden bg-gradient-to-b from-[#075e54] to-[#128c7e]">
        {/* WhatsApp Header */}
        <header className="px-4 py-3 bg-[#075e54] flex items-center gap-3">
          <button onClick={onRestart} className="text-white/80 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <WhatsAppIcon />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold">Business Assistant</h2>
            <p className="text-white/70 text-xs">🟢 Online • Typically replies instantly</p>
          </div>
          <div className="flex gap-3 text-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </header>

        {/* Chat Background */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#ece5dd',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 shadow ${
                  message.sender === 'user'
                    ? 'bg-[#dcf8c6] rounded-tr-none'
                    : 'bg-white rounded-tl-none'
                }`}
              >
                <p className="text-[#303030] text-sm whitespace-pre-wrap leading-relaxed">
                  {message.text.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.sender === 'user' && (
                    <span className="text-blue-500 text-xs">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {!currentFlow && (
          <div className="px-4 py-2 bg-[#f0f0f0] overflow-x-auto">
            <div className="flex gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply.action)}
                  className="flex-shrink-0 bg-white text-[#075e54] text-sm px-3 py-2 rounded-full border border-[#075e54]/20 hover:bg-[#075e54] hover:text-white transition whitespace-nowrap"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="px-2 py-2 bg-[#f0f0f0] flex items-center gap-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="p-2 bg-[#075e54] text-white rounded-full hover:bg-[#128c7e] transition"
          >
            {inputValue.trim() ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </form>

        {/* Demo Badge */}
        <div className="bg-[#075e54] text-center py-2 border-t border-white/10">
          <span className="text-white/60 text-xs">🎮 Interactive Demo | WhatsApp Business Bot</span>
        </div>
      </div>
    </div>
  );
};
