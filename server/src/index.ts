import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  console.log('🔄 Iniciando Americas TechGuard API...');
  
  const isDbConnected = await testConnection();
  
  if (!isDbConnected) {
    console.warn('⚠️ A API está iniciando sem conexão ativa com o banco.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Endpoint de saúde: http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('❌ Erro fatal na inicialização:', err);
});