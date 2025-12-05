import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Service } from '../types';

let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.warn("Gemini API Key is missing.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const generateServiceSuggestion = async (
  userQuery: string, 
  services: Service[]
): Promise<string> => {
  const client = getAIClient();
  if (!client) return "Desculpe, a assistente virtual está indisponível no momento.";

  const servicesContext = services.map(s => 
    `- ${s.name} (R$ ${s.price}, ${s.durationMinutes} min): ${s.description}`
  ).join('\n');

  const prompt = `
    Você é a assistente virtual sofisticada e prestativa do salão de beleza 'L'essence Studio', localizado na Parquelândia, Fortaleza.
    Slogan: "Sua essência, nossa arte."
    
    Serviços disponíveis:
    ${servicesContext}
    
    Responda à pergunta do cliente de forma curta, elegante e sugira um dos nossos serviços se for relevante.
    Se o cliente perguntar algo fora do contexto de beleza/salão, redirecione educadamente para nossos serviços.
    
    Cliente: "${userQuery}"
  `;

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não consegui formular uma resposta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tive um pequeno problema técnico. Por favor, tente novamente.";
  }
};