import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeMealImage, chatWithFitnessAi } from './server/geminiService.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

app.post('/api/scan-food', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : '';
    const result = await analyzeMealImage(cleanBase64, mimeType || 'image/jpeg');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to analyze meal' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, hunterContext } = req.body;
    const reply = await chatWithFitnessAi(messages || [], hunterContext);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process chat' });
  }
});

app.use(express.static(path.join(process.cwd(), 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
