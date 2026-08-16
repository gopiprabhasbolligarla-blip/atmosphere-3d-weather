import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to backend folder
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Atmosphere 3D Weather API',
    time: new Date().toISOString()
  });
});

// Register Authentication REST Routes
app.use('/api/auth', authRoutes);

// Register User Profile & History REST Routes
app.use('/api/user', userRoutes);

// Start Express Backend Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Atmosphere Weather Backend API Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
