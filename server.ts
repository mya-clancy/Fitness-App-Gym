import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeMealImage, chatWithFitnessAi } from './server/geminiService.ts';
import { getAllAccounts, getAccount, saveAccount, getAllSplits, saveSplits } from './server/accountDatabase.ts';

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

// Overall Cross-Device Database Routes for Hunter Accounts & Workout Splits
app.get('/api/accounts', (_req, res) => {
  try {
    const accounts = getAllAccounts();
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get accounts' });
  }
});

app.get('/api/accounts/:username', (req, res) => {
  try {
    const account = getAccount(req.params.username);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get account' });
  }
});

app.post('/api/accounts/sync', (req, res) => {
  try {
    const { account } = req.body;
    if (!account || !account.username) {
      return res.status(400).json({ error: 'Invalid account data' });
    }
    saveAccount(account);
    res.json({ success: true, account: getAccount(account.username) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync account' });
  }
});

app.get('/api/splits', (_req, res) => {
  try {
    const splits = getAllSplits();
    res.json(splits);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get splits' });
  }
});

app.post('/api/splits/sync', (req, res) => {
  try {
    const { splits } = req.body;
    if (!Array.isArray(splits)) {
      return res.status(400).json({ error: 'Splits must be an array' });
    }
    saveSplits(splits);
    res.json({ success: true, splits: getAllSplits() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync splits' });
  }
});

app.use(express.static(path.join(process.cwd(), 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
