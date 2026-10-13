import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { analyzeMealImage, chatWithFitnessAi } from './server/geminiService.ts';
import { getAllAccounts, getAccount, saveAccount, getAllSplits, saveSplits } from './server/accountDatabase.ts';

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/scan-food' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { imageBase64, mimeType } = JSON.parse(body);
              const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : '';
              const result = await analyzeMealImage(cleanBase64, mimeType || 'image/jpeg');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Failed to analyze meal' }));
            }
          });
          return;
        }

        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { messages, hunterContext } = JSON.parse(body);
              const reply = await chatWithFitnessAi(messages || [], hunterContext);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Failed to process chat' }));
            }
          });
          return;
        }

        if (req.url === '/api/accounts' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(getAllAccounts()));
          return;
        }

        if (req.url?.startsWith('/api/accounts/') && req.method === 'GET') {
          const username = decodeURIComponent(req.url.replace('/api/accounts/', '').split('?')[0]);
          const account = getAccount(username);
          if (!account) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Account not found' }));
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(account));
          }
          return;
        }

        if (req.url === '/api/accounts/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { account } = JSON.parse(body);
              if (account && account.username) {
                saveAccount(account);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, account: getAccount(account.username) }));
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid account data' }));
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Failed to sync account' }));
            }
          });
          return;
        }

        if (req.url === '/api/splits' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(getAllSplits()));
          return;
        }

        if (req.url === '/api/splits/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { splits } = JSON.parse(body);
              if (Array.isArray(splits)) {
                saveSplits(splits);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, splits: getAllSplits() }));
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Splits must be an array' }));
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Failed to sync splits' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
