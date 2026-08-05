from __future__ import annotations

import logging
import os
import sys
import time
import zipfile
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

# CONFIGURAÇÕES GERAIS

SHOW_PLOTS = False
KEEP_INTERMEDIATES = False
FORCE_REPROCESS = False

IBGE_YEAR = 2023
OTTO_LEVELS = [5]
THRESHOLD_CELLS = 2000

REQUEST_TIMEOUT = 180
DOWNLOAD_CHUNK_SIZE = 1024 * 1024

# IMPORTS

try:
    import contextily as cx
    import folium
    import geopandas as gpd
    import matplotlib.colors as colors
    import matplotlib.pyplot as plt
    import numpy as np
    import planetary_computer
    import rasterio
    import requests
    import rioxarray as rxr
    import xarray as xr

    from pystac_client import Client
    from rasterio.mask import mask
    from shapely.ops import unary_union

except ImportError as err:
    print("\n" + "=" * 80)
    print("[ERRO] UMA DEPENDÊNCIA DO PROJETO NÃO ESTÁ INSTALADA")
    print("=" * 80)
    print(f"\nDetalhe: {err}")
    print("\nAtive a .venv e execute:")
    print("    pip install -r requirements.txt")
    print("=" * 80)
    sys.exit(1)


try:
    from whitebox import WhiteboxTools

except ImportError:
    try:
        from whitebox.whitebox_tools import WhiteboxTools

    except ImportError:
        print("\n[ERRO] O pacote WhiteboxTools não foi encontrado.")
        print("Instale com:")
        print("    pip install whitebox")
        sys.exit(1)


# UTILITÁRIOS

def formatar_tempo(segundos: float) -> str:
    """Converte segundos para um formato legível."""
    segundos = int(segundos)

    horas, resto = divmod(segundos, 3600)
    minutos, segundos = divmod(resto, 60)

    if horas:
        return f"{horas}h {minutos}min {segundos}s"

    if minutos:
        return f"{minutos}min {segundos}s"

    return f"{segundos}s"


def configurar_logger(base_dir: Path) -> logging.Logger:
    """Configura logs no terminal e em arquivo."""

    logs_dir = base_dir / "logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    log_path = logs_dir / "pipeline_hand.log"

    logger = logging.getLogger("americas_techguard")
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    arquivo_handler = logging.FileHandler(
        log_path,
        encoding="utf-8",
    )
    arquivo_handler.setFormatter(formatter)

    logger.addHandler(arquivo_handler)

    return logger


def mensagem(
    texto: str,
    nivel: str = "INFO",
    logger: Optional[logging.Logger] = None,
) -> None:
    """Exibe mensagens padronizadas no terminal e no log."""

    prefixos = {
        "INFO": "[INFO]",
        "ETAPA": "[ETAPA]",
        "SUCESSO": "[SUCESSO]",
        "AVISO": "[AVISO]",
        "ERRO": "[ERRO]",
        "CACHE": "[CACHE]",
        "ARQUIVO": "[ARQUIVO]",
    }

    prefixo = prefixos.get(nivel, "[INFO]")
    print(f"{prefixo} {texto}", flush=True)

    if logger:
        if nivel == "ERRO":
            logger.error(texto)

        elif nivel == "AVISO":
            logger.warning(texto)

        else:
            logger.info(texto)


def iniciar_etapa(
    numero: int,
    total: int,
    nome: str,
    logger: Optional[logging.Logger] = None,
) -> float:
    """Mostra o início de uma etapa."""

    print("\n" + "─" * 80)

    mensagem(
        f"ETAPA {numero}/{total} — {nome}",
        "ETAPA",
        logger,
    )

    print("─" * 80)

    return time.perf_counter()


def finalizar_etapa(
    nome: str,
    inicio: float,
    logger: Optional[logging.Logger] = None,
) -> None:
    """Mostra a duração da etapa."""

    duracao = time.perf_counter() - inicio

    mensagem(
        f"{nome} concluída em {formatar_tempo(duracao)}.",
        "SUCESSO",
        logger,
    )


def validar_arquivo(
    arquivo: Path,
    descricao: str,
) -> None:
    """Valida se um arquivo foi criado corretamente."""

    if not arquivo.exists():
        raise FileNotFoundError(
            f"{descricao} não foi criado.\n"
            f"Caminho esperado: {arquivo}"
        )

    tamanho = arquivo.stat().st_size

    if tamanho == 0:
        raise RuntimeError(
            f"{descricao} foi criado, mas está vazio.\n"
            f"Caminho: {arquivo}"
        )


def salvar_ou_exibir(
    figura,
    caminho: Path,
    logger: Optional[logging.Logger] = None,
) -> None:
    """
    Salva a figura e, opcionalmente, abre uma janela.

    SHOW_PLOTS = False:
        Salva e fecha automaticamente.

    SHOW_PLOTS = True:
        Salva e abre a janela.
    """

    figura.savefig(
        caminho,
        dpi=250,
        bbox_inches="tight",
    )

    mensagem(
        f"Visualização salva: {caminho}",
        "ARQUIVO",
        logger,
    )

    if SHOW_PLOTS:
        mensagem(
            "Janela de visualização aberta. Feche-a para continuar.",
            "INFO",
            logger,
        )

        plt.show()

    else:
        plt.close(figura)


# ==============================================================================
# DIRETÓRIOS
# ==============================================================================

def configurar_diretorios(
    base_dir: Optional[Path] = None,
) -> Dict[str, Path]:

    if base_dir is None:
        base_dir = Path(__file__).resolve().parent

    diretorios = {
        "base": base_dir,
        "logs": base_dir / "logs",
        "outputs_dem": base_dir / "outputs_dem",
        "outputs_hand": base_dir / "outputs_hand",
        "output_maps": base_dir / "output_maps",
    }

    for caminho in diretorios.values():
        caminho.mkdir(
            parents=True,
            exist_ok=True,
        )

    return diretorios


# DOWNLOAD

