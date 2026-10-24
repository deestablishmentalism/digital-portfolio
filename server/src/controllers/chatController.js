import { GoogleGenAI } from "@google/genai";
import { PersonalInfo } from "../models/personalInfo.js";
import { Project } from "../models/project.js";
import { Skill } from "../models/skill.js";
import { Link } from "../models/link.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getPortfolioContext() {
  const [personalInfo, projects, skillDoc, links] = await Promise.all([
    PersonalInfo.findOne({}).lean(),
    Project.find({}).lean(),
    Skill.findOne({}).lean(),
    Link.find({}).lean(),
  ]);

  const sections = [];

  // --- Personal Info ---
  if (personalInfo) {
    const name = [personalInfo.first_name, personalInfo.middle_name, personalInfo.last_name]
      .filter(Boolean)
      .join(" ");
    let info = `PORTFOLIO OWNER\n`;
    if (name) info += `  Full Name: ${name}\n`;
    if (personalInfo.summary) info += `  Summary: ${personalInfo.summary}\n`;
    if (personalInfo.address) {
      const addr = personalInfo.address;
      const parts = [addr.house_number, addr.subdivision, addr.barangay, addr.city, addr.province, addr.region]
        .filter(Boolean)
        .join(", ");
      if (parts) info += `  Location: ${parts}\n`;
    }
    sections.push(info);
  }

  // --- Skills ---
  if (skillDoc?.skills) {
    const s = skillDoc.skills;
    let info = `SKILLS\n`;
    if (s.frontend?.length) info += `  Front-End: ${s.frontend.join(", ")}\n`;
    if (s.backend?.length) info += `  Back-End: ${s.backend.join(", ")}\n`;
    if (s.languages?.length) info += `  Languages: ${s.languages.join(", ")}\n`;
    if (s.tools?.length) info += `  Tools & Others: ${s.tools.join(", ")}\n`;
    sections.push(info);
  }

  // --- Projects ---
  if (projects?.length) {
    let info = `PROJECTS (${projects.length} total)\n`;
    for (const p of projects) {
      info += `  - ${p.project_name} (${p.project_type})\n`;
      info += `    Description: ${p.project_description}\n`;
      if (p.languages?.length) info += `    Tech Stack: ${p.languages.join(", ")}\n`;
      const start = p.project_start_date ? new Date(p.project_start_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";
      const end = p.project_end_date || "";
      if (start || end) info += `    Period: ${start}${end ? ` – ${end}` : ""}\n`;
    }
    sections.push(info);
  }

  // --- Contact Links ---
  const contactLinks = links?.filter((l) => l.in_contact);
  if (contactLinks?.length) {
    let info = `CONTACT LINKS\n`;
    for (const l of contactLinks) {
      info += `  - ${l.social}: ${l.link}\n`;
    }
    sections.push(info);
  }

  if (sections.length === 0) return "";
  return sections.join("\n");
}

export const sendMessage = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const portfolioContext = await getPortfolioContext();

    const systemInstruction =
      "You are a helpful AI assistant embedded in a developer's digital portfolio website. " +
      "You answer questions about the portfolio owner's skills, projects, experience, and contact info. " +
      "Be friendly, concise, and professional. Use the portfolio data below to give accurate answers.\n\n" +
      "--- PORTFOLIO DATA ---\n" +
      (portfolioContext || "(No portfolio data available yet.)") +
      "\n--- END PORTFOLIO DATA ---\n\n" +
      "Rules:\n" +
      "- Base your answers on the portfolio data above.\n" +
      "- If the data doesn't cover a question, say so honestly rather than making things up.\n" +
      "- Keep responses concise — a few sentences unless detail is requested.\n" +
      "- You may format responses with bullet points or short paragraphs for readability.";

    const chat = ai.chats.create({
      model: "gemini-3.5-flash-lite",
      history: history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
      config: {
        systemInstruction: systemInstruction,
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
