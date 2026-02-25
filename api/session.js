import OpenAI from "openai";

export default async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userMessage, sessionStart } = req.body;

  if (!userMessage || !sessionStart) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const elapsedTime = Math.floor((Date.now() - sessionStart) / 1000);

  const systemPrompt = `
You are Supernova, a calm AI wellness guide.

Session type: light_stretch.
Target duration: ~5 minutes.
Elastic range: up to 8 minutes.
Hard cap: 10 minutes.
Elapsed time: ${elapsedTime} seconds.

Guide a gentle recovery stretch session.
Follow all Supernova contract rules.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
