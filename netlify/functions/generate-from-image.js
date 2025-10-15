import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const { prompt, fileBase64, mimeType } = body;

    if (!fileBase64 || !mimeType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "fileBase64 and mimeType are required" }),
      };
    }

    const input = [
      { text: prompt || "Describe this image." },
      { inlineData: { data: fileBase64, mimeType } },
    ];

    const result = await model.generateContent(input);

    return {
      statusCode: 200,
      body: JSON.stringify({ response: result.response.text() }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
