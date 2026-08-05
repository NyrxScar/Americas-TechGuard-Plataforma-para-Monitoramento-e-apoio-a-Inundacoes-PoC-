from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from pyproj import Transformer
from scipy.spatial import KDTree

# ==========================================
# CONFIGURAÇÃO DE DIRETÓRIOS E CONSTANTES
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = (
    BASE_DIR.parent
    if BASE_DIR.name in ["IOT", "src", "risk"]
    else BASE_DIR
)
DATA_DIR = PROJECT_ROOT / "data"

# Raio máximo de busca espacial (em metros) para vincular estação à métrica HAND
MAX_HAND_DISTANCE_METERS = 500.0


class RiskEngine:
    """Motor de Risco Multicritério da Plataforma Americas TechGuard."""

    def __init__(self, hand_metrics_path: Path):
        self.hand_metrics_path = hand_metrics_path
        self.hand_data: List[Dict[str, Any]] = []
        self.kdtree: Optional[KDTree] = None
        self.coordenadas_hand_utm: List[Tuple[float, float]] = []

        # Transformação de coordenadas geográficas para
        # SIRGAS 2000 / UTM zona 22S, com unidades em metros
        self.transformador_utm = Transformer.from_crs(
            "EPSG:4326",
            "EPSG:31982",
            always_xy=True,
        )

        self._carregar_hand_metrics()

    def _carregar_hand_metrics(self) -> None:
        if not self.hand_metrics_path.exists():
            print(
                f"  └─ [AVISO] Arquivo HAND metrics não encontrado: "
                f"{self.hand_metrics_path.name}. O motor executará em modo de contingência."
            )
            return

        try:
            with open(self.hand_metrics_path, "r", encoding="utf-8") as f:
                doc = json.load(f)
                self.hand_data = doc.get("metricas", [])

            if self.hand_data:
                self.coordenadas_hand_utm = []
                for metrica in self.hand_data:
                    lon = metrica["longitude"]
                    lat = metrica["latitude"]
                    x, y = self.transformador_utm.transform(lon, lat)
                    self.coordenadas_hand_utm.append((x, y))

                self.kdtree = KDTree(self.coordenadas_hand_utm)
                print(
                    f"  └─ [OK] {len(self.hand_data)} pontos HAND projetados para UTM "
                    f"e indexados via KDTree a partir de {self.hand_metrics_path.name}."
                )
        except Exception as e:
            print(
                f"  └─ [ERRO] Falha ao carregar {self.hand_metrics_path.name}: {e}. "
                f"Ativando modo de contingência."
            )

    def buscar_hand_mais_proximo(
        self, lat: float, lon: float
    ) -> Tuple[Optional[Dict[str, Any]], Optional[float]]:
        if self.kdtree is None or not self.hand_data:
            return None, None

        x, y = self.transformador_utm.transform(lon, lat)
        distancia_m, indice = self.kdtree.query([x, y])
        distancia_m = float(distancia_m)

        if distancia_m > MAX_HAND_DISTANCE_METERS:
            return None, distancia_m

        return self.hand_data[indice], distancia_m

    def calcular_risco_estacao(
        self, payload_telemetria: Dict[str, Any]
    ) -> Dict[str, Any]:
        readings = payload_telemetria.get("readings", {})
        coords = payload_telemetria.get("location", {})

        water_level = readings.get("water_level_m", 0.0)
        rainfall_accumulated = readings.get("rainfall_accumulated_mm", 0.0)
        lat = coords.get("latitude")
        lon = coords.get("longitude")

        hand_point = None
        distancia_hand_m = None

        if lat is not None and lon is not None:
            hand_point, distancia_hand_m = self.buscar_hand_mais_proximo(lat, lon)

        if hand_point is None:
            return self._avaliar_contingencia_sem_hand(
                water_level, rainfall_accumulated, distancia_hand_m
            )

        hand_m = hand_point["hand_m"]
        peso_risco_hand = hand_point["peso_risco"]
        classe_hand = hand_point["classe"]

        if water_level >= 2.5:
            classificacao = "CRITICO"
            justificativa = (
                f"Nível crítico de água ({water_level}m) superou o limiar de emergência. "
                f"Suscetibilidade local HAND: {classe_hand} ({hand_m}m)."
            )

        elif water_level >= 1.2 and peso_risco_hand >= 0.60:
            classificacao = "ALERTA"
            justificativa = (
                f"Nível de água moderado ({water_level}m) em zona de elevada vulnerabilidade topográfica "
                f"(HAND {hand_m}m - Classe {classe_hand}). Risco elevado pelo terreno."
            )

        elif water_level >= 1.2 and peso_risco_hand < 0.60:
            classificacao = "ATENCAO"
            justificativa = (
                f"Nível de água moderado ({water_level}m), porém a topografia elevada "
                f"(HAND {hand_m}m - Classe {classe_hand}) reduz o risco imediato."
            )

        elif rainfall_accumulated > 30.0 or water_level > 0.8:
            classificacao = "ATENCAO"
            justificativa = (
                f"Chuva acumulada ({rainfall_accumulated}mm) ou cota inicial ({water_level}m) "
                f"requerem monitoramento."
            )

        else:
            classificacao = "SEGURO"
            justificativa = (
                "Parâmetros hidrológicos e topográficos dentro dos limites operacionais normais."
            )

        return {
            "hand_value_m": hand_m,
            "hand_risk_factor": peso_risco_hand,
            "topographic_susceptibility": classe_hand,
            "hand_match_distance_m": (
                round(distancia_hand_m, 2)
                if distancia_hand_m is not None
                else None
            ),
            "risk_classification": classificacao,
            "risk_justification": justificativa,
            "contingency_mode": False,
        }

    def _avaliar_contingencia_sem_hand(
        self,
        water_level: float,
        rainfall_accumulated: float,
        distancia_hand_m: Optional[float] = None,
    ) -> Dict[str, Any]:
        if water_level >= 2.2:
            classificacao = "CRITICO"
        elif water_level >= 1.5:
            classificacao = "ALERTA"
        elif water_level >= 0.8 or rainfall_accumulated > 20.0:
            classificacao = "ATENCAO"
        else:
            classificacao = "SEGURO"

        justificativa = (
            "Dado geoespacial HAND ausente ou fora da distância máxima de correspondência "
            f"({MAX_HAND_DISTANCE_METERS}m). Classificação realizada estritamente por regra "
            "de contingência de telemetria."
        )

        return {
            "hand_value_m": None,
            "hand_risk_factor": None,
            "topographic_susceptibility": "INDETERMINADO",
            "hand_match_distance_m": (
                round(distancia_hand_m, 2)
                if distancia_hand_m is not None
                else None
            ),
            "risk_classification": classificacao,
            "risk_justification": justificativa,
            "contingency_mode": True,
        }


