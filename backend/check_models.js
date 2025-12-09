// backend/check_models.js
import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    console.log("Checking available models...");
    const response = await ai.models.list();
    
    console.log("\n--- AVAILABLE MODELS ---");
    response.models.forEach(model => {
      // We only care about models that support 'generateContent'
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`Name: ${model.name}`);
        console.log(`Display: ${model.displayName}`);
        console.log("-------------------------");
      }
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();