def download_arquivo(
    url: str,
    destino: Path,
    timeout: int = REQUEST_TIMEOUT,
    logger: Optional[logging.Logger] = None,
) -> None:
    """
    Baixa um arquivo mostrando progresso aproximado.
    """

    destino.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    arquivo_temporario = destino.with_suffix(
        destino.suffix + ".part"
    )

    mensagem(
        f"Iniciando download: {destino.name}",
        "INFO",
        logger,
    )

    try:
        with requests.get(
            url,
            timeout=timeout,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 "
                    "(Americas-TechGuard)"
                )
            },
            stream=True,
        ) as resposta:

            resposta.raise_for_status()

            tamanho_total = int(
                resposta.headers.get(
                    "content-length",
                    0,
                )
            )

            baixado = 0
            ultimo_percentual = -1

            with open(
                arquivo_temporario,
                "wb",
            ) as arquivo:

                for bloco in resposta.iter_content(
                    chunk_size=DOWNLOAD_CHUNK_SIZE
                ):

                    if not bloco:
                        continue

                    arquivo.write(bloco)
                    baixado += len(bloco)

                    if tamanho_total > 0:

                        percentual = int(
                            baixado
                            / tamanho_total
                            * 100
                        )

                        if (
                            percentual >=
                            ultimo_percentual + 10
                        ):

                            print(
                                f"       Progresso: "
                                f"{percentual}%",
                                flush=True,
                            )

                            ultimo_percentual = percentual

        arquivo_temporario.replace(
            destino
        )

        validar_arquivo(
            destino,
            "Arquivo baixado",
        )

        mensagem(
            f"Download concluído: {destino.name}",
            "SUCESSO",
            logger,
        )

    except Exception:

        if arquivo_temporario.exists():
            arquivo_temporario.unlink()

        raise


# API ARCGIS

def consultar_arcgis_bbox(
    url: str,
    bbox: Tuple[
        float,
        float,
        float,
        float,
    ],
    filtro: str = "1=1",
    tamanho_pagina: int = 2000,
    timeout: int = REQUEST_TIMEOUT,
    logger: Optional[
        logging.Logger
    ] = None,
) -> Dict[str, Any]:

    x1, y1, x2, y2 = bbox

    lista_features = []
    deslocamento = 0
    pagina = 1

    while True:

        mensagem(
            f"Consultando ANA/SNIRH "
            f"— página {pagina}...",
            "INFO",
            logger,
        )

        parametros = {
            "f": "geojson",
            "where": filtro,
            "outFields": "*",
            "returnGeometry": "true",
            "spatialRel":
                "esriSpatialRelIntersects",
            "geometryType":
                "esriGeometryEnvelope",
            "geometry":
                f"{x1},{y1},{x2},{y2}",
            "inSR": 3857,
            "outSR": 3857,
            "resultRecordCount":
                tamanho_pagina,
            "resultOffset":
                deslocamento,
        }

        resposta = requests.post(
            url,
            data=parametros,
            timeout=timeout,
        )

        resposta.raise_for_status()

        dados_json = resposta.json()

        if "error" in dados_json:

            raise RuntimeError(
                "Erro retornado pela "
                f"API ArcGIS: "
                f"{dados_json['error']}"
            )

        features = dados_json.get(
            "features",
            [],
        )

        lista_features.extend(
            features
        )

        mensagem(
            f"{len(features)} feições "
            "recebidas nesta página.",
            "INFO",
            logger,
        )

        if len(features) < tamanho_pagina:
            break

        deslocamento += tamanho_pagina
        pagina += 1

    mensagem(
        f"Total de feições recebidas: "
        f"{len(lista_features)}.",
        "SUCESSO",
        logger,
    )

    return {
        "type": "FeatureCollection",
        "features": lista_features,
    }


# VETORES IBGE E ANA

