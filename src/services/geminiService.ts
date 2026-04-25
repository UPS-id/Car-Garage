import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface IdentifiedCar {
  make: string;
  model: string;
  year: number;
  hp: number;
  specs: string;
  trivia: string;
}

export async function identifyCarFromImage(base64Image: string, mimeType: string): Promise<IdentifiedCar> {
  const prompt = "Identify this car. Provide the make, model, year, estimated horsepower, key technical specs, and a short piece of interesting trivia. Focus on JDM cars if applicable.";

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [imagePart, { text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          make: { type: Type.STRING },
          model: { type: Type.STRING },
          year: { type: Type.NUMBER },
          hp: { type: Type.NUMBER },
          specs: { type: Type.STRING },
          trivia: { type: Type.STRING },
        },
        required: ["make", "model", "year", "hp", "specs", "trivia"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as IdentifiedCar;
}
