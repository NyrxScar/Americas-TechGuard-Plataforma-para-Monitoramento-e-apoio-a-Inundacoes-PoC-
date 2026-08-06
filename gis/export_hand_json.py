from __future__ import annotations
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import numpy as np
import rasterio
from pyproj import Transformer


BASE_DIR = Path(__file__).resolve().parent

HAND_PATH = (
    BASE_DIR
    / "outputs_hand"
    / "hand.tif"
)
OUTPUT_PATH = (
    BASE_DIR.parent
    / "data"
    / "processed"
    / "hand_metrics.json"
)
AREA_NAME = "Blumenau/SC"
SCHEMA_VERSION = "1.0.0"

# Exporta um ponto a cada 5 pixels.
SAMPLE_STEP = 5

MAX_HAND_METERS = 25.0


def classificar_hand(
    hand_m: float,
) -> dict[str, Any]:
    # Classifica o valor HAND e define seu peso
    # para o cálculo posterior do risco.

    if hand_m <= 3.0:
        return {
            "classe": "ALTA",
            "classe_id": 0,
            "faixa_metros": "0-3",
            "peso_risco": 1.00,
        }

    if hand_m <= 10.0:
        return {
            "classe": "MEDIA",
            "classe_id": 1,
            "faixa_metros": "3-10",
            "peso_risco": 0.60,
        }

    if hand_m <= 25.0:
        return {
            "classe": "BAIXA",
            "classe_id": 2,
            "faixa_metros": "10-25",
            "peso_risco": 0.25,
        }

    return {
        "classe": "MUITO_BAIXA",
        "classe_id": 3,
        "faixa_metros": ">25",
        "peso_risco": 0.05,
    }


# Validação

def valor_hand_valido(
    valor: float,
    nodata: float | None,
) -> bool:
    
    # Verifica se o valor do raster pode ser utilizado.
    

    if not math.isfinite(valor):

        return False

    if nodata is not None:

        if math.isclose(
            valor,
            float(nodata),
            rel_tol=0.0,
            abs_tol=0.0001,
        ):

            return False

    if valor < 0:

        return False

    return True

# Exportação

