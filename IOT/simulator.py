from __future__ import annotations

import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Set

import folium

# ==========================================
# CONFIGURAÇÃO DE DIRETÓRIOS E TOPOLOGIA
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = (
    BASE_DIR.parent
    if BASE_DIR.name in ["IOT", "src", "simulators"]
    else BASE_DIR
)
DATA_DIR = PROJECT_ROOT / "data"

TOPOLOGIA_CADASTRADA: Dict[str, Dict[str, float]] = {
    "ATG_BLU_001": {"latitude": -26.9165, "longitude": -49.0715},
    "ATG_BLU_002": {"latitude": -26.9201, "longitude": -49.0652},
    "ATG_BLU_003": {"latitude": -26.9112, "longitude": -49.0820},
}

ESTADOS_REDE_VALIDOS: Set[str] = {
    "connected",
    "debouncing",
    "fallback_active",
    "unavailable",
}


# ==========================================
# VALIDADOR DE TELEMETRIA (CONTRATO)
# ==========================================


class TelemetryValidator:
    """Validador estrito de contrato de telemetria IoT."""

    @staticmethod
    def is_valid_uuid_v4(val: str) -> bool:
        try:
            parsed = uuid.UUID(val)
            return parsed.version == 4
        except (ValueError, TypeError, AttributeError):
            return False

    @classmethod
    def validar_payload(
        cls, payload: Dict[str, Any], topologia_ativa: Set[str]
    ) -> List[str]:
        erros: List[str] = []

        campos_obrigatorios = [
            "message_id",
            "station_id",
            "timestamp",
            "network_status",
            "simulated_mqtt_topic",
            "simulation_processing_time_ms",
            "readings",
            "battery",
        ]
        for campo in campos_obrigatorios:
            if campo not in payload:
                erros.append(f"Campo obrigatório ausente: {campo}")

        if erros:
            return erros

        if not cls.is_valid_uuid_v4(payload["message_id"]):
            erros.append(
                f"message_id '{payload['message_id']}' inválido: Deve ser estritamente um UUID v4."
            )

        station_id = payload["station_id"]
        if station_id not in topologia_ativa:
            erros.append(
                f"station_id '{station_id}' não pertence à topologia cadastrada no sistema."
            )

        try:
            datetime.fromisoformat(payload["timestamp"])
        except (ValueError, TypeError):
            erros.append(
                f"timestamp '{payload['timestamp']}' fora do formato ISO 8601 UTC."
            )

        if payload["network_status"] not in ESTADOS_REDE_VALIDOS:
            erros.append(
                f"network_status '{payload['network_status']}' não reconhecido."
            )

        battery = payload.get("battery", {})
        if not isinstance(battery.get("level_percent"), (int, float)) or not (
            0 <= battery["level_percent"] <= 100
        ):
            erros.append("Nível de bateria (level_percent) deve estar entre 0 e 100.")

        readings = payload.get("readings", {})
        if "water_level_m" in readings:
            if not (0 <= readings["water_level_m"] <= 20.0):
                erros.append("water_level_m fora dos limites físicos (0 a 20m).")

        if "rainfall_accumulated_mm" in readings:
            if not (0 <= readings["rainfall_accumulated_mm"] <= 500.0):
                erros.append(
                    "rainfall_accumulated_mm fora dos limites físicos (0 a 500mm)."
                )

        return erros


# ==========================================
# COMPACTADOR E ANÁLISE ESTRUTURAL
# ==========================================


class PayloadCompactor:
    """Compacta a estrutura JSON para estimativa de espaço de payload."""

    @staticmethod
    def compactar(payload: Dict[str, Any]) -> Dict[str, Any]:
        compacto = {
            "mid": payload["message_id"],
            "sid": payload["station_id"],
            "ts": payload["timestamp"],
            "net": payload["network_status"],
            "bat": payload["battery"]["level_percent"],
            "rd": {},
        }
        readings = payload.get("readings", {})
        if "water_level_m" in readings:
            compacto["rd"]["wl"] = readings["water_level_m"]
        if "rainfall_accumulated_mm" in readings:
            compacto["rd"]["rf"] = readings["rainfall_accumulated_mm"]
        return compacto

    @staticmethod
    def analisar_economia_estrutural(
        original: Dict[str, Any], compactado: Dict[str, Any]
    ) -> Dict[str, Any]:
        bytes_original = len(json.dumps(original).encode("utf-8"))
        bytes_compactado = len(json.dumps(compactado).encode("utf-8"))
        economia_bytes = bytes_original - bytes_compactado
        percentual = (
            (economia_bytes / bytes_original) * 100 if bytes_original > 0 else 0
        )

        return {
            "bytes_original_json": bytes_original,
            "bytes_compactado_json": bytes_compactado,
            "economia_estimada_bytes": economia_bytes,
            "reducao_percentual": round(percentual, 2),
            "nota_explicativa": (
                "A redução refere-se exclusivamente à economia estimada na "
                "estrutura do payload JSON. Não representa economia real de "
                "banda em redes LoRaWAN ou Meshtastic."
            ),
        }


