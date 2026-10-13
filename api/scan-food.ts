import { analyzeMealImage } from '../server/geminiService.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType } = req.body;
    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : '';
    const result = await analyzeMealImage(cleanBase64, mimeType || 'image/jpeg');
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to analyze meal' });
  }
}
