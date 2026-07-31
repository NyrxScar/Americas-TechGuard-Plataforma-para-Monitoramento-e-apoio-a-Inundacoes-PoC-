/**
 * @file database.ts
 * @description Configuração do pool de conexões com o banco de dados PostgreSQL/PostGIS.
 * Responsável por gerenciar o ciclo de vida das conexões e disponibilizar o cliente do banco para os repositórios.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Pool de conexões do PostgreSQL utilizando as credenciais de ambiente.
 */
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'americas_techguard',
});

// Evento disparado quando uma nova conexão é criada no pool
pool.on('connect', () => {
  console.log('⚡ Conexão estabelecida com o pool PostgreSQL/PostGIS!');
});

// Tratamento de erros inesperados em clientes ociosos do pool
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
});

/**
 * Executa uma query simples de teste para validar se o PostgreSQL/PostGIS está acessível.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('⚡ Teste de conexão com PostGIS concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Falha ao conectar no PostgreSQL/PostGIS:', (error as Error).message);
    return false;
  }
}