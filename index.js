import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { franc } from "franc";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Detect language (returns ISO 639-3 code, e.g., 'ind' for Indonesian)

// Middleware
app.use(express.json());

// ===== Endpoint 1: Text =====
app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();
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
    res.json({ response: customizedResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Endpoint 2: Image =====
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imagePath = req.file.path;
    const imageBase64 = fs.readFileSync(imagePath, "base64");

    const input = [
      { text: prompt || "Describe this image." },
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageBase64,
        },
      },
    ];

    const result = await model.generateContent(input);
    fs.unlinkSync(imagePath); // hapus file setelah diproses
    res.json({ response: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Endpoint 3: Document =====
app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    try {
      const docPath = req.file.path;
      const docBase64 = fs.readFileSync(docPath, "base64");

      const input = [
        { text: "Summarize or analyze this document." },
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: docBase64,
          },
        },
      ];

      const result = await model.generateContent(input);
      fs.unlinkSync(docPath);
      res.json({ response: result.response.text() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===== Endpoint 4: Audio =====
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;
    const audioBase64 = fs.readFileSync(audioPath, "base64");

    const input = [
      { text: "Transcribe or analyze this audio file." },
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: audioBase64,
        },
      },
    ];

    const result = await model.generateContent(input);
    fs.unlinkSync(audioPath);
    res.json({ response: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Start Server =====
// if (require.main === module) {
app.listen(
  3000,
  // () => console.log("Server running on http://localhost:3000")
  () => console.log(`🚀 Gemini API Server running on http://localhost:${PORT}`)
);
// }
// app.listen(PORT, () => {
// });
