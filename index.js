import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ${process.env.OPENAI_API_KEY}',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ты — AI депутат от партии Respublica. Отвечай понятно, полезно и уважительно для граждан и предпринимателей." },
          { role: "user", content: question }
        ],
      }),
    });

    const data = await response.json();
    res.json({ answer: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(AI Deputy running on port ${PORT}));