# ==========================================
# MOTOR DO SIMULADOR IOT
# ==========================================


class IoTSimulator:
    def __init__(self, topologia: Dict[str, Dict[str, float]]):
        self.topologia = topologia
        self.baterias: Dict[str, float] = {
            sid: 100.0 for sid in topologia.keys()
        }

    def gerar_telemetria_ciclo(
        self, ciclo: int, cenario_falha: str = "NORMAL"
    ) -> List[Dict[str, Any]]:
        payloads = []

        for idx, (station_id, coords) in enumerate(self.topologia.items()):
            tempo_inicio = time.perf_counter()

            self.baterias[station_id] = max(
                0.0, self.baterias[station_id] - 0.05
            )

            # Definição determinística do estado simulado da rede
            if cenario_falha == "INDISPONIBILIDADE_DUPLA":
                network_status = "unavailable"
            elif cenario_falha == "DEGRADACAO_LORA":
                # Alterna entre debouncing e fallback_active combinando ciclo e índice da estação
                network_status = (
                    "debouncing" if (ciclo + idx) % 2 == 1 else "fallback_active"
                )
            else:
                network_status = "connected"

            water_level = round(1.5 + (ciclo * 0.4), 2)
            rainfall_accumulated = round(0.0 + (ciclo * 2.5), 1)

            time.sleep(0.001)
            tempo_fim = time.perf_counter()
            proc_time_ms = round((tempo_fim - tempo_inicio) * 1000, 3)

            payload = {
                "message_id": str(uuid.uuid4()),
                "station_id": station_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "location": coords,
                "network_status": network_status,
                "simulated_mqtt_topic": (
                    f"americas_techguard/simulated/{station_id}/telemetry"
                ),
                "simulation_processing_time_ms": proc_time_ms,
                "battery": {
                    "level_percent": round(self.baterias[station_id], 2)
                },
                "readings": {
                    "water_level_m": water_level,
                    "rainfall_accumulated_mm": rainfall_accumulated,
                },
            }
            payloads.append(payload)

        return payloads


# ==========================================
# GERADOR DE MAPA COM CONSOLIDAÇÃO POR TIMESTAMP
# ==========================================


