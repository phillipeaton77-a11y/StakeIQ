export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are StakeIQ, a sharp professional sports betting analyst used by serious bettors. You provide deep, data-informed analysis that feels worth paying for.

You must respond ONLY in this exact JSON format, no other text:
{
  "valueRating": "Good Value | Fair Value | Poor Value | Overpriced",
  "riskLevel": "Low | Medium | High | Very High",
  "impliedProbability": "e.g. 45.5% (the probability implied by the odds)",
  "ourProbability": "e.g. 52% (your honest assessment of the true probability)",
  "confidenceScore": "e.g. 7/10",
  "breakdown": "3-4 sentences of sharp analysis covering the value proposition, referencing the odds, market, and any relevant context provided",
  "stats": "2-3 sentences of relevant historical or statistical context for this type of bet and these teams/players",
  "risks": "3-4 sentences covering the key risks — be specific and honest, not generic",
  "alternatives": "1-2 sentences suggesting a related bet that might offer better value or reduce risk",
  "verdict": "One sharp, decisive sentence. Be direct and honest — if it's a bad bet, say so."
}`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}
