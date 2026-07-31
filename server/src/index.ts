/**
 * @file index.ts
 * @description Ponto de entrada do servidor backend.
 * Carrega as variáveis de ambiente, testa a conexão com o banco PostGIS e inicia o serviço HTTP.
 */

import dotenv from 'dotenv';
import app from './app';
import { testConnection } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  console.log('🔄 Iniciando Americas TechGuard API...');

  const isDbConnected = await testConnection();

  if (!isDbConnected) {
    console.warn('⚠️ A API está iniciando sem conexão ativa com o banco.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 API Americas TechGuard rodando na porta ${PORT}`);
    console.log(`📍 Endpoint de saúde: http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('❌ Erro fatal na inicialização:', err);
});