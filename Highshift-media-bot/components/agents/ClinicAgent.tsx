import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo, CLINIC_DOCTORS, ClinicIcon } from '../../constants';
import { generateAgentResponse } from '../../services/geminiService';

interface ClinicAgentProps {
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

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  reason: string;
  status: 'pending' | 'confirmed';
}

export const ClinicAgent: React.FC<ClinicAgentProps> = ({ onBack, onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Welcome to Highshift Medical Center! 🏥 I'm your AI healthcare assistant. I can help you with:\n\n• Booking appointments\n• Checking doctor availability\n• Rescheduling or canceling appointments\n• Pre-visit instructions\n• General inquiries\n\nHow can I assist you today?",
      timestamp: new Date(),
      actions: [
        { label: 'Book Appointment', action: 'book_appointment' },
        { label: 'View Doctors', action: 'view_doctors' },
        { label: 'My Appointments', action: 'my_appointments' },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingStep, setBookingStep] = useState<'idle' | 'select_doctor' | 'select_date' | 'select_time' | 'patient_info' | 'confirm'>('idle');
  const [currentBooking, setCurrentBooking] = useState<Partial<Appointment>>({});
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

  const getAvailableTimeSlots = () => {
    return ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'];
  };

  const handleAction = async (action: string, data?: any) => {
    switch (action) {
      case 'view_doctors':
        let doctorsList = "👨‍⚕️ **Our Medical Team**\n\n";
        CLINIC_DOCTORS.forEach(doctor => {
          doctorsList += `**${doctor.name}**\n`;
          doctorsList += `• Specialty: ${doctor.specialty}\n`;
          doctorsList += `• Available: ${doctor.available.join(', ')}\n\n`;
        });
        doctorsList += "Would you like to book an appointment with any of our doctors?";
        addMessage('bot', doctorsList, CLINIC_DOCTORS.map(d => ({
          label: `Book with ${d.name.split(' ')[1]}`,
          action: 'select_doctor',
          data: d
        })));
        break;

      case 'book_appointment':
        setBookingStep('select_doctor');
        addMessage('bot', "Let's book your appointment! 📅\n\nFirst, please select a doctor or specialty:", 
          CLINIC_DOCTORS.map(d => ({
            label: `${d.name} (${d.specialty})`,
            action: 'select_doctor',
            data: d
          }))
        );
        break;

      case 'select_doctor':
        setCurrentBooking({ doctor: data.name, specialty: data.specialty });
        setBookingStep('select_date');
        const availableDays = data.available;
        addMessage('bot', `Great choice! Dr. ${data.name.split(' ').pop()} is available on:\n\n${availableDays.map((d: string) => `• ${d}`).join('\n')}\n\nPlease select a day:`,
          availableDays.map((day: string) => ({
            label: day,
            action: 'select_date',
            data: day
          }))
        );
        break;

      case 'select_date':
        setCurrentBooking(prev => ({ ...prev, date: data }));
        setBookingStep('select_time');
        const timeSlots = getAvailableTimeSlots();
        addMessage('bot', `Available time slots for ${data}:\n\n${timeSlots.map(t => `• ${t}`).join('\n')}\n\nPlease select a time:`,
          timeSlots.slice(0, 6).map(time => ({
            label: time,
            action: 'select_time',
            data: time
          }))
        );
        break;

      case 'select_time':
        setCurrentBooking(prev => ({ ...prev, time: data }));
        setBookingStep('patient_info');
        addMessage('bot', `Perfect! Your appointment is set for **${currentBooking.date} at ${data}** with **${currentBooking.doctor}**.\n\nPlease provide your information:\n• Full Name\n• Phone Number\n• Reason for visit\n\n(You can type all details in one message)`);
        break;

      case 'confirm_booking':
        const newAppointment: Appointment = {
          id: Date.now().toString(),
          doctor: currentBooking.doctor || '',
          specialty: currentBooking.specialty || '',
          date: currentBooking.date || '',
          time: currentBooking.time || '',
          patientName: data.name,
          patientPhone: data.phone,
          reason: data.reason,
          status: 'confirmed'
        };
        setAppointments(prev => [...prev, newAppointment]);
        setBookingStep('idle');
        setCurrentBooking({});
        addMessage('bot', `✅ **Appointment Confirmed!**\n\n📋 **Details:**\n• Doctor: ${newAppointment.doctor}\n• Specialty: ${newAppointment.specialty}\n• Date: ${newAppointment.date}\n• Time: ${newAppointment.time}\n• Patient: ${newAppointment.patientName}\n\n📱 A confirmation SMS will be sent to ${newAppointment.patientPhone}.\n\n⏰ **Reminder:** Please arrive 15 minutes early with your ID and insurance card.\n\nIs there anything else I can help you with?`, [
          { label: 'Book Another', action: 'book_appointment' },
          { label: 'View Doctors', action: 'view_doctors' },
          { label: 'Pre-Visit Instructions', action: 'pre_visit' },
        ]);
        break;

      case 'my_appointments':
        if (appointments.length === 0) {
          addMessage('bot', "You don't have any upcoming appointments. Would you like to book one?", [
            { label: 'Book Appointment', action: 'book_appointment' },
          ]);
        } else {
          let apptList = "📅 **Your Appointments**\n\n";
          appointments.forEach((appt, idx) => {
            apptList += `**${idx + 1}. ${appt.doctor}**\n`;
            apptList += `• Date: ${appt.date} at ${appt.time}\n`;
            apptList += `• Specialty: ${appt.specialty}\n`;
            apptList += `• Status: ${appt.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}\n\n`;
          });
          addMessage('bot', apptList, [
            { label: 'Book New Appointment', action: 'book_appointment' },
            { label: 'Cancel Appointment', action: 'cancel_options' },
          ]);
        }
        break;

      case 'pre_visit':
        addMessage('bot', "📋 **Pre-Visit Instructions**\n\n**Before Your Visit:**\n• Arrive 15 minutes early\n• Bring valid photo ID\n• Bring insurance card\n• List of current medications\n• List of allergies\n\n**For Fasting Blood Work:**\n• No food or drink (except water) for 8-12 hours\n\n**COVID-19 Protocol:**\n• Wear a mask in all clinical areas\n• Complete symptom screening at entrance\n\nDo you have any questions about your upcoming visit?", [
          { label: 'Book Appointment', action: 'book_appointment' },
          { label: 'Contact Us', action: 'contact' },
        ]);
        break;

      case 'contact':
        addMessage('bot', "📞 **Contact Information**\n\n• Phone: (555) 123-4567\n• Emergency: (555) 123-4568\n• Email: info@highshiftmedical.com\n• Hours: Mon-Fri 8AM-6PM, Sat 9AM-1PM\n\nFor emergencies, please call 911 or visit your nearest emergency room.", [
          { label: 'Book Appointment', action: 'book_appointment' },
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

    // Handle booking flow
    if (bookingStep === 'patient_info') {
      // Parse patient info from message
      const lines = userMessage.split('\n');
      const patientData = {
        name: lines[0] || userMessage.split(',')[0] || userMessage,
        phone: userMessage.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)?.[0] || '(555) 000-0000',
        reason: lines[2] || 'General Consultation'
      };
      handleAction('confirm_booking', patientData);
      return;
    }

    setIsLoading(true);

    try {
      const context = `You are an AI assistant for Highshift Medical Center.
      Available doctors: ${CLINIC_DOCTORS.map(d => `${d.name} (${d.specialty})`).join(', ')}
      Current appointments: ${appointments.length}
      Help with: appointment booking, doctor availability, medical inquiries, pre-visit instructions.
      Be professional, empathetic, and HIPAA-conscious. Never provide medical diagnoses.`;
      
      const response = await generateAgentResponse('clinic', userMessage, context);
      addMessage('bot', response, [
        { label: 'Book Appointment', action: 'book_appointment' },
        { label: 'View Doctors', action: 'view_doctors' },
      ]);
    } catch (error) {
      addMessage('bot', "I apologize, but I'm having trouble processing your request. Let me help you with our quick options:", [
        { label: 'Book Appointment', action: 'book_appointment' },
        { label: 'View Doctors', action: 'view_doctors' },
        { label: 'Contact Us', action: 'contact' },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] max-h-[900px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-pink-500/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-red-500/20">
              <ClinicIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Healthcare AI Agent</h2>
              <p className="text-[11px] font-bold text-red-400/80 uppercase tracking-widest">Appointments & Patient Care Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {appointments.length > 0 && (
              <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm font-medium">
                {appointments.length} Appointment{appointments.length > 1 ? 's' : ''}
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
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-red-500/20 border border-red-400/30 rounded-2xl rounded-br-none' : 'glass-panel rounded-2xl rounded-bl-none border-white/10'} px-5 py-3`}>
                <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action.action, action.data)}
                        className="bg-red-500/20 text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition"
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
                  <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce"></div>
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
              placeholder={bookingStep === 'patient_info' ? "Enter your name, phone, and reason for visit..." : "Ask about appointments, doctors, or medical services..."}
              disabled={isLoading}
              className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl py-3 px-5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-red-500 text-white rounded-xl p-3 hover:bg-red-400 transition-all disabled:bg-white/10 disabled:text-white/20"
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
