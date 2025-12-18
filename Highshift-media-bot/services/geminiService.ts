import { GoogleGenAI } from "@google/genai";
import { QUESTIONS, BUSINESS_PLAN_QUESTIONS } from '../constants';

// Check if API key is available
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
const hasValidApiKey = apiKey && apiKey !== 'your_api_key_here' && apiKey.length > 10;

// Only initialize if we have a valid API key
let ai: GoogleGenAI | null = null;
if (hasValidApiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Failed to initialize Gemini AI:', e);
  }
}

// Demo mode responses when API key is not available
const DEMO_RESPONSES = {
  summary: "Thank you for sharing your project requirements! Based on your responses, I can see you're looking for a comprehensive AI solution tailored to your business needs. Our team specializes in exactly this type of project. The next step would be to schedule a consultation call where we can dive deeper into your specific requirements and provide a detailed proposal.",
  businessPlan: `# Business Plan for Your Company

## Executive Summary
Your business idea shows strong potential in the current market landscape. This plan outlines a strategic approach to launch and grow your venture successfully.

## Market Analysis
The industry you're targeting is experiencing significant growth, with projected increases of 15-20% annually. Your target demographic represents a substantial market opportunity.

## Competitive Advantage
Your unique value proposition sets you apart from existing competitors. Focus on delivering exceptional customer experience and innovative solutions.

## Marketing Strategy
- Digital marketing campaigns across social platforms
- Content marketing to establish thought leadership
- Strategic partnerships for expanded reach
- Email marketing for customer retention

## Financial Projections
- Year 1: Focus on customer acquisition and brand building
- Year 2: Scale operations and expand market presence
- Year 3: Profitability and market leadership

## Next Steps
Schedule a consultation with our team to refine this plan and develop detailed implementation strategies.`,
  agent: "I'd be happy to help you with that! This is a demo response. To enable full AI capabilities, please add your Gemini API key to the .env file. For now, you can explore the interface and see how the agent interactions work.",
  marketing: `# Social Media Post

🚀 Exciting news! We're revolutionizing the way businesses connect with customers.

✨ Our AI-powered solutions help you:
• Automate customer support 24/7
• Generate engaging content
• Analyze data for insights

Ready to transform your business? Let's chat! 💬

#AI #Innovation #BusinessGrowth #Automation`,
  email: `# Email Campaign: Welcome Series

## Email 1: Welcome
**Subject:** Welcome to the future of business! 🎉
**Preview:** Your journey to AI-powered success starts here...

Dear [First Name],

Welcome aboard! We're thrilled to have you join us...

## Email 2: Value Introduction (Day 3)
**Subject:** Here's what you've been missing...

## Email 3: Case Study (Day 7)
**Subject:** How [Company X] increased revenue by 200%...

---
*This is a demo email campaign. Add your API key for personalized AI-generated content.*`,
};

export async function generateSummary(serviceId: string, serviceName: string, answers: string[]): Promise<string> {
  // Return demo response if no valid API key
  if (!ai) {
    return DEMO_RESPONSES.summary;
  }

  const serviceQuestions = QUESTIONS[serviceId] || [];

  const promptContent = `
    Please summarize the following project requirements for the '${serviceName}' service.
    The summary should be concise, professional, and confirm understanding.
    Address the potential client directly in a friendly but professional tone.
    Conclude by stating that the next step is to book a call to discuss the project in detail.

    Client's Answers:
    ${serviceQuestions.map((q, i) => `Q: ${q.text}\nA: ${answers[i] || 'Not provided'}`).join('\n\n')}

    Keep the summary to about 3-4 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContent,
        config: {
            systemInstruction: "You are a helpful AI assistant for Highshift Media, an AI consulting agency. Your task is to summarize a potential client's project requirements based on their answers to a questionnaire.",
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return "Thank you for providing your details. It seems there was an issue generating a summary, but we have your information. The next step is to book a call with our team to discuss your project further.";
  }
}

export async function generateBusinessPlan(answers: string[]): Promise<string> {
    // Return demo response if no valid API key
    if (!ai) {
      return DEMO_RESPONSES.businessPlan;
    }

    const [industry, product, customer, goal, name] = answers;

    const prompt = `
        Act as an expert business consultant. Based on the following information, create a comprehensive business plan for a new company named "${name}".

        **Business Details:**
        - **Industry/Market:** ${industry}
        - **Primary Product/Service:** ${product}
        - **Target Customer:** ${customer}
        - **First-Year Goal:** ${goal}
        - **Business Name:** ${name}

        Please structure the business plan with the following sections, providing detailed and actionable insights in each. Use markdown for formatting.

        1.  **Executive Summary:** A brief, compelling overview of the business.
        2.  **Company Description:** Detail the mission, vision, and legal structure.
        3.  **Market Analysis:** Analyze the industry size, trends, and target market demographics.
        4.  **Competitor Analysis:** Identify 2-3 potential direct and indirect competitors. Analyze their strengths and weaknesses and describe this company's competitive advantage.
        5.  **Products & Services:** A detailed description of the offerings.
        6.  **Marketing & Sales Strategy:** Outline how the business will attract and retain customers (e.g., online marketing, social media, sales channels).
        7.  **Financial Projections (High-Level):** Provide a high-level overview of potential revenue streams and key startup costs to consider. Do not create a detailed spreadsheet, but give general financial guidance.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert business consultant AI that generates detailed, professional, and actionable business plans.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating business plan with Gemini:", error);
        return "We're sorry, but there was an error generating your business plan. Please check the console for details and try again.";
    }
}

