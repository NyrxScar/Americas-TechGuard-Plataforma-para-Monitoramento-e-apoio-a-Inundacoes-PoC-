import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'techguard_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Testa conectividade com PostgreSQL / PostGIS
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), PostGIS_Full_Version()');
    
    console.log('✅ Conexão com PostgreSQL/PostGIS estabelecida!');
    console.log(`📌 Horário do Banco: ${result.rows[0].now}`);
    console.log(`🌐 Versão PostGIS: ${result.rows[0].postgis_full_version}`);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão com o banco:', (error as Error).message);
    return false;
  }
};