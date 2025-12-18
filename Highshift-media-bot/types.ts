// FIX: Import React to make React.ReactNode available.
import React from 'react';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category?: ServiceCategory;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
  actions?: MessageAction[];
}

export interface MessageAction {
  label: string;
  action: string;
  data?: any;
}

export interface Question {
  text: string;
  options: string[];
}

export type ServiceCategory = 'industry' | 'marketing' | 'automation' | 'communication' | 'other';

// Industry Agent Types
export interface IndustryAgent {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  demoAvailable: boolean;
}

// Appointment/Booking Types
export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

// Order Types (for Restaurant Agent)
export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  total: number;
  notes?: string;
  createdAt: Date;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

// Lead Types (for Marketing)
export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  createdAt: Date;
}

// Content Types (for Marketing Automation)
export interface ContentPost {
  id: string;
  platform: 'facebook' | 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'youtube';
  content: string;
  mediaUrl?: string;
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

// WhatsApp Message Types
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'location';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export enum AppState {
  // Main Navigation
  SERVICE_SELECTION = 'SERVICE_SELECTION',
  CHAT = 'CHAT',
  BOOKING = 'BOOKING',
  
  // Industry Agents
  INDUSTRY_AGENTS = 'INDUSTRY_AGENTS',
  RESTAURANT_AGENT = 'RESTAURANT_AGENT',
  CLINIC_AGENT = 'CLINIC_AGENT',
  SALON_AGENT = 'SALON_AGENT',
  DEALERSHIP_AGENT = 'DEALERSHIP_AGENT',
  CONSTRUCTION_AGENT = 'CONSTRUCTION_AGENT',
  
  // Marketing & Automation
  MARKETING_HUB = 'MARKETING_HUB',
  CONTENT_AUTOMATION = 'CONTENT_AUTOMATION',
  EMAIL_AUTOMATION = 'EMAIL_AUTOMATION',
  SOCIAL_SCHEDULER = 'SOCIAL_SCHEDULER',
  
  // Communication
  WHATSAPP_BOT = 'WHATSAPP_BOT',
  
  // Existing Features
  SNAKE_GAME = 'SNAKE_GAME',
  BUSINESS_PLAN = 'BUSINESS_PLAN',
  VOICE_AGENT = 'VOICE_AGENT',
}