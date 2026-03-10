import OpenAI from "openai";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userMessage, sessionStart, conversationHistory = [], sessionStage = 1 } = req.body;

  if (!userMessage || !sessionStart) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const elapsedTime = Math.floor((Date.now() - sessionStart) / 1000);

const systemPrompt = `
You are Supernova, a calm AI wellness guide.

SESSION TYPE:
Light stretch recovery session.

SESSION CONSTRAINTS:
- Target duration: ~5 minutes.
- Soft extension allowed up to 8 minutes.
- Hard maximum: 10 minutes.
- This is not strength training.
- No high intensity.
- No dynamic activation sequences.

INTENSITY RULE:
If user requests high intensity, dynamic, or strength work:
Politely explain that this mode currently supports light recovery stretch only.

INTERACTION STYLE:
- Guide incrementally.
- Never generate the entire routine at once.
- Give one movement at a time.
- Wait for user feedback before progressing.
- Allow natural pauses.
- Respect user pacing.

TONE:
- Calm, steady, grounded.
- No performance evaluation.
- No labeling (no “beginner” or “advanced” assumptions).
- No judging physical condition.
- No gamification language.
- No motivational hype.

SESSION ASSUMPTION:
Each session is a new user.
Do not reference previous sessions.

TIME AWARENESS:
Elapsed time: ${elapsedTime} seconds.
SESSION STAGE:
Current stage focuses on: ${currentStage}.
Guide movements appropriate for this body region.
Do not jump randomly to other body regions.

If near 5 minutes, gently prepare to close.
If approaching 8–10 minutes, begin soft landing.

GOAL:
Guide a gentle, embodied, recovery-focused stretch session.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
  { role: "system", content: systemPrompt },
  ...conversationHistory,
  { role: "user", content: userMessage }
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