# ==========================================
# EXECUÇÃO PRINCIPAL COM PRINTS DE FEEDBACK
# ==========================================

if __name__ == "__main__":
    print("=" * 65)
    print("   AMERICAS TECHGUARD - MOTOR DE RISCO (RISK ENGINE)")
    print("=" * 65)

    print(f"[1/4] Configurando diretório de dados: {DATA_DIR}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Definição dos caminhos alinhada à estrutura do projeto (telemetry_output.json)
    TELEMETRY_PATH = DATA_DIR / "telemetry_output.json"
    TELEMETRY_FILE = TELEMETRY_PATH  # Alias para compatibilidade
    HAND_METRICS_PATH = DATA_DIR / "hand_metrics.json"
    OUTPUT_RISK_PATH = DATA_DIR / "telemetry_processed_with_risk.json"

    print(f"[2/4] Carregando arquivo de telemetria: {TELEMETRY_PATH.name}")
    if not TELEMETRY_PATH.exists():
        raise FileNotFoundError(
            f"Arquivo de telemetria não encontrado em: {TELEMETRY_PATH}. "
            "Execute simulator.py primeiro para gerar o telemetry_output.json."
        )

    with open(TELEMETRY_PATH, "r", encoding="utf-8") as f:
        dados_simulacao = json.load(f)

    payloads = dados_simulacao.get("telemetria", [])
    print(f"  └─ {len(payloads)} mensagens de telemetria prontas para processamento.")

    print("[3/4] Inicializando RiskEngine e construindo índice espacial UTM...")
    engine = RiskEngine(hand_metrics_path=HAND_METRICS_PATH)

    print("\n[4/4] Processando e avaliando risco das estações...")
    payloads_processados = []
    resumo_risco = {"SEGURO": 0, "ATENCAO": 0, "ALERTA": 0, "CRITICO": 0}
    total_contingencia = 0

    for i, payload in enumerate(payloads, 1):
        sid = payload["station_id"]
        net_status = payload["network_status"]
        wl = payload["readings"]["water_level_m"]
        rf = payload["readings"]["rainfall_accumulated_mm"]

        avaliacao_risco = engine.calcular_risco_estacao(payload)
        classificacao = avaliacao_risco["risk_classification"]

        if avaliacao_risco["contingency_mode"]:
            total_contingencia += 1

        resumo_risco[classificacao] = resumo_risco.get(classificacao, 0) + 1

        payload_enriquecido = {
            **payload,
            "risk_assessment": avaliacao_risco,
        }
        payloads_processados.append(payload_enriquecido)

        hand_str = (
            f"{avaliacao_risco['hand_value_m']}m"
            if avaliacao_risco["hand_value_m"] is not None
            else "N/A"
        )
        dist_str = (
            f"{avaliacao_risco['hand_match_distance_m']}m"
            if avaliacao_risco["hand_match_distance_m"] is not None
            else "N/A"
        )

        print(
            f"  ├─ Registro #{i:02d} | Estação: {sid} | Água: {wl:.2f}m | "
            f"Chuva: {rf:.1f}mm | HAND: {hand_str} (Dist: {dist_str}) | "
            f"Rede: {net_status} -> RISCO: [{classificacao}]"
        )

    resultado_final = {
        "metadados": {
            "processado_em": datetime.now(timezone.utc).isoformat(),
            "motor_risco": "Americas TechGuard Geo-Risk Engine v1.0",
            "fonte_hand": str(HAND_METRICS_PATH.name),
            "max_hand_distance_meters": MAX_HAND_DISTANCE_METERS,
            "total_processado": len(payloads_processados),
            "resumo_classificacao": resumo_risco,
            "total_execucoes_contingencia": total_contingencia,
        },
        "telemetria_com_risco": payloads_processados,
    }

    with open(OUTPUT_RISK_PATH, "w", encoding="utf-8") as f:
        json.dump(resultado_final, f, indent=2, ensure_ascii=False)

    print("\n" + "-" * 65)
    print("   RESUMO FINAL DE CLASSIFICAÇÃO DE RISCO")
    print("-" * 65)
    print(f"  ├─ SEGURO:       {resumo_risco['SEGURO']}")
    print(f"  ├─ ATENÇÃO:      {resumo_risco['ATENCAO']}")
    print(f"  ├─ ALERTA:       {resumo_risco['ALERTA']}")
    print(f"  ├─ CRÍTICO:      {resumo_risco['CRITICO']}")
    print(f"  └─ CONTINGÊNCIA: {total_contingencia} registro(s) processados sem matriz HAND")

    print(f"\n[SAÍDA] Telemetria enriquecida salva em: {OUTPUT_RISK_PATH}")
    print("\n" + "=" * 65)
    print("   AVALIAÇÃO DE RISCO CONCLUÍDA COM SUCESSO!")
    print("=" * 65 + "\n")