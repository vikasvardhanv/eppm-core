import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateContent(prompt: string) {
  if (!genAI) throw new Error("Gemini API Key not configured");
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateJSON(prompt: string) {
    if (!genAI) throw new Error("Gemini API Key not configured");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // Force JSON structure in prompt
    const jsonPrompt = `${prompt} \n\n Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.`;
    const result = await model.generateContent(jsonPrompt);
    const response = await result.response;
    const text = response.text();
    try {
        // Clean up markdown if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini", text);
        return null;
    }
}