def exportar_hand_para_json(
    hand_path: Path,
    output_path: Path,
    sample_step: int = SAMPLE_STEP,
) -> None:
    
    # Converte o raster HAND em métricas espaciais
    # utilizáveis pelo Risk Engine.
    
    if not hand_path.exists():

        raise FileNotFoundError(
            "Raster HAND não encontrado.\n"
            f"Caminho esperado: {hand_path}"
        )

    if sample_step < 1:

        raise ValueError(
            "SAMPLE_STEP deve ser maior ou igual a 1."
        )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("=" * 80)
    print("AMERICAS TECHGUARD")
    print("EXPORTAÇÃO DE MÉTRICAS HAND")
    print("=" * 80)

    print(
        f"\n[INFO] Raster: {hand_path}"
    )

    print(
        f"[INFO] Saída: {output_path}"
    )

    print(
        f"[INFO] Amostragem: "
        f"1 ponto a cada {sample_step} pixel(s)"
    )

    metricas: list[
        dict[str, Any]
    ] = []

    contagem_classes = {
        "ALTA": 0,
        "MEDIA": 0,
        "BAIXA": 0,
        "MUITO_BAIXA": 0,
    }

    with rasterio.open(
        hand_path
    ) as src:

        if src.crs is None:

            raise ValueError(
                "O raster HAND não possui CRS definido."
            )

        print(
            f"[INFO] CRS: {src.crs}"
        )

        print(
            f"[INFO] Dimensões: "
            f"{src.width} x {src.height}"
        )

        print(
            f"[INFO] Resolução: "
            f"{src.res}"
        )

        transformer = Transformer.from_crs(
            src.crs,
            "EPSG:4326",
            always_xy=True,
        )

        hand_array = src.read(
            1,
            masked=True,
        )

        linhas = range(
            0,
            src.height,
            sample_step,
        )

        total_linhas = len(
            linhas
        )

        for indice_linha, row in enumerate(
            linhas,
            start=1,
        ):

            for col in range(
                0,
                src.width,
                sample_step,
            ):

                valor = hand_array[
                    row,
                    col,
                ]

                if np.ma.is_masked(
                    valor
                ):

                    continue

                hand_m = float(
                    valor
                )

                if not valor_hand_valido(
                    hand_m,
                    src.nodata,
                ):

                    continue

                x, y = src.xy(
                    row,
                    col,
                    offset="center",
                )

                longitude, latitude = (
                    transformer.transform(
                        x,
                        y,
                    )
                )

                classificacao = (
                    classificar_hand(
                        hand_m
                    )
                )

                metricas.append(
                    {
                        "id": (
                            f"HAND_"
                            f"{row}_"
                            f"{col}"
                        ),
                        "latitude": round(
                            float(latitude),
                            7,
                        ),
                        "longitude": round(
                            float(longitude),
                            7,
                        ),
                        "hand_m": round(
                            hand_m,
                            3,
                        ),
                        "classe": (
                            classificacao[
                                "classe"
                            ]
                        ),
                        "classe_id": (
                            classificacao[
                                "classe_id"
                            ]
                        ),
                        "faixa_metros": (
                            classificacao[
                                "faixa_metros"
                            ]
                        ),
                        "peso_risco": (
                            classificacao[
                                "peso_risco"
                            ]
                        ),
                    }
                )

                classe = (
                    classificacao[
                        "classe"
                    ]
                )

                contagem_classes[
                    classe
                ] += 1

            percentual = (
                indice_linha
                / total_linhas
                * 100
            )

            print(
                f"\r[PROCESSANDO] "
                f"{percentual:6.2f}%"
                f" | Pontos: "
                f"{len(metricas):,}",
                end="",
                flush=True,
            )

    print()

    documento = {
        "schema_version": (
            SCHEMA_VERSION
        ),
        "tipo": (
            "HAND_SPATIAL_METRICS"
        ),
        "area": (
            AREA_NAME
        ),
        "gerado_em": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),
        "fonte": {
            "modelo": (
                "Height Above "
                "Nearest Drainage"
            ),
            "arquivo_raster": (
                hand_path.name
            ),
            "unidade": "metros",
            "sample_step": (
                sample_step
            ),
            "max_hand_operacional_m": (
                MAX_HAND_METERS
            ),
        },
        "classificacao": {
            "ALTA": {
                "intervalo_m": "0-3",
                "peso_risco": 1.00,
            },
            "MEDIA": {
                "intervalo_m": "3-10",
                "peso_risco": 0.60,
            },
            "BAIXA": {
                "intervalo_m": "10-25",
                "peso_risco": 0.25,
            },
            "MUITO_BAIXA": {
                "intervalo_m": ">25",
                "peso_risco": 0.05,
            },
        },
        "resumo": {
            "total_metricas": (
                len(metricas)
            ),
            "alta": (
                contagem_classes[
                    "ALTA"
                ]
            ),
            "media": (
                contagem_classes[
                    "MEDIA"
                ]
            ),
            "baixa": (
                contagem_classes[
                    "BAIXA"
                ]
            ),
            "muito_baixa": (
                contagem_classes[
                    "MUITO_BAIXA"
                ]
            ),
        },
        "metricas": metricas,
    }

    with output_path.open(
        "w",
        encoding="utf-8",
    ) as arquivo:

        json.dump(
            documento,
            arquivo,
            ensure_ascii=False,
            indent=2,
        )

    alt_output_path = BASE_DIR.parent / "data" / "hand_metrics.json"
    with alt_output_path.open(
        "w",
        encoding="utf-8",
    ) as arquivo_alt:

        json.dump(
            documento,
            arquivo_alt,
            ensure_ascii=False,
            indent=2,
        )

    tamanho_mb = (
        output_path.stat().st_size
        / 1024
        / 1024
    )
    print("\n" + "=" * 80)
    print("EXPORTAÇÃO CONCLUÍDA")
    print("=" * 80)

    print(
        f"\n[SUCESSO] "
        f"{len(metricas):,} "
        f"métricas exportadas."
    )
    print(
        f"[SUCESSO] JSON: "
        f"{output_path}"
    )
    print(
        f"[INFO] Tamanho: "
        f"{tamanho_mb:.2f} MB"
    )
    print(
        "\n[RESUMO]"
    )
    print(
        f"  Alta: "
        f"{contagem_classes['ALTA']:,}"
    )
    print(
        f"  Média: "
        f"{contagem_classes['MEDIA']:,}"
    )
    print(
        f"  Baixa: "
        f"{contagem_classes['BAIXA']:,}"
    )
    print(
        f"  Muito baixa: "
        f"{contagem_classes['MUITO_BAIXA']:,}"
    )
    print(
        "\n" + "=" * 80
    )

# Ex

def main() -> None:

    exportar_hand_para_json(
        hand_path=HAND_PATH,
        output_path=OUTPUT_PATH,
        sample_step=SAMPLE_STEP,
    )

if __name__ == "__main__":

    main()
