
import React, { useState, useCallback } from 'react';
import { ServiceSelection } from './components/ServiceSelection';
import { Chatbot } from './components/Chatbot';
import { SnakeGame } from './components/SnakeGame';
import { BusinessPlanner } from './components/BusinessPlanner';
import { VoiceAgent } from './components/VoiceAgent';
import { IndustryAgentHub } from './components/IndustryAgentHub';
import { RestaurantAgent } from './components/agents/RestaurantAgent';
import { ClinicAgent } from './components/agents/ClinicAgent';
import { SalonAgent } from './components/agents/SalonAgent';
import { DealershipAgent } from './components/agents/DealershipAgent';
import { ConstructionAgent } from './components/agents/ConstructionAgent';
import { MarketingHub } from './components/MarketingHub';
import { WhatsAppBot } from './components/WhatsAppBot';
import type { Service, ChatMessage, Question } from './types';
import { AppState } from './types';
import { QUESTIONS } from './constants';
import { generateSummary } from './services/geminiService';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SERVICE_SELECTION);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service);
    
    // Handle special navigation cases
    switch (service.id) {
      case 'snake':
        setAppState(AppState.SNAKE_GAME);
        return;
      case 'business_plan':
        setAppState(AppState.BUSINESS_PLAN);
        return;
      case 'voice_agent':
        setAppState(AppState.VOICE_AGENT);
        return;
      case 'industry_agents':
        setAppState(AppState.INDUSTRY_AGENTS);
        return;
      case 'marketing_hub':
        setAppState(AppState.MARKETING_HUB);
        return;
      case 'whatsapp_bot':
        setAppState(AppState.WHATSAPP_BOT);
        return;
    }

    // Default chat flow for other services
    const firstQuestion = QUESTIONS[service.id]?.[0]?.text;
    if (firstQuestion) {
      setChatHistory([
        { sender: 'bot', text: `Great! Let's get started with ${service.name}. I have a few questions to understand your needs.` },
        { sender: 'bot', text: firstQuestion }
      ]);
    }
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAppState(AppState.CHAT);
  }, []);

  const handleIndustryAgentSelect = useCallback((agentId: string) => {
    switch (agentId) {
      case 'restaurant':
        setAppState(AppState.RESTAURANT_AGENT);
        break;
      case 'clinic':
        setAppState(AppState.CLINIC_AGENT);
        break;
      case 'salon':
        setAppState(AppState.SALON_AGENT);
        break;
      case 'dealership':
        setAppState(AppState.DEALERSHIP_AGENT);
        break;
      case 'construction':
        setAppState(AppState.CONSTRUCTION_AGENT);
        break;
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedService) return;

    const updatedHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: message }];
    setChatHistory(updatedHistory);
    
    const newAnswers = [...userAnswers, message];
    setUserAnswers(newAnswers);

    const nextQuestionIndex = currentQuestionIndex + 1;
    const serviceQuestions = QUESTIONS[selectedService.id];

    if (serviceQuestions && nextQuestionIndex < serviceQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setChatHistory(prev => [...prev, { sender: 'bot', text: serviceQuestions[nextQuestionIndex].text }]);
    } else {
      setIsLoading(true);
      setAppState(AppState.BOOKING);
      
      const summary = await generateSummary(selectedService.id, selectedService.name, newAnswers);
      
      setChatHistory(prev => [
          ...prev, 
          { sender: 'bot', text: summary },
          { sender: 'bot', text: "Thank you! Everything is ready. Please click the button below to send your information to our development team." }
      ]);
      setIsLoading(false);
    }
  }, [selectedService, chatHistory, userAnswers, currentQuestionIndex]);

  const handleRestart = () => {
    setAppState(AppState.SERVICE_SELECTION);
    setSelectedService(null);
    setChatHistory([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setIsLoading(false);
  };

  const handleBackToIndustryHub = () => {
    setAppState(AppState.INDUSTRY_AGENTS);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.SERVICE_SELECTION:
        return <ServiceSelection onSelect={handleServiceSelect} />;
      
      // Existing features
      case AppState.SNAKE_GAME:
        return <SnakeGame onRestart={handleRestart} />;
      case AppState.BUSINESS_PLAN:
        return <BusinessPlanner onRestart={handleRestart} />;
      case AppState.VOICE_AGENT:
        return <VoiceAgent onRestart={handleRestart} />;
      
      // Industry Agents Hub
      case AppState.INDUSTRY_AGENTS:
        return <IndustryAgentHub onSelectAgent={handleIndustryAgentSelect} onRestart={handleRestart} />;
      
      // Individual Industry Agents
      case AppState.RESTAURANT_AGENT:
        return <RestaurantAgent onBack={handleBackToIndustryHub} onRestart={handleRestart} />;
      case AppState.CLINIC_AGENT:
        return <ClinicAgent onBack={handleBackToIndustryHub} onRestart={handleRestart} />;
      case AppState.SALON_AGENT:
        return <SalonAgent onBack={handleBackToIndustryHub} onRestart={handleRestart} />;
      case AppState.DEALERSHIP_AGENT:
        return <DealershipAgent onBack={handleBackToIndustryHub} onRestart={handleRestart} />;
      case AppState.CONSTRUCTION_AGENT:
        return <ConstructionAgent onBack={handleBackToIndustryHub} onRestart={handleRestart} />;
      
      // Marketing Hub
      case AppState.MARKETING_HUB:
        return <MarketingHub onRestart={handleRestart} />;
      
      // WhatsApp Bot
      case AppState.WHATSAPP_BOT:
        return <WhatsAppBot onRestart={handleRestart} />;
      
      // Chat flow
      case AppState.CHAT:
      case AppState.BOOKING:
        if (selectedService) {
          const currentQuestion = QUESTIONS[selectedService.id]?.[currentQuestionIndex];
          return <Chatbot 
                    service={selectedService}
                    chatHistory={chatHistory}
                    userAnswers={userAnswers}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    appState={appState}
                    onRestart={handleRestart}
                    currentQuestion={currentQuestion}
                 />;
        }
        handleRestart();
        return <ServiceSelection onSelect={handleServiceSelect} />;
      
      default:
        return <ServiceSelection onSelect={handleServiceSelect} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900">
      {renderContent()}
    </div>
  );
}

export default App;
