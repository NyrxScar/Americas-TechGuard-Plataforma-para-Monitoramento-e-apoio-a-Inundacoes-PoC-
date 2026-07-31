/**
 * @file app.ts
 * @description Configuração principal e inicialização do servidor Express.
 * Define middlewares globais (CORS, JSON Parser), checagem de saúde (/health)
 * e registra os agrupamentos de rotas da API.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { pool } from './config/database';
import telemetryRoutes from './routes/telemetryRoutes';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

/**
 * @route   GET /health
 * @desc    Endpoint de diagnóstico da API e status da conexão com PostGIS
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

// Registra os endpoints de telemetria e estações com prefixo da v1
app.use('/api/v1', telemetryRoutes);

export default app;