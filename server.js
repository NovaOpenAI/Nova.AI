import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();

// Allow all origins (important for GitHub Pages)
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { chat, message } = req.body;

    // Build messages in the new format
    const messages = [
      { role: "system", content: "You are Nova, an AI assistant. Respond clearly and naturally." },
      ...chat.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      })),
      { role: "user", content: message }
    ];

    // New OpenAI endpoint
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages
    });

    let reply = completion.choices[0].message.content;

    // Rename chat (title)
    let title = null;
    if (chat.length === 0) {
      const titleResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: `Generate a 2–4 word title for this message: "${message}"` }
        ]
      });
      title = titleResponse.choices[0].message.content;
    }

    res.json({ reply, title });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI did not respond. (Server Error)" });
  }
});

// IMPORTANT: use 0.0.0.0 for Render hosting
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
