import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExpenseCategory, ScanResult } from "../types";

const parseReceiptImage = async (base64Image: string, mimeType: string): Promise<ScanResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      merchant: {
        type: Type.STRING,
        description: "The name of the store or merchant.",
      },
      total: {
        type: Type.NUMBER,
        description: "The total amount paid.",
      },
      date: {
        type: Type.STRING,
        description: "The date of the transaction in YYYY-MM-DD format. Use today's date if not found.",
      },
      category: {
        type: Type.STRING,
        enum: Object.values(ExpenseCategory),
        description: "The best fitting category for this expense.",
      },
      summary: {
        type: Type.STRING,
        description: "A very brief, 5-word summary of items bought (e.g. 'Milk, eggs, and bread').",
      },
    },
    required: ["merchant", "total", "category", "date"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze this receipt. Extract the merchant, total, date, and categorize it. If the date is missing, estimate based on current year or leave empty.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert receipt parser helper accounting assistant.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as ScanResult;
    return data;
  } catch (error) {
    console.error("Error parsing receipt:", error);
    throw error;
  }
};

export { parseReceiptImage };