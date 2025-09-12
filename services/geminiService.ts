


import { GoogleGenAI, Type } from "@google/genai";
import type { FinancialInsight, Transaction, MonthlyTarget, DebtItem, SavingsGoal, UserCategory, TargetFormField, TransactionType } from '../types';

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

// FIX: Added the 'userCategories' parameter to the function signature to resolve a TypeScript error where it was being called with an incorrect number of arguments.
export const generateMonthlyTarget = async (prompt: string, debts: DebtItem[], savingsGoals: SavingsGoal[], userCategories: UserCategory[]): Promise<MonthlyTarget> => {
    const debtDetails = debts.map(d => `- ${d.name}: Cicilan bulanan Rp ${d.monthlyInstallment.toLocaleString('id-ID')}`).join('\n');
    const savingsDetails = savingsGoals.map(s => `- ${s.name}: Target Rp ${s.targetAmount.toLocaleString('id-ID')}`).join('\n');
    const availableCategoryNames = userCategories.map(c => c.name).join(', ');

    const systemInstruction = `You are a helpful financial planning assistant for a user in Indonesia. Your task is to generate a detailed monthly budget based on the user's prompt and existing financial goals.
    - Currency is Indonesian Rupiah (Rp).
    - Automatically include all provided debts and suggest a reasonable monthly savings amount for each savings goal.
    - Create other common expense and income items based on the user's prompt.
    - All amounts must be numbers without commas or symbols.
    - Structure the output as a JSON array of category objects. Each object must have a 'categoryName' (string) and 'items' (an array of budget items).
    - **Crucially, you must only use category names from this provided list**: ${availableCategoryNames}.
    - The 'id' for each item must be a unique string.

    **Existing User Debts (must be placed in an appropriate expense category):**
    ${debtDetails || 'No active debts.'}
    
    **Existing User Savings Goals (must be placed in an appropriate expense/savings category):**
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
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                categoryName: { type: Type.STRING },
                items: { type: Type.ARRAY, items: targetFormFieldSchema }
            },
            required: ['categoryName', 'items']
        }
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
        const generatedCategories: { categoryName: string; items: TargetFormField[] }[] = JSON.parse(jsonString);

        const newTarget: MonthlyTarget = {};
        const categoryNameMap = new Map(userCategories.map(c => [c.name, c.id]));

        generatedCategories.forEach(genCat => {
            const catId = categoryNameMap.get(genCat.categoryName);
            if (catId) {
                newTarget[catId] = genCat.items.map(item => ({
                    ...item,
                    id: item.id || `gen-${Math.random().toString(36).substr(2, 9)}`
                }));
            }
        });

        // Safety override: ensure debts and savings from user's goals are correctly placed
        const allGoals = [...debts, ...savingsGoals];
        allGoals.forEach(goal => {
            const catId = categoryNameMap.get(goal.name);
            if(catId) {
                const amount = 'monthlyInstallment' in goal ? goal.monthlyInstallment : 0;
                if (!newTarget[catId]) {
                    newTarget[catId] = [];
                }
                const existingItemIndex = newTarget[catId].findIndex(item => item.name === goal.name);
                const newItem = {
                    id: `goal-${goal.id}`,
                    name: goal.name,
                    amount: String(amount)
                };
                if (existingItemIndex > -1) {
                    newTarget[catId][existingItemIndex] = newItem;
                } else {
                    newTarget[catId].push(newItem);
                }
            }
        });


        return newTarget;
    } catch (error) {
        console.error("Error generating monthly target from Gemini API:", error);
        throw new Error("Gagal membuat target dengan AI. Silakan coba lagi.");
    }
};