def obter_vetores_hidrologicos(
    outdir: Path,
    logger: Optional[
        logging.Logger
    ] = None,
    ibge_year: int = IBGE_YEAR,
    levels: Optional[list] = None,
) -> Tuple[
    gpd.GeoDataFrame,
    gpd.GeoDataFrame,
    Path,
]:

    if levels is None:
        levels = OTTO_LEVELS

    blumenau_gpkg = (
        outdir /
        "blumenau_boundary.gpkg"
    )

    ottos_raw_gpkg = (
        outdir /
        "ottobacias_blumenau_raw.gpkg"
    )

    ottos_union_gpkg = (
        outdir /
        "ottobacias_blumenau_union.gpkg"
    )

    if (
        not FORCE_REPROCESS
        and ottos_raw_gpkg.exists()
        and ottos_union_gpkg.exists()
    ):

        mensagem(
            "Vetores já processados "
            "foram encontrados.",
            "CACHE",
            logger,
        )

        ottos = gpd.read_file(
            ottos_raw_gpkg
        )

        try:
            uniao = gpd.read_file(
                ottos_union_gpkg,
                layer="contrib_union",
            )

        except Exception:

            uniao = gpd.read_file(
                ottos_union_gpkg
            )

        return (
            ottos,
            uniao,
            ottos_union_gpkg,
        )

    ibge_zip = (
        outdir /
        f"BR_Municipios_"
        f"{ibge_year}.zip"
    )

    ibge_extract_dir = (
        outdir /
        f"ibge_municipios_"
        f"{ibge_year}"
    )

    try:

        mensagem(
            "Obtendo limites municipais "
            "do IBGE...",
            "INFO",
            logger,
        )

        ibge_url_br = (
            "https://geoftp.ibge.gov.br/"
            "organizacao_do_territorio/"
            "malhas_territoriais/"
            "malhas_municipais/"
            f"municipio_{ibge_year}/"
            "Brasil/"
            f"BR_Municipios_"
            f"{ibge_year}.zip"
        )

        if not ibge_zip.exists():

            download_arquivo(
                ibge_url_br,
                ibge_zip,
                logger=logger,
            )

        else:

            mensagem(
                "Arquivo IBGE já existe. "
                "Download ignorado.",
                "CACHE",
                logger,
            )

        if not ibge_extract_dir.exists():

            mensagem(
                "Extraindo arquivos "
                "do IBGE...",
                "INFO",
                logger,
            )

            ibge_extract_dir.mkdir(
                parents=True,
                exist_ok=True,
            )

            with zipfile.ZipFile(
                ibge_zip,
                "r",
            ) as zip_ref:

                zip_ref.extractall(
                    ibge_extract_dir
                )

        shps = list(
            ibge_extract_dir.rglob(
                "*.shp"
            )
        )

        if not shps:

            raise FileNotFoundError(
                "Nenhum Shapefile "
                "foi encontrado."
            )

        mensagem(
            "Lendo malha municipal...",
            "INFO",
            logger,
        )

        malha = gpd.read_file(
            shps[0]
        )

        nomes = (
            malha["NM_MUN"]
            .astype(str)
            .str.strip()
            .str.upper()
        )

        if "SIGLA_UF" in malha.columns:

            blumenau = malha[
                (nomes == "BLUMENAU")
                &
                (
                    malha["SIGLA_UF"]
                    .astype(str)
                    .str.upper()
                    == "SC"
                )
            ].copy()

        else:

            blumenau = malha[
                nomes == "BLUMENAU"
            ].copy()

        if blumenau.empty:

            raise ValueError(
                "Blumenau/SC não foi "
                "encontrada na malha."
            )

        blumenau = (
            blumenau
            .to_crs(4326)
        )

        blumenau.to_file(
            blumenau_gpkg,
            layer="blumenau",
            driver="GPKG",
        )

        mensagem(
            "Limite de Blumenau "
            "processado.",
            "SUCESSO",
            logger,
        )

        mensagem(
            "Consultando Ottobacias "
            "da ANA/SNIRH...",
            "INFO",
            logger,
        )

        bho_url = (
            "https://www.snirh.gov.br/"
            "arcgis/rest/services/"
            "SPR/"
            "BHO2017_50K_AREADRENAGEM/"
            "MapServer/0/query"
        )

        blumenau_3857 = (
            blumenau
            .to_crs(3857)
        )

        bbox = (
            blumenau_3857
            .total_bounds
        )

        filtro = (
            "nunivotto IN "
            f"({','.join(map(str, levels))})"
        )

        dados = consultar_arcgis_bbox(
            bho_url,
            bbox=bbox,
            filtro=filtro,
            logger=logger,
        )

        features = dados.get(
            "features",
            [],
        )

        if not features:

            mensagem(
                "Nenhuma feição encontrada "
                "no nível solicitado. "
                "Tentando consulta ampla...",
                "AVISO",
                logger,
            )

            dados = (
                consultar_arcgis_bbox(
                    bho_url,
                    bbox=bbox,
                    filtro="1=1",
                    logger=logger,
                )
            )

            features = dados.get(
                "features",
                [],
            )

        if not features:

            raise RuntimeError(
                "A ANA não retornou "
                "Ottobacias para Blumenau."
            )

        ottos = (
            gpd.GeoDataFrame
            .from_features(features)
            .set_crs(3857)
        )

        ottos = ottos[
            ottos.intersects(
                blumenau_3857
                .geometry
                .iloc[0]
            )
        ].copy()

        if ottos.empty:

            raise ValueError(
                "Nenhuma Ottobacia "
                "intercepta Blumenau."
            )

        ottos_4326 = (
            ottos
            .to_crs(4326)
        )

        ottos_4326.to_file(
            ottos_raw_gpkg,
            layer="ottobacias_raw",
            driver="GPKG",
        )

        mensagem(
            f"{len(ottos_4326)} "
            "Ottobacias processadas.",
            "SUCESSO",
            logger,
        )

        mensagem(
            "Unificando polígonos "
            "para gerar a máscara DEM...",
            "INFO",
            logger,
        )

        geometria_unida = (
            unary_union(
                ottos.geometry
            )
        )

        uniao = (
            gpd.GeoDataFrame(
                {
                    "name": [
                        "contrib_union"
                    ]
                },
                geometry=[
                    geometria_unida
                ],
                crs=3857,
            )
            .to_crs(4326)
        )

        uniao.to_file(
            ottos_union_gpkg,
            layer="contrib_union",
            driver="GPKG",
        )

        return (
            ottos_4326,
            uniao,
            ottos_union_gpkg,
        )

    except Exception as err:

        mensagem(
            f"Falha na aquisição "
            f"online: {err}",
            "AVISO",
            logger,
        )

        if (
            ottos_raw_gpkg.exists()
            and
            ottos_union_gpkg.exists()
        ):

            mensagem(
                "Ativando dados locais "
                "de contingência.",
                "CACHE",
                logger,
            )

            ottos = gpd.read_file(
                ottos_raw_gpkg
            )

            try:

                uniao = gpd.read_file(
                    ottos_union_gpkg,
                    layer="contrib_union",
                )

            except Exception:

                uniao = gpd.read_file(
                    ottos_union_gpkg
                )

            return (
                ottos,
                uniao,
                ottos_union_gpkg,
            )

        raise


# ==============================================================================
# MAPA DAS OTTOBACIAS
# ==============================================================================
# llllllllllllllllllllllllllllllllllllllllllllllllll
def gerar_visualizacoes_bacias(
    ottos4326: gpd.GeoDataFrame,
    output_dir: Path,
    logger: Optional[logging.Logger] = None,
) -> None:

    if ottos4326.crs is None:
        raise ValueError(
            "Ottobacias sem CRS definido."
        )

    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    png_path = (
        output_dir /
        "ottobacias_blumenau.png"
    )

    html_path = (
        output_dir /
        "mapa_ottobacias_blumenau.html"
    )

    # ==========================================================
    # MAPA ESTÁTICO MATPLOTLIB
    # ==========================================================

    mensagem(
        "Gerando mapa estático das Ottobacias...",
        "INFO",
        logger,
    )

    ottos_3857 = (
        ottos4326
        .to_crs(epsg=3857)
    )

    fig, ax = plt.subplots(
        figsize=(10, 10)
    )

    ottos_3857.plot(
        ax=ax,
        edgecolor="#1d3557",
        facecolor="#457b9d",
        alpha=0.4,
        linewidth=1.2,
    )

    try:

        cx.add_basemap(
            ax,
            source=cx.providers.OpenStreetMap.Mapnik,
            attribution_size=6,
        )

    except Exception as err:

        mensagem(
            f"Não foi possível carregar mapa-base: {err}",
            "AVISO",
            logger,
        )

    ax.set_axis_off()

    ax.set_title(
        "Ottobacias — Blumenau/SC",
        fontsize=13,
        weight="bold",
    )

    plt.tight_layout()

    salvar_ou_exibir(
        fig,
        png_path,
        logger,
    )


    # ==========================================================
    # MAPA INTERATIVO FOLIUM
    # ==========================================================

    mensagem(
        "Gerando mapa interativo Folium...",
        "INFO",
        logger,
    )


    # Calcula centro corretamente reprojetando temporariamente
    centro_proj = (
        ottos4326
        .to_crs(epsg=3857)
        .geometry
        .centroid
        .to_crs(epsg=4326)
    )

    centro = [
        float(centro_proj.y.mean()),
        float(centro_proj.x.mean()),
    ]


    mapa = folium.Map(
        location=centro,
        zoom_start=11,
        tiles="OpenStreetMap",
    )


    tooltip_fields = None

    campos_tooltip = [
        "COBACIA",
        "NUNIVOTTO"
    ]

    if set(campos_tooltip).issubset(
        ottos4326.columns
    ):
        tooltip_fields = campos_tooltip


    geojson_args = {
        "data": ottos4326,
        "name": "Ottobacias Blumenau",
        "style_function": lambda feat: {
            "fillColor": "#457b9d",
            "color": "#1d3557",
            "weight": 1.5,
            "fillOpacity": 0.4,
        },
        "highlight_function": lambda feat: {
            "fillColor": "#e63946",
            "color": "#1d3557",
            "weight": 2.0,
            "fillOpacity": 0.6,
        },
    }


    if tooltip_fields:

        geojson_args["tooltip"] = (
            folium.GeoJsonTooltip(
                fields=tooltip_fields,
                localize=True,
            )
        )


    folium.GeoJson(
        **geojson_args
    ).add_to(mapa)


    folium.LayerControl().add_to(
        mapa
    )


    mapa.save(
        str(html_path)
    )


    validar_arquivo(
        html_path,
        "Mapa Folium",
    )


    mensagem(
        f"Mapa interativo salvo: {html_path}",
        "ARQUIVO",
        logger,
    )

