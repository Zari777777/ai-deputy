// index.js — CommonJS

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // v2.x, как в твоём package.json

const app = express();
app.use(cors());              // разрешаем запросы с GitHub Pages
app.use(express.json());      // JSON body

// health-check (то, что ты видишь {"ok":true,"service":"ai-deputy"})
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "ai-deputy" });
});

app.post("/ask", async (req, res) => {
  const { question = "" } = req.body || {};

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Bearer ${process.env.OPENAI_API_KEY}',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты — AI депутат от партии Respublica. Отвечай понятно, полезно и уважительно для граждан и предпринимателей.",
          },
          { role: "user", content: question },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      return res.status(500).json({ error: "OpenAI API error", details: txt });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? "Извини, не смог сформировать ответ.";
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('AI Deputy running on port ${PORT}'));
