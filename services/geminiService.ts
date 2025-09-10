

import { GoogleGenAI, Type } from "@google/genai";
import type { FinancialInsight, Transaction, MonthlyTarget, DebtItem, SavingsGoal } from '../types';

// Aligned with @google/genai guidelines to assume API_KEY is always present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateMonthlyTarget = async (prompt: string, debts: DebtItem[], savingsGoals: SavingsGoal[]): Promise<MonthlyTarget> => {
    const debtDetails = debts.map(d => `- ${d.name}: Cicilan bulanan Rp ${d.monthlyInstallment.toLocaleString('id-ID')}`).join('\n');
    const savingsDetails = savingsGoals.map(s => `- ${s.name}: Target Rp ${s.targetAmount.toLocaleString('id-ID')}`).join('\n');

    const systemInstruction = `You are a helpful financial planning assistant for a user in Indonesia. Your task is to generate a detailed monthly budget based on the user's prompt and existing financial goals.
    - Currency is Indonesian Rupiah (Rp).
    - Automatically include all provided debts and suggest a reasonable monthly savings amount for each savings goal.
    - Create other common expense items based on the user's prompt (e.g., rent, food, transport).
    - All amounts must be numbers without commas or symbols.
    - Structure the output strictly according to the provided JSON schema. Do not add any extra fields. The 'id' for each item must be a unique string.

    **Existing User Debts (must be included in 'cicilanUtang'):**
    ${debtDetails || 'No active debts.'}
    
    **Existing User Savings Goals (must be included in 'tabungan'):**
    ${savingsDetails || 'No active savings goals.'}
    `;

    const targetFormFieldSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique string for this item, e.g., using UUID." },
            name: { type: Type.STRING },
            amount: { type: Type.STRING, description: "Amount as a string of numbers, e.g., '1500000'." },
        },
        required: ['id', 'name', 'amount']
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            pendapatan: { type: Type.ARRAY, items: targetFormFieldSchema },
            cicilanUtang: { type: Type.ARRAY, items: targetFormFieldSchema },
            pengeluaranUtama: { type: Type.ARRAY, items: targetFormFieldSchema },
            kebutuhan: { type: Type.ARRAY, items: targetFormFieldSchema },
            penunjang: { type: Type.ARRAY, items: targetFormFieldSchema },
            pendidikan: { type: Type.ARRAY, items: targetFormFieldSchema },
            tabungan: { type: Type.ARRAY, items: targetFormFieldSchema },
        },
        required: ['pendapatan', 'cicilanUtang', 'pengeluaranUtama', 'kebutuhan', 'penunjang', 'pendidikan', 'tabungan']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            }
        });

        const jsonString = response.text.trim();
        const generatedTarget: MonthlyTarget = JSON.parse(jsonString);
        
        // Ensure all items have a unique ID, fallback if model fails
        Object.keys(generatedTarget).forEach(key => {
            const section = key as keyof MonthlyTarget;
            if (Array.isArray(generatedTarget[section])) {
                generatedTarget[section].forEach(item => {
                    if (!item.id) {
                        item.id = `gen-${Math.random().toString(36).substr(2, 9)}`;
                    }
                });
            }
        });

        return generatedTarget;
    } catch (error) {
        console.error("Error generating monthly target from Gemini API:", error);
        throw new Error("Gagal membuat target dengan AI. Silakan coba lagi.");
    }
};