# lllllllllllllllllllllllllllllllllllllllllllllllllllllll

# ==============================================================================
# DEM
# ==============================================================================

def try_download_anadem(
    destino: Path,
    tile: str = "22J",
    logger: Optional[
        logging.Logger
    ] = None,
) -> bool:

    url = (
        "https://metadados.snirh.gov.br/"
        "files/anadem_v1_tiles/"
        f"anadem_v1_{tile}.tif"
    )

    try:

        mensagem(
            f"Tentando baixar "
            f"ANADEM {tile}...",
            "INFO",
            logger,
        )

        download_arquivo(
            url,
            destino,
            logger=logger,
        )

        return True

    except Exception as err:

        mensagem(
            f"ANADEM indisponível: "
            f"{err}",
            "AVISO",
            logger,
        )

        return False


def download_copernicus_dem(
    destino: Path,
    bbox_4326: list,
    logger: Optional[
        logging.Logger
    ] = None,
) -> None:

    mensagem(
        "Conectando ao "
        "Microsoft Planetary Computer...",
        "INFO",
        logger,
    )

    catalog = Client.open(
        "https://planetarycomputer."
        "microsoft.com/api/stac/v1"
    )

    mensagem(
        "Procurando tiles "
        "Copernicus DEM GLO-30...",
        "INFO",
        logger,
    )

    search = catalog.search(
        collections=[
            "cop-dem-glo-30"
        ],
        bbox=bbox_4326,
    )

    items = list(
        search.items()
    )

    if not items:

        raise RuntimeError(
            "Nenhum tile Copernicus "
            "DEM encontrado."
        )

    mensagem(
        f"{len(items)} tile(s) "
        "encontrado(s).",
        "INFO",
        logger,
    )

    item = planetary_computer.sign(
        items[0]
    )

    href = (
        item
        .assets["data"]
        .href
    )

    mensagem(
        "Baixando e gravando "
        "o DEM...",
        "INFO",
        logger,
    )

    dem = (
        rxr
        .open_rasterio(
            href,
            masked=True,
        )
        .squeeze()
    )

    dem.rio.to_raster(
        destino
    )

    validar_arquivo(
        destino,
        "DEM Copernicus",
    )

    mensagem(
        "DEM Copernicus "
        "salvo com sucesso.",
        "SUCESSO",
        logger,
    )


def obter_e_recortar_dem(
    outdir_dem: Path,
    ottos_union_gpkg: Path,
    logger: Optional[
        logging.Logger
    ] = None,
) -> Path:

    dem_source = (
        outdir_dem /
        "dem_source.tif"
    )

    dem_clipped = (
        outdir_dem /
        "dem_contrib_clipped.tif"
    )

    if (
        dem_clipped.exists()
        and
        not FORCE_REPROCESS
    ):

        mensagem(
            "DEM recortado já existe. "
            "Processamento ignorado.",
            "CACHE",
            logger,
        )

        return dem_clipped

    try:

        uniao = gpd.read_file(
            ottos_union_gpkg,
            layer="contrib_union",
        )

    except Exception:

        uniao = gpd.read_file(
            ottos_union_gpkg
        )

    if not dem_source.exists():

        mensagem(
            "DEM local não encontrado.",
            "INFO",
            logger,
        )

        if not try_download_anadem(
            dem_source,
            logger=logger,
        ):

            mensagem(
                "Ativando fallback "
                "Copernicus DEM GLO-30.",
                "INFO",
                logger,
            )

            bbox = (
                uniao
                .to_crs(4326)
                .total_bounds
                .tolist()
            )

            download_copernicus_dem(
                dem_source,
                bbox,
                logger,
            )

    else:

        mensagem(
            "DEM base encontrado "
            "localmente.",
            "CACHE",
            logger,
        )

    mensagem(
        "Abrindo DEM para recorte...",
        "INFO",
        logger,
    )

    with rasterio.open(
        dem_source
    ) as src:

        mensagem(
            "Reprojetando máscara "
            "para o CRS do DEM...",
            "INFO",
            logger,
        )

        uniao_dem = (
            uniao
            .to_crs(src.crs)
        )

        geometrias = [
            uniao_dem
            .geometry
            .iloc[0]
            .__geo_interface__
        ]

        mensagem(
            "Executando recorte "
            "espacial...",
            "INFO",
            logger,
        )

        imagem, transformacao = mask(
            src,
            geometrias,
            crop=True,
            nodata=src.nodata,
        )

        metadata = (
            src.meta.copy()
        )

        metadata.update(
            {
                "height":
                    imagem.shape[1],
                "width":
                    imagem.shape[2],
                "transform":
                    transformacao,
            }
        )

        with rasterio.open(
            dem_clipped,
            "w",
            **metadata,
        ) as destino:

            destino.write(
                imagem
            )

    validar_arquivo(
        dem_clipped,
        "DEM recortado",
    )

    mensagem(
        f"DEM recortado salvo: "
        f"{dem_clipped}",
        "ARQUIVO",
        logger,
    )

    return dem_clipped


# ==============================================================================
# RELEVO 2D E 3D
# ==============================================================================
# lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll

