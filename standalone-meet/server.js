import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Serve static frontend build
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: '3-Way Dedicated Interpreter Meeting Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Standalone 3-Way Meeting Portal running at:`);
  console.log(`👉 Local: http://localhost:${PORT}`);
  console.log(`👉 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`====================================================`);
});