// Agent-specific response generation
export async function generateAgentResponse(
    agentType: string, 
    userMessage: string, 
    context: string
): Promise<string> {
    // Return demo response if no valid API key
    if (!ai) {
      return DEMO_RESPONSES.agent;
    }

    const systemInstructions: Record<string, string> = {
        restaurant: `You are an AI assistant for a restaurant. Help customers with:
            - Menu inquiries and recommendations
            - Taking orders
            - Reservations
            - Dietary restrictions and allergen information
            Be friendly, helpful, and use food-related emojis occasionally. Keep responses concise.`,
        
        clinic: `You are an AI assistant for a healthcare clinic. Help patients with:
            - Appointment scheduling
            - Doctor availability
            - Pre-visit instructions
            - General health inquiries (without providing medical diagnoses)
            Be professional, empathetic, and HIPAA-conscious. Never provide medical diagnoses.`,
        
        salon: `You are an AI assistant for a salon and spa. Help customers with:
            - Service information and pricing
            - Booking appointments
            - Stylist recommendations
            - Product inquiries
            Be warm, friendly, and make customers feel pampered. Use beauty-related emojis.`,
        
        dealership: `You are an AI sales assistant for a car dealership. Help customers with:
            - Vehicle inquiries and comparisons
            - Scheduling test drives
            - Financing questions
            - Trade-in valuations
            Be enthusiastic, knowledgeable, and helpful. Focus on matching customers with the right vehicle.`,
        
        construction: `You are an AI assistant for construction project management. Help with:
            - Project scheduling and planning
            - Cost estimation
            - Progress tracking
            - Safety compliance
            - Resource allocation
            Be professional, use construction terminology, and provide actionable insights.`,
        
        whatsapp: `You are an AI assistant for WhatsApp business communication. Help with:
            - Customer inquiries
            - Order status updates
            - Appointment booking
            - Lead qualification
            Be concise, friendly, and action-oriented. Format messages for mobile readability.`,
        
        marketing: `You are an AI marketing assistant. Help with:
            - Content creation and strategy
            - Social media planning
            - Email marketing campaigns
            - Lead generation strategies
            Be creative, data-driven, and provide actionable marketing insights.`,
    };

    const systemInstruction = systemInstructions[agentType] || systemInstructions.marketing;

    const prompt = `
        Context: ${context}
        
        User Message: ${userMessage}
        
        Provide a helpful, relevant response. Keep it concise (2-4 sentences max unless more detail is needed).
        If the user is asking about something outside your scope, politely redirect them.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating ${agentType} agent response:`, error);
        throw new Error("Failed to generate response");
    }
}

// Generate marketing content
export async function generateMarketingContent(
    contentType: string,
    details: {
        platform?: string;
        topic?: string;
        tone?: string;
        targetAudience?: string;
        keywords?: string[];
    }
): Promise<string> {
    // Return demo response if no valid API key
    if (!ai) {
      return DEMO_RESPONSES.marketing;
    }

    const prompts: Record<string, string> = {
        social_post: `Create a ${details.platform || 'social media'} post about "${details.topic}".
            Tone: ${details.tone || 'professional'}
            Target Audience: ${details.targetAudience || 'general'}
            Include relevant hashtags and a call-to-action.
            Keep it platform-appropriate (character limits, style).`,
        
        email_subject: `Generate 5 compelling email subject lines for:
            Topic: ${details.topic}
            Target Audience: ${details.targetAudience || 'general'}
            Goal: Maximize open rates`,
        
        blog_outline: `Create a detailed blog post outline for:
            Topic: ${details.topic}
            Target Audience: ${details.targetAudience || 'general'}
            Keywords to include: ${details.keywords?.join(', ') || 'none specified'}
            Include intro, main sections with bullet points, and conclusion.`,
        
        ad_copy: `Create compelling ad copy for:
            Product/Service: ${details.topic}
            Platform: ${details.platform || 'Google Ads'}
            Target Audience: ${details.targetAudience || 'general'}
            Include headline, description, and call-to-action.`,
    };

    const prompt = prompts[contentType] || prompts.social_post;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert marketing copywriter. Create engaging, conversion-focused content that resonates with the target audience.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating marketing content:", error);
        throw new Error("Failed to generate content");
    }
}

// Generate email campaign content
export async function generateEmailCampaign(
    campaignDetails: {
        businessName: string;
        industry: string;
        campaignGoal: string;
        targetAudience: string;
        numberOfEmails: number;
    }
): Promise<string> {
    // Return demo response if no valid API key
    if (!ai) {
      return DEMO_RESPONSES.email;
    }

    const prompt = `
        Create a ${campaignDetails.numberOfEmails}-email marketing campaign for:
        
        Business: ${campaignDetails.businessName}
        Industry: ${campaignDetails.industry}
        Campaign Goal: ${campaignDetails.campaignGoal}
        Target Audience: ${campaignDetails.targetAudience}
        
        For each email, provide:
        1. Subject Line (A/B options)
        2. Preview Text
        3. Email Body (with placeholders for personalization)
        4. Call-to-Action
        5. Recommended Send Day/Time
        
        Format as a structured sequence with clear progression and nurturing strategy.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert email marketing strategist. Create high-converting email sequences that build relationships and drive action.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating email campaign:", error);
        throw new Error("Failed to generate email campaign");
    }
}