def gerar_mapa_interativo(
    todos_payloads: List[Dict[str, Any]], caminho_saida: Path
) -> None:
    mapa = folium.Map(location=[-26.9165, -49.0715], zoom_start=13)

    ciclos: Dict[int, List[Dict[str, Any]]] = {}
    for i, p in enumerate(todos_payloads):
        ciclo_idx = (i // len(TOPOLOGIA_CADASTRADA)) + 1
        ciclos.setdefault(ciclo_idx, []).append(p)

    for ciclo_num, registros in ciclos.items():
        camada = folium.FeatureGroup(name=f"Ciclo {ciclo_num}", show=False)
        for p in registros:
            folium.Marker(
                location=[
                    p["location"]["latitude"],
                    p["location"]["longitude"],
                ],
                popup=(
                    f"Estação: {p['station_id']}<br>"
                    f"Status Rede: {p['network_status']}"
                ),
                icon=folium.Icon(color="blue", icon="info-sign"),
            ).add_to(camada)
        camada.add_to(mapa)

    camada_consolidada = folium.FeatureGroup(
        name="Estado Mais Recente (Consolidado)", show=True
    )

    ultimos_estados: Dict[str, Dict[str, Any]] = {}
    for p in todos_payloads:
        sid = p["station_id"]
        ts = datetime.fromisoformat(p["timestamp"])

        if sid not in ultimos_estados:
            ultimos_estados[sid] = p
        else:
            ts_existente = datetime.fromisoformat(
                ultimos_estados[sid]["timestamp"]
            )
            if ts > ts_existente:
                ultimos_estados[sid] = p

    for sid, p in ultimos_estados.items():
        folium.Marker(
            location=[p["location"]["latitude"], p["location"]["longitude"]],
            popup=(
                f"<b>Último Estado Consolidado</b><br>"
                f"Estação: {sid}<br>"
                f"Rede: {p['network_status']}<br>"
                f"TS: {p['timestamp']}<br>"
                f"Nível Água: {p['readings']['water_level_m']}m<br>"
                f"Chuva Acum: {p['readings']['rainfall_accumulated_mm']}mm"
            ),
            icon=folium.Icon(color="green", icon="cloud"),
        ).add_to(camada_consolidada)

    camada_consolidada.add_to(mapa)
    folium.LayerControl().add_to(mapa)
    mapa.save(str(caminho_saida))


# ==========================================
# EXECUÇÃO PRINCIPAL COM PRINTS DE FEEDBACK
# ==========================================

if __name__ == "__main__":
    print("=" * 65)
    print("   AMERICAS TECHGUARD - SIMULADOR IOT")
    print("=" * 65)

    print(f"[1/5] Garantindo diretório de dados compartilhado: {DATA_DIR}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    simulador = IoTSimulator(TOPOLOGIA_CADASTRADA)
    todos_payloads = []

    print("[2/5] Gerando ciclos determinísticos de simulação...")

    # Ciclo 1
    print("  ├─ Gerando Ciclo 1 (Cenário: NORMAL)...")
    p1 = simulador.gerar_telemetria_ciclo(
        ciclo=1, cenario_falha="NORMAL"
    )
    todos_payloads.extend(p1)
    print(f"  │  └─ {len(p1)} estações simuladas com sucesso.")

    # Ciclo 2
    print("  ├─ Gerando Ciclo 2 (Cenário: DEGRADACAO_LORA)...")
    p2 = simulador.gerar_telemetria_ciclo(
        ciclo=2, cenario_falha="DEGRADACAO_LORA"
    )
    todos_payloads.extend(p2)
    print(f"  │  └─ {len(p2)} estações simuladas com sucesso.")

    # Ciclo 3
    print("  └─ Gerando Ciclo 3 (Cenário: INDISPONIBILIDADE_DUPLA)...")
    p3 = simulador.gerar_telemetria_ciclo(
        ciclo=3, cenario_falha="INDISPONIBILIDADE_DUPLA"
    )
    todos_payloads.extend(p3)
    print(f"     └─ {len(p3)} estações simuladas com sucesso.")

    topologia_ativa = set(TOPOLOGIA_CADASTRADA.keys())

    print(
        f"\n[3/5] Validando contratos telemétricos "
        f"({len(todos_payloads)} payloads)..."
    )
    erros_encontrados = 0
    for i, p in enumerate(todos_payloads, 1):
        erros = TelemetryValidator.validar_payload(p, topologia_ativa)
        if erros:
            erros_encontrados += len(erros)
            print(f"  ├─ [FALHA] Payload #{i} ({p['station_id']}): {erros}")
        else:
            print(
                f"  ├─ [OK] Payload #{i:02d} | "
                f"UUIDv4: {p['message_id'][:8]}... | "
                f"Estação: {p['station_id']} | "
                f"Rede: {p['network_status']}"
            )

    if erros_encontrados == 0:
        print(
            "  └─ Validação concluída: "
            "100% dos payloads estão em conformidade com o contrato."
        )
    else:
        print(
            f"  └─ Validação concluída com "
            f"{erros_encontrados} erro(s) encontrado(s)."
        )

    print("\n[4/5] Analisando compactação estrutural (JSON payload)...")
    p_amostra = todos_payloads[0]
    p_compacto = PayloadCompactor.compactar(p_amostra)
    analise_comp = PayloadCompactor.analisar_economia_estrutural(
        p_amostra, p_compacto
    )
    print(
        f"  ├─ Tamanho JSON original: {analise_comp['bytes_original_json']} bytes"
    )
    print(
        f"  ├─ Tamanho JSON compactado: {analise_comp['bytes_compactado_json']} bytes"
    )
    print(
        f"  └─ Economia de estrutura estimada: {analise_comp['reducao_percentual']}%"
    )

    saida_simulacao = {
        "metadados": {
            "gerado_em": datetime.now(timezone.utc).isoformat(),
            "total_registros": len(todos_payloads),
            "analise_compactacao_amostra": analise_comp,
        },
        "telemetria": todos_payloads,
    }

    caminho_telemetria = DATA_DIR / "telemetry_output.json"
    caminho_mapa = DATA_DIR / "mapa_estacoes.html"

    print("\n[5/5] Escrevendo arquivos de saída...")
    with open(caminho_telemetria, "w", encoding="utf-8") as f:
        json.dump(saida_simulacao, f, indent=2, ensure_ascii=False)
    print(f"  ├─ Arquivo JSON gerado: {caminho_telemetria}")

    gerar_mapa_interativo(todos_payloads, caminho_mapa)
    print(f"  └─ Mapa Folium gerado: {caminho_mapa}")

    print("\n" + "=" * 65)
    print("   SIMULAÇÃO IOT CONCLUÍDA COM SUCESSO!")
    print("=" * 65 + "\n")