def visualizar_relevo_2d_3d(
    dem_clipped: Path,
    output_dir: Path,
    logger: Optional[logging.Logger] = None,
) -> None:

    png_path = (
        output_dir /
        "relevo_blumenau_2d.png"
    )

    html_path = (
        output_dir /
        "relevo_blumenau_3d.html"
    )


    mensagem(
        "Carregando DEM para visualização...",
        "INFO",
        logger,
    )


    raster = (
        rxr
        .open_rasterio(
            dem_clipped,
            masked=True,
        )
        .squeeze()
    )


    if raster.rio.crs is None:

        raise ValueError(
            "DEM sem CRS definido. "
            "Não foi possível reprojetar."
        )


    raster = (
        raster
        .rio
        .reproject(
            dst_crs="EPSG:3857"
        )
    )


    dados = (
        raster
        .where(
            np.isfinite(raster)
        )
    )


    # ==========================================================
    # MAPA HIPSOMÉTRICO 2D
    # ==========================================================

    mensagem(
        "Gerando mapa hipsométrico 2D...",
        "INFO",
        logger,
    )


    fig, ax = plt.subplots(
        figsize=(10, 10)
    )


    cmap = (
        colors
        .LinearSegmentedColormap
        .from_list(
            "hypsometric_blumenau",
            [
                "#003366",
                "#006400",
                "#8FBC8F",
                "#FFD700",
                "#8B4513",
                "#800000",
                "#FFFFFF",
            ],
        )
    )


    imagem = dados.plot(
        ax=ax,
        cmap=cmap,
        alpha=0.75,
        add_colorbar=False,
    )


    try:

        cx.add_basemap(
            ax,
            source=(
                cx.providers
                .Esri
                .WorldImagery
            ),
            attribution_size=6,
        )

    except Exception as err:

        mensagem(
            f"Mapa-base indisponível: {err}",
            "AVISO",
            logger,
        )


    barra = fig.colorbar(
        imagem,
        ax=ax,
        shrink=0.7,
    )


    barra.set_label(
        "Elevação (m)"
    )


    ax.set_axis_off()


    ax.set_title(
        "Modelo Digital de Elevação\n"
        "Blumenau/SC",
        fontsize=13,
        weight="bold",
    )


    plt.tight_layout()


    salvar_ou_exibir(
        fig,
        png_path,
        logger,
    )


    # ==========================================================
    # MODELO 3D PLOTLY
    # ==========================================================

    mensagem(
        "Gerando modelo de elevação 3D interativo em Plotly...",
        "INFO",
        logger,
    )


    import plotly.graph_objects as go


    r_raw = (
        rxr
        .open_rasterio(
            dem_clipped,
            masked=True,
        )
        .squeeze()
    )


    z_data = (
        r_raw
        .values
        .astype(float)
    )


    # Remove valores inválidos
    z_data[
        ~np.isfinite(z_data)
    ] = np.nan


    z_data[
        z_data < -50
    ] = np.nan


    step = 4


    z_data_sub = (
        z_data[
            ::step,
            ::step
        ]
    )


    x_coords = (
        r_raw
        .x
        .values[
            ::step
        ]
    )


    y_coords = (
        r_raw
        .y
        .values[
            ::step
        ]
    )


    alt_min = max(
        0.0,
        float(
            np.nanmin(
                z_data_sub
            )
        )
    )


    alt_max = float(
        np.nanmax(
            z_data_sub
        )
    )


    x_range = float(
        x_coords.max() -
        x_coords.min()
    )


    y_range = float(
        y_coords.max() -
        y_coords.min()
    )


    aspect_y = (
        y_range / x_range
        if x_range > 0
        else 1.0
    )


    hypsometric_plotly = [
        [0.00, "#003366"],
        [0.05, "#006400"],
        [0.25, "#8FBC8F"],
        [0.40, "#FFD700"],
        [0.60, "#8B4513"],
        [0.85, "#800000"],
        [1.00, "#FFFFFF"],
    ]


    fig_3d = go.Figure(
        data=[
            go.Surface(
                z=z_data_sub,
                x=x_coords,
                y=y_coords,
                colorscale=hypsometric_plotly,
                cmin=alt_min,
                cmax=alt_max,
                colorbar=dict(
                    title=dict(
                        text="<b>Altitude (m)</b>"
                    ),
                    thickness=15,
                    len=0.7,
                ),
                hovertemplate=(
                    "<b>X:</b> %{x:.2f}<br>"
                    "<b>Y:</b> %{y:.2f}<br>"
                    "<b>Altitude:</b> %{z:.0f} m"
                    "<extra></extra>"
                ),
            )
        ]
    )


    fig_3d.update_layout(
        title=dict(
            text=(
                "<b>Modelo de Elevação 3D "
                "Hipsométrico - Blumenau/SC</b>"
                "<br><sup>"
                "Gire a superfície e inspecione "
                "as altitudes."
                "</sup>"
            ),
            x=0.5,
            y=0.95,
        ),

        autosize=False,

        width=900,
        height=750,

        margin=dict(
            l=0,
            r=0,
            b=0,
            t=80,
        ),

        scene=dict(
            aspectmode="manual",

            aspectratio=dict(
                x=1,
                y=aspect_y,
                z=0.15,
            ),

            xaxis=dict(
                title="Coordenada X",
                showgrid=False,
            ),

            yaxis=dict(
                title="Coordenada Y",
                showgrid=False,
            ),

            zaxis=dict(
                title="Altitude (m)",
                showgrid=True,
            ),

            camera=dict(
                eye=dict(
                    x=1.2,
                    y=-1.2,
                    z=0.8,
                )
            ),
        ),
    )


    fig_3d.write_html(
        str(html_path),
        include_plotlyjs=True,
    )


    validar_arquivo(
        html_path,
        "Mapa 3D",
    )


    mensagem(
        f"Mapa 3D salvo: {html_path}",
        "ARQUIVO",
        logger,
    )


    if SHOW_PLOTS:

        mensagem(
            "Abrindo visualização 3D...",
            "INFO",
            logger,
        )

        fig_3d.show()

# vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
# ==============================================================================
# PIPELINE HAND
# ==============================================================================

