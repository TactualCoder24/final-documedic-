import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'local-api-mock',
          configureServer(server) {
            server.middlewares.use('/api/gemini', async (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
              }
              
              let body = '';
              req.on('data', chunk => body += chunk.toString());
              req.on('end', async () => {
                try {
                  if (!env.GEMINI_API_KEY) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'GEMINI_API_KEY not found in local env' }));
                    return;
                  }
                  
                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
                  const payload = JSON.parse(body);
                  const response = await ai.models.generateContent(payload);
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify({ text: response.text }));
                } catch (e: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            });
          }
        }
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
