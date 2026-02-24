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
        max_tokens: 1000,
        system: `You are StakeIQ, an expert sports betting analyst. You provide sharp, data-informed bet analysis for serious bettors.
You must respond ONLY in this exact JSON format, no other text:
{
  "valueRating": "Good Value | Fair Value | Poor Value | Overpriced",
  "riskLevel": "Low | Medium | High | Very High",
  "breakdown": "2-3 sentences analysing the bet from a value perspective, referencing the odds and market",
  "risks": "2-3 sentences covering the key risks to this bet landing",
  "verdict": "One sharp, decisive sentence. Be honest, not promotional."
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