def executar_pipeline_hand_wbt(
    dem_clipped: Path,
    outdir_hand: Path,
    threshold_cells: int =
        THRESHOLD_CELLS,
    keep_intermediates: bool =
        KEEP_INTERMEDIATES,
    logger: Optional[
        logging.Logger
    ] = None,
) -> Path:

    hand_output = (
        outdir_hand /
        "hand.tif"
    )

    if (
        hand_output.exists()
        and
        not FORCE_REPROCESS
    ):

        mensagem(
            "Modelo HAND já existe. "
            "Processamento ignorado.",
            "CACHE",
            logger,
        )

        return hand_output

    wbt = WhiteboxTools()

    wbt.set_verbose_mode(
        False
    )

    dem_filled = (
        outdir_hand /
        "dem_filled.tif"
    )

    flow_dir = (
        outdir_hand /
        "flow_dir.tif"
    )

    flow_acc = (
        outdir_hand /
        "flow_acc.tif"
    )

    streams = (
        outdir_hand /
        "streams.tif"
    )

    passos = [
        (
            "Preenchimento de "
            "depressões",
            lambda:
                wbt.fill_depressions_wang_and_liu(
                    dem=str(
                        dem_clipped
                    ),
                    output=str(
                        dem_filled
                    ),
                ),
            dem_filled,
        ),
        (
            "Direção de fluxo D8",
            lambda:
                wbt.d8_pointer(
                    dem=str(
                        dem_filled
                    ),
                    output=str(
                        flow_dir
                    ),
                ),
            flow_dir,
        ),
        (
            "Acumulação de "
            "fluxo D8",
            lambda:
                wbt.d8_flow_accumulation(
                    i=str(
                        dem_filled
                    ),
                    output=str(
                        flow_acc
                    ),
                    out_type="cells",
                ),
            flow_acc,
        ),
        (
            "Extração da rede "
            "de drenagem",
            lambda:
                wbt.extract_streams(
                    flow_accum=str(
                        flow_acc
                    ),
                    output=str(
                        streams
                    ),
                    threshold=(
                        threshold_cells
                    ),
                ),
            streams,
        ),
        (
            "Cálculo do modelo "
            "HAND",
            lambda:
                wbt.elevation_above_stream(
                    dem=str(
                        dem_filled
                    ),
                    streams=str(
                        streams
                    ),
                    output=str(
                        hand_output
                    ),
                ),
            hand_output,
        ),
    ]

    print(
        "\n" +
        "=" * 80
    )

    print(
        "PROCESSAMENTO "
        "HIDROLÓGICO HAND"
    )

    print(
        "=" * 80
    )

    mensagem(
        f"Threshold: "
        f"{threshold_cells} células.",
        "INFO",
        logger,
    )

    for indice, (
        nome,
        funcao,
        arquivo,
    ) in enumerate(
        passos,
        start=1,
    ):

        inicio = time.perf_counter()

        mensagem(
            f"PASSO {indice}/"
            f"{len(passos)} — "
            f"{nome}",
            "ETAPA",
            logger,
        )

        mensagem(
            "Processamento iniciado. "
            "Esta etapa pode levar "
            "alguns minutos...",
            "INFO",
            logger,
        )

        resultado = funcao()

        if resultado is False:

            raise RuntimeError(
                f"WhiteboxTools retornou "
                f"falha no passo: "
                f"{nome}"
            )

        validar_arquivo(
            arquivo,
            nome,
        )

        duracao = (
            time.perf_counter()
            - inicio
        )

        mensagem(
            f"PASSO {indice}/"
            f"{len(passos)} "
            f"concluído em "
            f"{formatar_tempo(duracao)}.",
            "SUCESSO",
            logger,
        )

    if not keep_intermediates:

        mensagem(
            "Removendo arquivos "
            "intermediários...",
            "INFO",
            logger,
        )

        for arquivo in [
            dem_filled,
            flow_dir,
            flow_acc,
            streams,
        ]:

            try:

                if arquivo.exists():

                    arquivo.unlink()

                    mensagem(
                        f"Removido: "
                        f"{arquivo.name}",
                        "INFO",
                        logger,
                    )

            except Exception as err:

                mensagem(
                    f"Não foi possível "
                    f"remover "
                    f"{arquivo.name}: "
                    f"{err}",
                    "AVISO",
                    logger,
                )

    mensagem(
        f"Modelo HAND final: "
        f"{hand_output}",
        "SUCESSO",
        logger,
    )

    return hand_output


