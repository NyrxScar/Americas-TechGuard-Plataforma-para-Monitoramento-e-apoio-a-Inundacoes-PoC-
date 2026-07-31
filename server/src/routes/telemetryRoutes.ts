/**
 * @file telemetryRoutes.ts
 * @description Mapeamento de rotas HTTP relacionadas à telemetria IoT e estações de monitoramento.
 */

import { Router } from 'express';
import { TelemetryController } from '../controllers/telemetryController';

const router = Router();
const controller = new TelemetryController();

// Rota para o simulador enviar as leituras periódicas
router.post('/telemetria', (req, res) => controller.ingest(req, res));

// Rota para a interface gráfica consultar o mapa de nós Mesh/LoRaWAN
router.get('/estacoes', (req, res) => controller.listStations(req, res));

export default router;