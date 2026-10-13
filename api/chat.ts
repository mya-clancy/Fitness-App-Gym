import { chatWithFitnessAi } from '../server/geminiService.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, hunterContext } = req.body;
    const reply = await chatWithFitnessAi(messages || [], hunterContext);
    return res.status(200).json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process chat' });
  }
}
