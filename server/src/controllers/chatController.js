import { GoogleGenAI } from "@google/genai";

console.log(
  "Gemini key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const sendMessage = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      history: history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
      config: {
        systemInstruction:
          "You are a helpful AI assistant embedded in a developer's digital portfolio website. " +
          "You can answer questions about the portfolio owner's skills, projects, and experience. " +
          "Be friendly, concise, and professional. If asked about specific portfolio data you don't have, " +
          "suggest the visitor check the relevant section of the site.",
      },
    });

    const response = await chat.sendMessage({ message });
    const text = response.text;

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: "Failed to get a response from AI." });
  }
};