# ==============================================================================
# MAPA FINAL
# ==============================================================================
def gerar_mapa_suscetibilidade_hand(
    hand_source: Path,
    ottos_union_gpkg: Path,
    output_png: Path,
    output_html: Optional[Path] = None,
    logger: Optional[logging.Logger] = None,
) -> None:

    mensagem(
        "Carregando raster HAND...",
        "INFO",
        logger,
    )


    # ==========================================================
    # CARREGAMENTO DA BACIA
    # ==========================================================

    try:

        uniao = gpd.read_file(
            ottos_union_gpkg,
            layer="contrib_union",
        )

    except Exception:

        uniao = gpd.read_file(
            ottos_union_gpkg
        )


    uniao_3857 = (
        uniao
        .to_crs(
            epsg=3857
        )
    )


    bbox = (
        uniao_3857
        .total_bounds
    )


    # ==========================================================
    # PROCESSAMENTO HAND
    # ==========================================================

    mensagem(
        "Reprojetando e recortando HAND...",
        "INFO",
        logger,
    )


    hand = (
        rxr
        .open_rasterio(
            hand_source,
            masked=True,
        )
        .squeeze()
        .astype("float32")
    )


    if hand.rio.crs is None:

        raise ValueError(
            "Raster HAND sem CRS definido."
        )


    hand = (
        hand
        .rio
        .reproject(
            dst_crs="EPSG:3857"
        )
    )


    hand = (
        hand
        .rio
        .clip(
            uniao_3857.geometry,
            uniao_3857.crs,
            drop=True,
        )
    )


    # ==========================================================
    # CLASSIFICAÇÃO
    # ==========================================================

    mensagem(
        "Classificando suscetibilidade...",
        "INFO",
        logger,
    )


    valido = np.isfinite(
        hand
    )


    classes = xr.full_like(
        hand,
        255,
        dtype="uint8",
    )


    classes = xr.where(
        valido & (hand <= 3),
        0,
        classes,
    )


    classes = xr.where(
        valido &
        (hand > 3) &
        (hand <= 10),
        1,
        classes,
    )


    classes = xr.where(
        valido &
        (hand > 10) &
        (hand <= 25),
        2,
        classes,
    )


    classes = xr.where(
        valido &
        (hand > 25),
        3,
        classes,
    )


    # remove áreas muito altas
    mapa = classes.where(
        classes != 3
    )


    # ==========================================================
    # MAPA PNG
    # ==========================================================

    mensagem(
        "Gerando mapa PNG de suscetibilidade...",
        "INFO",
        logger,
    )


    fig, ax = plt.subplots(
        figsize=(11, 11)
    )


    cmap = colors.ListedColormap(
        [
            "#00008B",
            "#00BFFF",
            "#ADD8E6",
        ]
    )


    norm = colors.BoundaryNorm(
        [
            -0.5,
            0.5,
            1.5,
            2.5,
        ],
        cmap.N,
    )


    imagem = mapa.plot(
        ax=ax,
        cmap=cmap,
        norm=norm,
        alpha=0.65,
        add_colorbar=False,
    )


    try:

        cx.add_basemap(
            ax,
            source=(
                cx.providers
                .Esri
                .WorldImagery
            ),
            attribution_size=6,
        )

    except Exception as err:

        mensagem(
            f"Mapa-base indisponível: {err}",
            "AVISO",
            logger,
        )


    uniao_3857.plot(
        ax=ax,
        facecolor="none",
        edgecolor="white",
        linewidth=1.2,
    )


    barra = fig.colorbar(
        imagem,
        ax=ax,
        shrink=0.55,
    )


    barra.set_ticks(
        [0, 1, 2]
    )


    barra.ax.set_yticklabels(
        [
            "ALTA\n0–3 m",
            "MÉDIA\n3–10 m",
            "BAIXA\n10–25 m",
        ]
    )


    barra.ax.invert_yaxis()


    ax.set_axis_off()


    ax.set_title(
        "Mapa de Suscetibilidade "
        "a Inundações\n"
        "Blumenau/SC — Modelo HAND",
        fontsize=14,
        weight="bold",
    )


    plt.tight_layout()


    salvar_ou_exibir(
        fig,
        output_png,
        logger,
    )

    # ==========================================================
    # MAPA HTML OPERACIONAL DEFESA CIVIL
    # ==========================================================

    if output_html:

        mensagem(
            "Gerando mapa operacional HAND para Defesa Civil...",
            "INFO",
            logger,
        )


        import folium
        from rasterio.features import shapes
        from shapely.geometry import shape


        # ======================================================
        # GARANTIR CRS DO RASTER CLASSIFICADO
        # ======================================================

        if mapa.rio.crs is None:

            mensagem(
                "Raster classificado sem CRS. Aplicando EPSG:3857...",
                "AVISO",
                logger,
            )

            mapa = (
                mapa
                .rio
                .write_crs(
                    "EPSG:3857"
                )
            )


        # ======================================================
        # RASTER -> POLÍGONOS
        # ======================================================

        mensagem(
            "Convertendo classes HAND para polígonos...",
            "INFO",
            logger,
        )


        classes_np = (
            mapa
            .fillna(255)
            .values
            .astype(
                "uint8"
            )
        )


        transform = (
            mapa
            .rio
            .transform()
        )


        features = []


        for geom, valor in shapes(
            classes_np,
            mask=(
                classes_np != 255
            ),
            transform=transform,
        ):

            features.append(
                {
                    "geometry": shape(geom),
                    "classe": int(valor),
                }
            )


        if not features:

            raise ValueError(
                "Nenhuma área válida encontrada no raster HAND."
            )


        risco_gdf = gpd.GeoDataFrame(
            features,
            geometry="geometry",
            crs="EPSG:3857",
        )


        # garante CRS antes da conversão

        if risco_gdf.crs is None:

            risco_gdf = risco_gdf.set_crs(
                "EPSG:3857"
            )


        risco_gdf = (
            risco_gdf
            .to_crs(
                epsg=4326
            )
        )


        # ======================================================
        # CENTRO DO MAPA
        # ======================================================

        centro = (
            risco_gdf
            .geometry
            .unary_union
            .centroid
        )


        mapa_web = folium.Map(
            location=[
                centro.y,
                centro.x,
            ],
            zoom_start=12,
            tiles=None,
        )


        # ======================================================
        # MAPAS BASE
        # ======================================================

        folium.TileLayer(
            "OpenStreetMap",
            name="Mapa de ruas",
        ).add_to(
            mapa_web
        )


        folium.TileLayer(
            tiles=(
                "https://server.arcgisonline.com/"
                "ArcGIS/rest/services/"
                "World_Imagery/MapServer/"
                "tile/{z}/{y}/{x}"
            ),
            attr="Esri",
            name="Imagem de satélite",
        ).add_to(
            mapa_web
        )


        # ======================================================
        # ESTILIZAÇÃO HAND
        # ======================================================

        cores = {

            0: "#00008B",   # Alta

            1: "#00BFFF",   # Média

            2: "#ADD8E6",   # Baixa

        }


        nomes = {

            0: "Alta (0-3 metros)",

            1: "Média (3-10 metros)",

            2: "Baixa (10-25 metros)",

        }


        def estilo_hand(feature):

            classe = (
                feature
                ["properties"]
                ["classe"]
            )


            return {

                "fillColor":
                    cores.get(
                        classe,
                        "#808080"
                    ),

                "color":
                    cores.get(
                        classe,
                        "#808080"
                    ),

                "weight":
                    0.8,

                "fillOpacity":
                    0.55,

            }


        # ======================================================
        # CAMADA DE SUSCETIBILIDADE
        # ======================================================

        folium.GeoJson(

            risco_gdf,

            name=(
                "Suscetibilidade HAND"
            ),

            style_function=(
                estilo_hand
            ),

            tooltip=folium.GeoJsonTooltip(

                fields=[
                    "classe"
                ],

                aliases=[
                    "Classe HAND:"
                ],

                localize=True,

            ),

        ).add_to(
            mapa_web
        )


        # ======================================================
        # LIMITE DA ÁREA ANALISADA
        # ======================================================

        limite = (
            uniao
            .to_crs(
                epsg=4326
            )
        )


        folium.GeoJson(

            limite,

            name=(
                "Área analisada"
            ),

            style_function=lambda x: {

                "color":
                    "white",

                "weight":
                    2,

                "fillOpacity":
                    0,

            },

        ).add_to(
            mapa_web
        )


        # ======================================================
        # LEGENDA
        # ======================================================

        legenda = """

        <div style="
            position: fixed;
            bottom: 40px;
            left: 40px;
            width: 240px;
            background:white;
            z-index:9999;
            padding:12px;
            border-radius:8px;
            box-shadow:0 0 10px gray;
            font-size:14px;
        ">

        <b>Suscetibilidade HAND</b><br><br>

        <span style="color:#00008B">
        ■
        </span>
        Alta (0-3 m)<br>

        <span style="color:#00BFFF">
        ■
        </span>
        Média (3-10 m)<br>

        <span style="color:#ADD8E6">
        ■
        </span>
        Baixa (10-25 m)

        </div>

        """


        mapa_web.get_root().html.add_child(
            folium.Element(
                legenda
            )
        )


        folium.LayerControl().add_to(
            mapa_web
        )


        # ======================================================
        # SALVAR HTML
        # ======================================================

        mapa_web.save(
            str(output_html)
        )


        validar_arquivo(
            output_html,
            "Mapa operacional HAND",
        )


        mensagem(
            f"Mapa Defesa Civil salvo: {output_html}",
            "ARQUIVO",
            logger,
        )
        
# ==============================================================================
# MAIN
# ==============================================================================

