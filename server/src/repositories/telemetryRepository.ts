/**
 * @file telemetryRepository.ts
 * @description Repositório responsável por executar as queries SQL e interagir diretamente 
 * com o banco de dados PostGIS (tabelas: leituras_sensores e estacoes_monitoramento).
 */

import { pool } from '../config/database';

/**
 * Interface que representa a estrutura dos dados de telemetria recebidos do simulador/sensores IoT.
 */
export interface TelemetryPayload {
  device_id: string;
  water_level_m: number;
  rain_mm: number;
  risk_level: string;
  network_mode: string;
  mesh_hops?: number;
  battery_pct?: number;
}

/**
 * Classe responsável por abstrair as operações de persistência e consulta espacial.
 */
export class TelemetryRepository {
  /**
   * Persiste uma nova leitura de sensor no banco de dados.
   * @param data Payload contendo os dados de telemetria do nó monitorado.
   * @returns O ID gerado e o timestamp da gravação.
   */
  async saveReading(data: TelemetryPayload) {
    const query = `
      INSERT INTO leituras_sensores 
        (codigo_dispositivo, nivel_rio_m, chuva_acumulada_mm, nivel_risco, modo_rede, mesh_hops, bateria_pct)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, data_hora;
    `;
    const values = [
      data.device_id,
      data.water_level_m,
      data.rain_mm,
      data.risk_level,
      data.network_mode,
      data.mesh_hops || 0,
      data.battery_pct || 100,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Consulta todas as estações de monitoramento cadastradas, convertendo a geometria PostGIS
   * diretamente para o formato GeoJSON para consumo facilitado no Frontend GIS.
   * @returns Lista de estações de monitoramento com atributos e geometria GeoJSON.
   */
  async getStationsGeoJSON() {
    const query = `
      SELECT 
        e.id,
        e.codigo_estacao,
        e.nome,
        e.rio,
        e.bairro,
        e.cota_alerta_m,
        e.cota_transbordo_m,
        ST_AsGeoJSON(e.geom)::json AS location
      FROM estacoes_monitoramento e;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}