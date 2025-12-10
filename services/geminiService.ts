import { GoogleGenAI } from "@google/genai";
import { dbService } from "./dataService";

const getSystemInstruction = async () => {
  const [settings, skillsData, projectsData] = await Promise.all([
    dbService.getSettings(),
    dbService.getSkills(),
    dbService.getProjects()
  ]);
  
  const skills = skillsData.map(s => s.name).join(", ");
  const projects = projectsData.map(p => p.title).join(", ");
  
  return `You are an AI assistant for Hossein Farahkordmahaleh's portfolio website. 
  Hossein is a Full Stack Developer.
  His skills include: ${skills}.
  His notable projects are: ${projects}.
  His contact email is ${settings.contactEmail}.
  
  Answer visitor questions politely and professionally. If they want to hire him, encourage them to use the contact form.
  Keep answers concise (under 100 words) unless asked for details.
  Supports English, Finnish, and Farsi.`;
};

export const chatWithGemini = async (userMessage: string) => {
  const settings = await dbService.getSettings();
  const apiKey = settings?.geminiApiKey;
  if (!apiKey) {
    return "AI Assistant is currently offline (Missing API Key).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = await getSystemInstruction();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: { systemInstruction }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am having trouble connecting to my brain right now.";
  }
};