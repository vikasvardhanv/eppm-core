import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo, SAMPLE_MENU, RestaurantIcon } from '../../constants';
import { generateAgentResponse } from '../../services/geminiService';

interface RestaurantAgentProps {
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

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export const RestaurantAgent: React.FC<RestaurantAgentProps> = ({ onBack, onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Welcome to Highshift Restaurant! 🍽️ I'm your AI assistant. I can help you with:\n\n• Viewing our menu\n• Placing an order\n• Checking order status\n• Making reservations\n• Answering questions about our dishes\n\nHow can I assist you today?",
      timestamp: new Date(),
      actions: [
        { label: 'View Menu', action: 'view_menu' },
        { label: 'Place Order', action: 'start_order' },
        { label: 'Make Reservation', action: 'reservation' },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
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
      case 'view_menu':
        let menuText = "📋 **Our Menu**\n\n";
        SAMPLE_MENU.categories.forEach(category => {
          menuText += `**${category.name}**\n`;
          category.items.forEach(item => {
            menuText += `• ${item.name} - $${item.price.toFixed(2)}\n  _${item.description}_\n`;
          });
          menuText += '\n';
        });
        menuText += "Would you like to order something?";
        addMessage('bot', menuText, [
          { label: 'Start Order', action: 'start_order' },
          { label: 'Ask a Question', action: 'ask_question' }
        ]);
        break;

      case 'start_order':
        addMessage('bot', "Great! Let's start your order. 🛒\n\nYou can tell me what you'd like, or browse our categories:", [
          { label: 'Starters', action: 'show_category', data: 'Starters' },
          { label: 'Main Courses', action: 'show_category', data: 'Main Courses' },
          { label: 'Desserts', action: 'show_category', data: 'Desserts' },
        ]);
        break;

      case 'show_category':
        const category = SAMPLE_MENU.categories.find(c => c.name === data);
        if (category) {
          let categoryText = `**${category.name}**\n\n`;
          category.items.forEach(item => {
            categoryText += `• **${item.name}** - $${item.price.toFixed(2)}\n  ${item.description}\n`;
          });
          categoryText += "\nTap an item to add it to your order:";
          addMessage('bot', categoryText, category.items.map(item => ({
            label: `Add ${item.name}`,
            action: 'add_item',
            data: item
          })));
        }
        break;

      case 'add_item':
        const item = data;
        setCurrentOrder(prev => {
          const existing = prev.find(i => i.id === item.id);
          if (existing) {
            return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, { id: item.id, name: item.name, quantity: 1, price: item.price }];
        });
        addMessage('bot', `✅ Added **${item.name}** to your order!\n\nWould you like to add more items or proceed to checkout?`, [
          { label: 'Add More', action: 'start_order' },
          { label: 'View Cart', action: 'view_cart' },
          { label: 'Checkout', action: 'checkout' },
        ]);
        break;

      case 'view_cart':
        setShowCart(true);
        break;

      case 'checkout':
        if (currentOrder.length === 0) {
          addMessage('bot', "Your cart is empty! Let me show you our menu.", [
            { label: 'View Menu', action: 'view_menu' }
          ]);
        } else {
          const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          let orderSummary = "📦 **Order Summary**\n\n";
          currentOrder.forEach(item => {
            orderSummary += `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
          });
          orderSummary += `\n**Total: $${total.toFixed(2)}**\n\nPlease provide your name and phone number to confirm the order.`;
          addMessage('bot', orderSummary);
        }
        break;

      case 'reservation':
        addMessage('bot', "I'd be happy to help you make a reservation! 📅\n\nPlease provide:\n• Date and time\n• Number of guests\n• Your name and phone number\n\nOr I can check availability for you.", [
          { label: 'Check Today\'s Availability', action: 'check_availability', data: 'today' },
          { label: 'Check Tomorrow', action: 'check_availability', data: 'tomorrow' },
        ]);
        break;

      case 'check_availability':
        addMessage('bot', `✅ We have availability for ${data}!\n\nAvailable time slots:\n• 12:00 PM - Lunch\n• 1:00 PM - Lunch\n• 6:00 PM - Dinner\n• 7:00 PM - Dinner\n• 8:00 PM - Dinner\n\nHow many guests and which time works for you?`);
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
      const context = `You are an AI assistant for a restaurant called Highshift Restaurant. 
      Current order: ${JSON.stringify(currentOrder)}
      Menu categories: ${SAMPLE_MENU.categories.map(c => c.name).join(', ')}
      Help with: ordering food, menu questions, reservations, dietary restrictions, and general inquiries.
      Be friendly, helpful, and concise. Use emojis occasionally.`;
      
      const response = await generateAgentResponse('restaurant', userMessage, context);
      addMessage('bot', response, [
        { label: 'View Menu', action: 'view_menu' },
        { label: 'Place Order', action: 'start_order' },
      ]);
    } catch (error) {
      addMessage('bot', "I apologize, but I'm having trouble processing your request. Let me help you with our quick actions:", [
        { label: 'View Menu', action: 'view_menu' },
        { label: 'Make Reservation', action: 'reservation' },
      ]);
    }

    setIsLoading(false);
  };

  const cartTotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] max-h-[900px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-orange-500/20">
              <RestaurantIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Restaurant AI Agent</h2>
              <p className="text-[11px] font-bold text-orange-400/80 uppercase tracking-widest">Ordering & Reservations Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentOrder.length > 0 && (
              <button 
                onClick={() => setShowCart(true)}
                className="relative bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-orange-500/30 transition"
              >
                🛒 Cart (${cartTotal.toFixed(2)})
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {currentOrder.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
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
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-orange-500/20 border border-orange-400/30 rounded-2xl rounded-br-none' : 'glass-panel rounded-2xl rounded-bl-none border-white/10'} px-5 py-3`}>
                <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action.action, action.data)}
                        className="bg-orange-500/20 text-orange-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-orange-500/30 transition"
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
                  <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce"></div>
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
              placeholder="Ask about our menu, place an order, or make a reservation..."
              disabled={isLoading}
              className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 text-white rounded-xl p-3 hover:bg-orange-400 transition-all disabled:bg-white/10 disabled:text-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl w-full max-w-md p-6 border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Your Order</h3>
              <button onClick={() => setShowCart(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            {currentOrder.length === 0 ? (
              <p className="text-white/50 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {currentOrder.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-white/50 text-sm">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setCurrentOrder(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0))}
                          className="text-white/40 hover:text-white h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
                        >-</button>
                        <span className="text-white font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => setCurrentOrder(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                          className="text-white/40 hover:text-white h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60">Total</span>
                    <span className="text-2xl font-bold text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => { setShowCart(false); handleAction('checkout'); }}
                    className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-400 transition"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
