/**
 * @file telemetryController.ts
 * @description Controller responsável por validar requisições HTTP, delegar chamadas para os repositórios
 * e retornar as respostas adequadas (códigos HTTP e JSON) para ingestion de telemetria e consulta de nós.
 */

import { Request, Response } from 'express';
import { TelemetryRepository } from '../repositories/telemetryRepository';

const repository = new TelemetryRepository();

/**
 * Controller de telemetria e monitoramento espacial.
 */
export class TelemetryController {
  /**
   * Ingere leituras de telemetria vindas do Simulador Python ou dos nós reais em campo.
   * Rota: POST /api/v1/telemetria
   */
  async ingest(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body;

      // Validação de presença dos campos obrigatórios
      if (!payload.device_id || payload.water_level_m === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: 'Campos obrigatórios ausentes: device_id e water_level_m' 
        });
      }

      // Salva os dados através do repositório
      const reading = await repository.saveReading(payload);

      return res.status(201).json({
        success: true,
        message: 'Telemetria armazenada com sucesso no PostGIS',
        data: reading,
      });
    } catch (error) {
      console.error('Erro na ingestão de telemetria:', error);
      return res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }

  /**
   * Retorna todas as estações com dados geoespaciais em formato GeoJSON.
   * Rota: GET /api/v1/estacoes
   */
  async listStations(req: Request, res: Response): Promise<Response> {
    try {
      const stations = await repository.getStationsGeoJSON();
      return res.status(200).json({ success: true, data: stations });
    } catch (error) {
      console.error('Erro ao buscar estações:', error);
      return res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }
}