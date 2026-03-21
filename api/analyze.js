// Vercel serverless function — proxies Groq API with hidden key
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const { prompt, model = 'llama-3.1-8b-instant' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    const data = await groqRes.json();
    if (!groqRes.ok) return res.status(groqRes.status).json({ error: data.error?.message || 'Groq error' });

    return res.status(200).json({ text: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
