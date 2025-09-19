const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-deputy" });
});

app.post("/ask", async (req, res) => {
  try {
    const question = (req.body?.question || "").trim();
    if (!question) return res.status(400).json({ error: "Question is required" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ты — AI депутат от партии Republica. Отвечай понятно, полезно и уважительно для граждан и предпринимателей." },
          { role: "user", content: question }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      return res.status(502).json({ error: "OpenAI API error", details: txt });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content ?? "Извини, не смог сформировать ответ.";
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`AI Deputy running on port ${PORT}`));
