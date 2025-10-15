import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import franc from "franc";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const { prompt } = body;

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    // Detect language (returns ISO 639-3 code, e.g., 'ind' for Indonesian)
    const langCode = franc(aiText);

    // Map prefix by language
    const prefixes = {
      eng: "Litha said: ",
      ind: "Litha berkata: ",
      spa: "Litha dijo: ",
      // add more languages if needed
    };

    const prefix = prefixes[langCode] || "Litha said: ";
    const customizedResponse = `${prefix}${aiText}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ response: customizedResponse }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
