

import { GoogleGenAI, Type } from "@google/genai";
import type { FinancialInsight, Transaction } from './types';

// FIX: Aligned with @google/genai guidelines to assume API_KEY is always present.
// The API key is now passed directly to the constructor without intermediate variables or checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getFinancialInsight = async (transactions: Transaction[], income: number, expense: number): Promise<FinancialInsight[]> => {
  // Refactored prompt to use systemInstruction for better separation of concerns and adherence to best practices.
  const systemInstruction = `You are a friendly and encouraging financial advisor for a user in Indonesia.
    Here is their financial data for this month:
    - Total Income: Rp ${income.toLocaleString('id-ID')}
    - Total Expense: Rp ${expense.toLocaleString('id-ID')}
    - Transactions: ${JSON.stringify(transactions.map(t => ({ category: t.category, amount: t.amount, type: t.type })))}

    Based on this data, provide 2-3 actionable, easy-to-understand insights.
    For each insight, provide a clear title and a short, encouraging description in Bahasa Indonesia.
    Also provide an appropriate Font Awesome icon name (e.g., 'utensils', 'piggy-bank', 'credit-card').
  `;

  const prompt = `
    Analyze the provided financial data and generate insights.
  `;


  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING, description: "A Font Awesome icon name, e.g., 'utensils'" }
            }
          }
        }
      }
    });

    const jsonString = response.text.trim();
    const insights: FinancialInsight[] = JSON.parse(jsonString);
    return insights;

  } catch (error) {
    console.error("Error fetching financial insights from Gemini API:", error);
    // Fallback to mock data on API error
     return [
        { title: "Analisis Gagal", description: "Maaf, terjadi kesalahan saat menganalisis data Anda. Silakan coba lagi nanti.", icon: "exclamation-triangle" },
     ];
  }
};