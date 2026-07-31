import express, { Request, Response } from 'express';
import cors from 'cors';
import { pool } from './config/database.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

/**
 * @route   GET /health
 * @desc    Endpoint de diagnóstico da API e PostgreSQL
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbStatus = await pool.query('SELECT 1');
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'Connected' : 'Disconnected',
      service: 'Americas TechGuard API'
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: (error as Error).message
    });
  }
});

export default app;