def main() -> None:

    inicio_total = (
        time.perf_counter()
    )

    print(
        "\n" +
        "=" * 80
    )

    print(
        "AMERICAS TECHGUARD"
    )

    print(
        "PIPELINE HIDROLÓGICO "
        "E MODELAGEM HAND"
    )

    print(
        "ÁREA DE ESTUDO: "
        "BLUMENAU/SC"
    )

    print(
        "=" * 80
    )

    print(
        "\nCONFIGURAÇÕES:"
    )

    print(
        f"  Mostrar janelas: "
        f"{SHOW_PLOTS}"
    )

    print(
        f"  Reprocessar: "
        f"{FORCE_REPROCESS}"
    )

    print(
        f"  Manter temporários: "
        f"{KEEP_INTERMEDIATES}"
    )

    diretorios = (
        configurar_diretorios()
    )

    logger = configurar_logger(
        diretorios["base"]
    )

    mensagem(
        "Pipeline iniciado.",
        "INFO",
        logger,
    )

    try:

        # --------------------------------------------------
        # ETAPA 1
        # --------------------------------------------------

        inicio = iniciar_etapa(
            1,
            7,
            "VETORES IBGE E ANA",
            logger,
        )

        (
            ottos,
            _,
            ottos_union_gpkg,
        ) = (
            obter_vetores_hidrologicos(
                diretorios[
                    "outputs_dem"
                ],
                logger,
            )
        )

        finalizar_etapa(
            "Vetores IBGE e ANA",
            inicio,
            logger,
        )

        # --------------------------------------------------
        # ETAPA 2
        # --------------------------------------------------

        inicio = iniciar_etapa(
            2,
            7,
            "VALIDAÇÃO DAS "
            "OTTOBACIAS",
            logger,
        )

        gerar_visualizacoes_bacias(
            ottos,
            diretorios[
                "output_maps"
            ],
            logger,
        )

        finalizar_etapa(
            "Validação das Ottobacias",
            inicio,
            logger,
        )

        # --------------------------------------------------
        # ETAPA 3
        # --------------------------------------------------

        inicio = iniciar_etapa(
            3,
            7,
            "AQUISIÇÃO E RECORTE "
            "DO DEM",
            logger,
        )

        dem_clipped = (
            obter_e_recortar_dem(
                diretorios[
                    "outputs_dem"
                ],
                ottos_union_gpkg,
                logger,
            )
        )

        finalizar_etapa(
            "Aquisição e recorte "
            "do DEM",
            inicio,
            logger,
        )

        # --------------------------------------------------
        # ETAPA 4
        # --------------------------------------------------

        inicio = iniciar_etapa(
            4,
            7,
            "VISUALIZAÇÃO "
            "DO RELEVO",
            logger,
        )

        visualizar_relevo_2d_3d(
            dem_clipped,
            diretorios[
                "output_maps"
            ],
            logger,
        )

        finalizar_etapa(
            "Visualização do relevo",
            inicio,
            logger,
        )

        # --------------------------------------------------
        # ETAPA 5
        # --------------------------------------------------

        inicio = iniciar_etapa(
            5,
            7,
            "PROCESSAMENTO "
            "HIDROLÓGICO HAND",
            logger,
        )

        hand_output = (
            executar_pipeline_hand_wbt(
                dem_clipped,
                diretorios[
                    "outputs_hand"
                ],
                threshold_cells=(
                    THRESHOLD_CELLS
                ),
                keep_intermediates=(
                    KEEP_INTERMEDIATES
                ),
                logger=logger,
            )
        )

        finalizar_etapa(
            "Modelo HAND",
            inicio,
            logger,
        )
# --------------------------------------------------
# ETAPA 6
# --------------------------------------------------

        inicio = iniciar_etapa(
            6,
            7,
            "MAPA DE SUSCETIBILIDADE",
            logger,
        )


        mapa_final = (
            diretorios["output_maps"]
            /
            "mapa_suscetibilidade_hand_blumenau.png"
        )


        mapa_html = (
            diretorios["output_maps"]
            /
            "mapa_suscetibilidade_hand_blumenau.html"
        )


        gerar_mapa_suscetibilidade_hand(
            hand_source=hand_output,
            ottos_union_gpkg=ottos_union_gpkg,
            output_png=mapa_final,
            output_html=mapa_html,
            logger=logger,
        )


        finalizar_etapa(
            "Mapa de suscetibilidade",
            inicio,
            logger,
        )
        # --------------------------------------------------
        # ETAPA 7
        # --------------------------------------------------

        inicio = iniciar_etapa(
            7,
            7,
            "VALIDAÇÃO FINAL",
            logger,
        )

        arquivos_finais = [
            dem_clipped,
            hand_output,
            mapa_final,
        ]

        for arquivo in arquivos_finais:

            validar_arquivo(
                arquivo,
                "Arquivo final",
            )

            mensagem(
                f"Validado: "
                f"{arquivo.name}",
                "SUCESSO",
                logger,
            )

        finalizar_etapa(
            "Validação final",
            inicio,
            logger,
        )

        duracao_total = (
            time.perf_counter()
            - inicio_total
        )
        print(
            "\n" +
            "=" * 80
        )
        print(
            "PIPELINE CONCLUÍDO "
            "COM SUCESSO"
        )
        print(
            "=" * 80
        )
        print(
            "\nTEMPO TOTAL: "
            f"{formatar_tempo(duracao_total)}"
        )
        print(
            "\nARQUIVOS PRINCIPAIS:"
        )
        print(
            f"  DEM: "
            f"{dem_clipped}"
        )
        print(
            f"  HAND: "
            f"{hand_output}"
        )
        print(
            f"  MAPA: "
            f"{mapa_final}"
        )
        print(
            f"\nLOG: "
            f"{diretorios['logs'] / 'pipeline_hand.log'}"
        )
        print(
            "\n" +
            "=" * 80
        )

    except KeyboardInterrupt:

        mensagem(
            "Pipeline interrompido "
            "pelo usuário.",
            "AVISO",
            logger,
        )
        print(
            "\n[INTERROMPIDO] "
            "Execução cancelada."
        )
        sys.exit(130)

    except Exception as err:

        mensagem(
            f"Falha crítica: {err}",
            "ERRO",
            logger,
        )
        print(
            "\n" +
            "=" * 80
        )
        print(
            "PIPELINE INTERROMPIDO "
            "POR ERRO"
        )
        print(
            "=" * 80
        )
        print(
            f"\nErro: {err}"
        )
        print(
            "\nConsulte o arquivo "
            "de log para mais detalhes."
        )
        raise
if __name__ == "__main__":
    main()
