require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-haiku-4-5-20251001'; // fast + cheap, good fit for this classification-style task

const SYSTEM_PROMPT = `You are the fact-checking engine behind a news verification app called Suri.AI.
Given a claim, headline, or short article snippet pasted by a user, evaluate whether it is likely
true, likely false, or uncertain/unverifiable from the text alone.

Respond with ONLY a JSON object, no other text, no markdown fences, in exactly this shape:
{"verdict": "real" | "false" | "uncertain", "confidence": <integer 0-100>, "explanation": "<2-3 sentence explanation in a neutral, factual tone>"}`;

app.post('/api/fact-check', async (req, res) => {
  const claim = (req.body?.claim || '').trim();

  if (!claim) {
    return res.status(400).json({ error: 'Missing "claim" text in request body.' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Add it to server/.env and restart.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: claim }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ error: 'AI provider request failed.' });
    }

    const data = await response.json();
    const textBlock = data.content?.find(block => block.type === 'text');
    const raw = textBlock?.text?.trim() || '';

    let result;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { verdict: 'uncertain', confidence: 0, explanation: raw || 'Could not parse the AI response.' };
    }

    res.json(result);
  } catch (err) {
    console.error('Fact-check request failed:', err);
    res.status(500).json({ error: 'Something went wrong talking to the AI.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Suri.AI fact-check server running on http://localhost:${PORT}`);
});
