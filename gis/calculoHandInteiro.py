"""
AMERICAS TECHGUARD - PIPELINE HIDROLÓGICO E MODELAGEM HAND (BLUMENAU/SC)

Este script realiza o download de dados territoriais (IBGE) e hidrográficos (ANA/SNIRH),
obtém o Modelo Digital de Elevação (ANADEM / Copernicus DEM GLO-30),
executa o recorte hidrológico, processa o modelo HAND via WhiteboxTools (Wang & Liu),
e gera visualizações 2D (Matplotlib/Folium), 3D (Plotly) e o mapa final de suscetibilidade.
"""

import os
import sys
import zipfile
from pathlib import Path
from typing import Tuple, Optional, Dict, Any

# Computação científica e geoprocessamento
import numpy as np
import xarray as xr
import fiona
import geopandas as gpd
import rasterio
import rioxarray as rxr
from rasterio.mask import mask
from shapely.ops import unary_union

# Visualização
import contextily as cx
import folium
import matplotlib.colors as colors
import matplotlib.pyplot as plt
import plotly.graph_objects as go

# Acesso a serviços e APIs externas
import requests
import planetary_computer
from pystac_client import Client

# Motor hidrológico WhiteboxTools
try:
    from whitebox import WhiteboxTools
except ImportError:
    try:
        from whitebox.whitebox_tools import WhiteboxTools
    except ImportError as err:
        print(
            "\n[ERRO] O pacote 'whitebox' não está instalado no ambiente Python.\n"
            "Instale executando: pip install whitebox",
            file=sys.stderr
        )
        sys.exit(1)


# ==============================================================================
# 1. INICIALIZAÇÃO DE AMBIENTE E ESTRUTURA DE DIRETÓRIOS
# ==============================================================================

def configurar_diretorios(base_dir: Optional[Path] = None) -> Dict[str, Path]:
    """
    Configura e cria as pastas necessárias para o processamento de dados e saídas.
    """
    if base_dir is None:
        base_dir = Path(__file__).resolve().parent

    diretorios = {
        "base": base_dir,
        "data": base_dir / "data",
        "outputs_dem": base_dir / "outputs_dem",
        "outputs_hand": base_dir / "outputs_hand",
        "output_rasters": base_dir / "output_rasters",
        "output_vectors": base_dir / "output_vectors",
    }

    for key, path in diretorios.items():
        if key != "base":
            path.mkdir(parents=True, exist_ok=True)

    print("[INFO] Estrutura de diretórios validada e inicializada com sucesso!")
    print(f"       -> Diretório Base: {base_dir}")
    print(f"       -> Saída DEM:      {diretorios['outputs_dem']}")
    print(f"       -> Saída HAND:     {diretorios['outputs_hand']}")
    return diretorios


def download_arquivo(url: str, destino: Path, timeout: int = 180) -> None:
    """Faz download de um arquivo com tratamento de erros de conexão."""
    resposta = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
    resposta.raise_for_status()
    destino.write_bytes(resposta.content)


# ==============================================================================
# 2. AQUISIÇÃO DE VETORES TERRITORIAIS (IBGE) E HIDROGRÁFICOS (ANA)
# ==============================================================================

def consultar_arcgis_bbox(
    url: str, 
    bbox: Tuple[float, float, float, float], 
    filtro: str = "1=1", 
    tamanho_pagina: int = 2000, 
    timeout: int = 180
) -> Dict[str, Any]:
    """Consulta dados de GeoJSON na API REST do ArcGIS (SNIRH / ANA) com paginação."""
    x1, y1, x2, y2 = bbox
    lista_features = []
    deslocamento = 0

    while True:
        parametros = {
            "f": "geojson",
            "where": filtro,
            "outFields": "*",
            "returnGeometry": "true",
            "spatialRel": "esriSpatialRelIntersects",
            "geometryType": "esriGeometryEnvelope",
            "geometry": f"{x1},{y1},{x2},{y2}",
            "inSR": 3857,
            "outSR": 3857,
            "resultRecordCount": tamanho_pagina,
            "resultOffset": deslocamento,
        }

        resposta = requests.post(url, data=parametros, timeout=timeout)
        resposta.raise_for_status()
        dados_json = resposta.json()

        if "error" in dados_json:
            raise RuntimeError(f"Erro na API do ArcGIS: {dados_json['error']}")

        features_pagina = dados_json.get("features", [])
        lista_features.extend(features_pagina)

        if len(features_pagina) < tamanho_pagina:
            break
        deslocamento += tamanho_pagina

    return {"type": "FeatureCollection", "features": lista_features}


def obter_vetores_hidrologicos(
    outdir: Path,
    ibge_year: int = 2023,
    levels: Optional[list] = None
) -> Tuple[gpd.GeoDataFrame, gpd.GeoDataFrame, Path]:
    """
    Baixa os limites de Blumenau (IBGE) e as Ottobacias (ANA/SNIRH).
    Em caso de falha de rede, carrega os arquivos de contingência (.gpkg) salvos.
    """
    if levels is None:
        levels = [5]

    blumenau_gpkg = outdir / "blumenau_boundary.gpkg"
    ottos_raw_gpkg = outdir / "ottobacias_blumenau_raw.gpkg"
    ottos_union_gpkg = outdir / "ottobacias_blumenau_union.gpkg"

    ibge_zip = outdir / f"BR_Municipios_{ibge_year}.zip"
    ibge_extract_dir = outdir / f"ibge_municipios_{ibge_year}"

    try:
        print("[1/4] Baixando e processando limites municipais do IBGE...")
        ibge_url_br = (
            f"https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/"
            f"malhas_municipais/municipio_{ibge_year}/Brasil/BR_Municipios_{ibge_year}.zip"
        )
        ibge_url_sc = (
            f"https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/"
            f"malhas_municipais/municipio_{ibge_year}/UFs/SC/SC_Municipios_{ibge_year}.zip"
        )

        if not ibge_zip.exists():
            try:
                download_arquivo(ibge_url_br, ibge_zip)
            except Exception as err:
                print(f"      [AVISO] Servidor IBGE Nacional falhou ({err}). Tentando espelho SC...")
                ibge_zip = outdir / f"SC_Municipios_{ibge_year}.zip"
                download_arquivo(ibge_url_sc, ibge_zip)

        if not ibge_extract_dir.exists():
            ibge_extract_dir.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(ibge_zip, "r") as zip_ref:
                zip_ref.extractall(ibge_extract_dir)

        shps = list(ibge_extract_dir.rglob("*.shp"))
        if not shps:
            raise FileNotFoundError(f"Nenhum Shapefile encontrado em {ibge_extract_dir}")

        malha = gpd.read_file(shps[0])
        nomes = malha["NM_MUN"].astype(str).str.strip().str.upper()

        blumenau_vec = None
        if "SIGLA_UF" in malha.columns:
            blumenau_vec = malha[(nomes == "BLUMENAU") & (malha["SIGLA_UF"].astype(str).str.upper() == "SC")].copy()
        elif "CD_UF" in malha.columns:
            blumenau_vec = malha[(nomes == "BLUMENAU") & (malha["CD_UF"].astype(str) == "42")].copy()

        if blumenau_vec is None or blumenau_vec.empty:
            raise ValueError("Município de Blumenau (SC) não localizado na malha do IBGE.")

        blumenau_vec = blumenau_vec.to_crs(4326)
        blumenau_vec.to_file(blumenau_gpkg, layer="blumenau", driver="GPKG")

        print("[2/4] Consultando Ottobacias do SNIRH (ANA) que interceptam Blumenau...")
        bho_url = "https://www.snirh.gov.br/arcgis/rest/services/SPR/BHO2017_50K_AREADRENAGEM/MapServer/0/query"
        blumenau_3857 = blumenau_vec.to_crs(3857)
        bbox = blumenau_3857.total_bounds

        filtro = f"nunivotto IN ({','.join(map(str, levels))})" if levels else "1=1"
        dados_geojson = consultar_arcgis_bbox(bho_url, bbox=bbox, filtro=filtro)
        features = dados_geojson.get("features", [])

        if not features:
            print("      [AVISO] Nenhuma bacia com o filtro de nível. Tentando busca ampla (1=1)...")
            dados_geojson = consultar_arcgis_bbox(bho_url, bbox=bbox, filtro="1=1")
            features = dados_geojson.get("features", [])

        if not features:
            raise RuntimeError("A API da ANA não retornou nenhuma feição para as coordenadas de Blumenau.")

        ottos_3857 = gpd.GeoDataFrame.from_features(features).set_crs(3857)
        ottos_3857 = ottos_3857[ottos_3857.intersects(blumenau_3857.geometry.iloc[0])].copy()

        if ottos_3857.empty:
            raise ValueError("Nenhuma bacia restou após o cruzamento com o limite de Blumenau.")

        ottos_4326 = ottos_3857.to_crs(4326)
        ottos_4326.to_file(ottos_raw_gpkg, layer="ottobacias_raw", driver="GPKG")

        print("[3/4] Unificando polígonos das Ottobacias para máscara do DEM...")
        geom_uniao = unary_union(ottos_3857.geometry)
        uniao_gdf = gpd.GeoDataFrame({"name": ["contrib_union"]}, geometry=[geom_uniao], crs=3857).to_crs(4326)
        uniao_gdf.to_file(ottos_union_gpkg, layer="contrib_union", driver="GPKG")

        print(f"      -> Ottobacias processadas: {len(ottos_4326)} polígonos.")
        return ottos_4326, uniao_gdf, ottos_union_gpkg

    except Exception as err:
        print(f"\n[AVISO] Falha ao obter vetores online: {err}")
        print("        Ativando plano de contingência: Carregando arquivos locais preexistentes...")

        if ottos_raw_gpkg.exists() and ottos_union_gpkg.exists():
            ottos_4326 = gpd.read_file(ottos_raw_gpkg)
            try:
                uniao_gdf = gpd.read_file(ottos_union_gpkg, layer="contrib_union")
            except Exception:
                uniao_gdf = gpd.read_file(ottos_union_gpkg)
            print("        -> Dados locais de contingência carregados com sucesso!")
            return ottos_4326, uniao_gdf, ottos_union_gpkg
        else:
            raise FileNotFoundError(
                f"Erro crítico: Não foi possível baixar os vetores e os arquivos de contingência "
                f"({ottos_raw_gpkg.name}) não existem no diretório."
            )


# ==============================================================================
# 3. VALIDAÇÃO VISUAL DE BACIAS (MAPA ESTÁTICO E FOLIUM INTERATIVO)
# ==============================================================================

def gerar_visualizacoes_bacias(ottos4326: gpd.GeoDataFrame, output_dir: Path) -> None:
    """Gera o mapa 2D estático com basemap OpenStreetMap e salva o mapa interativo Folium em HTML."""
    if ottos4326.crs is None:
        raise ValueError("GeoDataFrame de Ottobacias sem CRS definido.")

    print("[INFO] Gerando visualizações de validação visual das Ottobacias...")
    
    # 1. Mapa estático Matplotlib + Contextily
    ottos_3857 = ottos4326.to_crs(3857)
    fig, ax = plt.subplots(figsize=(10, 10))
    ottos_3857.plot(ax=ax, edgecolor="#1d3557", facecolor="#457b9d", alpha=0.4, linewidth=1.2)
    cx.add_basemap(ax, source=cx.providers.OpenStreetMap.Mapnik, attribution_size=6)
    ax.set_axis_off()
    ax.set_title("Mapeamento das Ottobacias - Blumenau/SC\n(Delimitação da Área de Contribuição Hidrográfica)", fontsize=12, weight="bold")
    plt.tight_layout()
    plt.show()

    # 2. Mapa interativo Folium HTML
    centro_mapa = [ottos4326.geometry.centroid.y.mean(), ottos4326.geometry.centroid.x.mean()]
    mapa_folium = folium.Map(location=centro_mapa, zoom_start=11, tiles="OpenStreetMap")

    tooltip_fields = ["COBACIA", "NUNIVOTTO"] if set(["COBACIA", "NUNIVOTTO"]).issubset(ottos4326.columns) else None

    folium.GeoJson(
        ottos4326,
        name="Ottobacias Blumenau",
        style_function=lambda feat: {
            "fillColor": "#457b9d",
            "color": "#1d3557",
            "weight": 1.5,
            "fillOpacity": 0.4,
        },
        highlight_function=lambda feat: {
            "fillColor": "#e63946",
            "color": "#1d3557",
            "weight": 2.0,
            "fillOpacity": 0.6,
        },
        tooltip=folium.GeoJsonTooltip(fields=tooltip_fields, localize=True) if tooltip_fields else None
    ).add_to(mapa_folium)

    folium.LayerControl().add_to(mapa_folium)
    html_path = output_dir / "mapa_ottobacias_blumenau.html"
    mapa_folium.save(str(html_path))
    print(f"      -> Mapa interativo salvo com sucesso em: {html_path}")


# ==============================================================================
# 4. AQUISIÇÃO E RECORTE DO MODELO DIGITAL DE ELEVAÇÃO (DEM)
# ==============================================================================

def try_download_anadem(dst: Path, tile: str = "22J") -> bool:
    """Tenta realizar o download do tile ANADEM (SNIRH)."""
    url = f"https://metadados.snirh.gov.br/files/anadem_v1_tiles/anadem_v1_{tile}.tif"
    try:
        print(f"[INFO] Tentando baixar o tile ANADEM {tile}...")
        download_arquivo(url, dst)
        return True
    except Exception as err:
        print(f"       [AVISO] Falha ao baixar ANADEM ({err}). Ativando fallback do Copernicus DEM...")
        return False


def download_copernicus_dem(dst: Path, bbox_4326: list) -> None:
    """Fallback: Baixa o Copernicus DEM GLO-30 via Microsoft Planetary Computer STAC."""
    print("[INFO] Baixando Copernicus DEM GLO-30 via Planetary Computer...")
    catalog = Client.open("https://planetarycomputer.microsoft.com/api/stac/v1")
    search = catalog.search(collections=["cop-dem-glo-30"], bbox=bbox_4326)
    items = list(search.get_items())

    if not items:
        raise RuntimeError("Nenhum tile do Copernicus DEM encontrado para a Bounding Box fornecida.")

    item = planetary_computer.sign(items[0])
    href = item.assets["data"].href
    dem_ds = rxr.open_rasterio(href, masked=True).squeeze()
    dem_ds.rio.to_raster(dst)


def obter_e_recortar_dem(outdir_dem: Path, ottos_union_gpkg: Path) -> Path:
    """
    Garante a presença do DEM base (dem_source.tif) e gera o DEM recortado (dem_contrib_clipped.tif)
    com base no polígono unificado das Ottobacias.
    """
    dem_source = outdir_dem / "dem_source.tif"
    dem_clipped = outdir_dem / "dem_contrib_clipped.tif"

    try:
        union_gdf = gpd.read_file(ottos_union_gpkg, layer="contrib_union")
    except Exception:
        union_gdf = gpd.read_file(ottos_union_gpkg)

    if not dem_source.exists():
        if not try_download_anadem(dem_source):
            union_4326 = union_gdf.to_crs(4326)
            bbox_4326 = union_4326.total_bounds.tolist()
            download_copernicus_dem(dem_source, bbox_4326)
    else:
        print("[INFO] DEM base (dem_source.tif) já existe localmente. Pulando download.")

    print("[INFO] Recortando o DEM para o contorno exato das Ottobacias de Blumenau...")
    with rasterio.open(dem_source) as src:
        union_dem_crs = union_gdf.to_crs(src.crs)
        geoms = [union_dem_crs.geometry.iloc[0].__geo_interface__]

        out_img, out_transform = mask(src, geoms, crop=True)
        nodata_val = -32768
        out_img[out_img == 0] = nodata_val
        out_img = out_img.astype("int16")

        out_meta = src.meta.copy()
        out_meta.update({
            "height": out_img.shape[1],
            "width": out_img.shape[2],
            "transform": out_transform,
            "dtype": "int16",
            "nodata": nodata_val,
        })

        with rasterio.open(dem_clipped, "w", **out_meta) as dst:
            dst.write(out_img)

    print(f"      -> DEM recortado com sucesso: {dem_clipped}")
    return dem_clipped


# ==============================================================================
# 5. VISUALIZAÇÃO HIPSOMÉTRICA DO RELEVO (2D E 3D PLOTLY)
# ==============================================================================

def visualizar_relevo_2d_3d(dem_clipped: Path) -> None:
    """Gera mapa hipsométrico 2D com convenção de cores padrão e superfície 3D interativa em Plotly."""
    print("[INFO] Carregando DEM recortado para renderização de relevo 2D/3D...")
    r = rxr.open_rasterio(dem_clipped, masked=True).squeeze().rio.reproject(3857)
    r_clean = r.where((r != -32768) & (r >= 0))

    # --- 1. Renderização 2D ---
    fig, ax = plt.subplots(figsize=(10, 10))
    hypsometric_colors = [
        (0.00, "#003366"),
        (0.05, "#006400"),
        (0.25, "#8FBC8F"),
        (0.40, "#FFD700"),
        (0.60, "#8B4513"),
        (0.85, "#800000"),
        (1.00, "#FFFFFF")
    ]
    custom_cmap = colors.LinearSegmentedColormap.from_list("hypsometric_blumenau", hypsometric_colors)

    img = r_clean.plot(
        ax=ax,
        cmap=custom_cmap,
        alpha=0.70,
        vmin=0,
        vmax=1000,
        add_colorbar=False
    )

    cx.add_basemap(ax, source=cx.providers.Esri.WorldImagery, attribution_size=6)
    cbar = fig.colorbar(img, ax=ax, orientation="vertical", shrink=0.7, pad=0.03, extend="max")
    cbar.set_label("Altitude / Elevação do Terreno (m)", fontsize=11, weight="bold", labelpad=15, rotation=270)
    cbar.ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"{int(x)}m"))

    ax.set_axis_off()
    ax.set_title("Modelo Digital de Elevação de Blumenau/SC\n(Recortado sobre Imagem de Satélite ESRI)", fontsize=13, weight="bold", pad=15)
    plt.tight_layout()
    plt.show()

    # --- 2. Renderização 3D ---
    print("[INFO] Gerando modelo de elevação 3D interativo em Plotly...")
    r_raw = rxr.open_rasterio(dem_clipped).squeeze()
    z_data = r_raw.values.astype(float)
    z_data[z_data < -50] = np.nan

    step = 4
    z_data_sub = z_data[::step, ::step]
    x_coords = r_raw.x.values[::step]
    y_coords = r_raw.y.values[::step]

    alt_min = max(0.0, float(np.nanmin(z_data_sub)))
    alt_max = float(np.nanmax(z_data_sub))

    x_range = float(x_coords.max() - x_coords.min())
    y_range = float(y_coords.max() - y_coords.min())
    aspect_y = y_range / x_range if x_range > 0 else 1.0

    hypsometric_plotly = [
        [0.00, "#003366"],
        [0.05, "#006400"],
        [0.25, "#8FBC8F"],
        [0.40, "#FFD700"],
        [0.60, "#8B4513"],
        [0.85, "#800000"],
        [1.00, "#FFFFFF"]
    ]

    fig_3d = go.Figure(data=[go.Surface(
        z=z_data_sub,
        x=x_coords,
        y=y_coords,
        colorscale=hypsometric_plotly,
        cmin=alt_min,
        cmax=alt_max,
        colorbar=dict(title=dict(text="<b>Altitude (m)</b>", side="top"), thickness=15, len=0.7),
        hovertemplate="<b>Lon:</b> %{x:.4f}<br><b>Lat:</b> %{y:.4f}<br><b>Altitude:</b> %{z:.0f}m<extra></extra>"
    )])

    fig_3d.update_layout(
        title=dict(
            text="<b>Modelo de Elevação 3D Hipsométrico - Blumenau/SC</b><br><sup>Gire a bacia e passe o mouse para inspecionar as altitudes.</sup>",
            x=0.5,
            y=0.95
        ),
        autosize=False,
        width=900,
        height=750,
        margin=dict(l=0, r=0, b=0, t=80),
        scene=dict(
            aspectmode='manual',
            aspectratio=dict(x=1, y=aspect_y, z=0.15),
            xaxis=dict(title='Longitude', showgrid=False),
            yaxis=dict(title='Latitude', showgrid=False),
            zaxis=dict(title='Altitude (m)', showgrid=True),
            camera=dict(eye=dict(x=1.2, y=-1.2, z=0.8))
        )
    )

    fig_3d.show()


# ==============================================================================
# 6. PIPELINE HIDROLÓGICO HAND (WHITEBOX TOOLS - WANG & LIU)
# ==============================================================================

def executar_pipeline_hand_wbt(
    dem_clipped: Path, 
    outdir_hand: Path, 
    threshold_cells: int = 2000, 
    keep_intermediates: bool = False
) -> Path:
    """
    Executa os 5 passos do algoritmo HAND via WhiteboxTools:
    1. Preenchimento de Depressões (Wang & Liu)
    2. Direção de Fluxo D8 Pointer
    3. Acumulação de Fluxo D8
    4. Extração da Rede de Canais (Streams)
    5. Elevação Relativa (HAND / Elevation Above Stream)
    """
    wbt = WhiteboxTools()
    wbt.set_verbose_mode(False)

    dem_filled = outdir_hand / "dem_filled.tif"
    flow_dir = outdir_hand / "flow_dir.tif"
    flow_acc = outdir_hand / "flow_acc.tif"
    streams = outdir_hand / "streams.tif"
    hand_output = outdir_hand / "hand.tif"

    print("\n--- INICIANDO PIPELINE HIDROLÓGICO HAND (WHITEBOX TOOLS) ---")
    print(f"[INFO] Threshold de canais configurado em {threshold_cells} células.")

    # 1. Fill Depressions Wang & Liu
    print("[1/5] Condicionando DEM (Preenchendo depressões via Wang & Liu)...")
    wbt.fill_depressions_wang_and_liu(dem=str(dem_clipped), output=str(dem_filled))
    if not dem_filled.exists():
        raise RuntimeError("Passo 1 (fill_depressions) falhou.")

    # 2. D8 Pointer
    print("[2/5] Calculando Direção de Fluxo D8...")
    wbt.d8_pointer(dem=str(dem_filled), output=str(flow_dir))
    if not flow_dir.exists():
        raise RuntimeError("Passo 2 (d8_pointer) falhou.")

    # 3. D8 Flow Accumulation
    print("[3/5] Calculando Acumulação de Fluxo D8...")
    wbt.d8_flow_accumulation(i=str(dem_filled), output=str(flow_acc), out_type="cells")
    if not flow_acc.exists():
        raise RuntimeError("Passo 3 (d8_flow_accumulation) falhou.")

    # 4. Extract Streams
    print(f"[4/5] Extraindo canais de drenagem (threshold = {threshold_cells})...")
    wbt.extract_streams(flow_accum=str(flow_acc), output=str(streams), threshold=threshold_cells)
    if not streams.exists():
        raise RuntimeError("Passo 4 (extract_streams) falhou.")

    # 5. HAND (Elevation Above Stream)
    print("[5/5] Executando algoritmo HAND (Elevation Above Stream)...")
    wbt.elevation_above_stream(dem=str(dem_filled), streams=str(streams), output=str(hand_output))
    if not hand_output.exists():
        raise RuntimeError("Passo 5 (elevation_above_stream / HAND) falhou.")

    print(f"[SUCESSO] Modelo HAND gerado com sucesso em: {hand_output}")

    if not keep_intermediates:
        print("[INFO] Efetuando limpeza dos rasters intermediários...")
        for temp_f in [dem_filled, flow_dir, flow_acc, streams]:
            if temp_f.exists():
                try:
                    os.remove(temp_f)
                except Exception:
                    pass

    return hand_output


# ==============================================================================
# 7. GERAÇÃO DO MAPA FINAL DE SUSCETIBILIDADE A INUNDAÇÕES
# ==============================================================================

def gerar_mapa_suscetibilidade_hand(
    hand_source: Path, 
    ottos_union_gpkg: Path, 
    output_png: Optional[Path] = None
) -> None:
    """
    Classifica o raster HAND em Zonas de Suscetibilidade e plota o mapa final
    com transparência sobre imagens de satélite.
    Classes HAND:
    - Alta (0-3m): Calha do Rio
    - Média (3-10m): Várzeas de Inundação
    - Baixa (10-25m): Terraços eEncostas Baixas
    """
    print("[INFO] Classificando e gerando o mapa de suscetibilidade HAND...")

    try:
        union_gdf = gpd.read_file(ottos_union_gpkg, layer="contrib_union")
    except Exception:
        union_gdf = gpd.read_file(ottos_union_gpkg)

    union_3857 = union_gdf.to_crs(3857)
    bbox = union_3857.total_bounds

    r_hand = (
        rxr.open_rasterio(hand_source, masked=True)
        .squeeze("band", drop=True)
        .astype("float32")
        .rio.reproject(3857)
    )

    r_hand = r_hand.rio.clip(union_3857.geometry, union_3857.crs, drop=True)

    valid = np.isfinite(r_hand)
    t1, t2, t3 = 3.0, 10.0, 25.0

    cls_da = xr.full_like(r_hand, 255, dtype="uint8")
    cls_da = xr.where(valid & (r_hand <= t1), 0, cls_da)
    cls_da = xr.where(valid & (r_hand > t1) & (r_hand <= t2), 1, cls_da)
    cls_da = xr.where(valid & (r_hand > t2) & (r_hand <= t3), 2, cls_da)
    cls_da = xr.where(valid & (r_hand > t3), 3, cls_da)

    cls_da.rio.write_nodata(255, inplace=True)
    r_clean = cls_da.where((cls_da != 255) & (cls_da != 3))

    fig, ax = plt.subplots(figsize=(10, 10))
    hydro_colors = ['#00008B', '#00BFFF', '#ADD8E6']
    cmap_hydro = colors.ListedColormap(hydro_colors)
    norm_hydro = colors.BoundaryNorm([-0.5, 0.5, 1.5, 2.5], cmap_hydro.N)

    img = r_clean.plot(
        ax=ax,
        cmap=cmap_hydro,
        norm=norm_hydro,
        alpha=0.60,
        add_colorbar=False
    )

    union_3857.plot(ax=ax, facecolor="none", edgecolor="white", linewidth=1.2, alpha=0.9, zorder=3)
    cx.add_basemap(ax, source=cx.providers.Esri.WorldImagery, attribution_size=6)

    ax.set_xlim(bbox[0], bbox[2])
    ax.set_ylim(bbox[1], bbox[3])

    cbar = fig.colorbar(img, ax=ax, orientation="vertical", shrink=0.5, pad=0.03)
    cbar.set_label("Suscetibilidade a Inundação (HAND)", fontsize=11, weight="bold", labelpad=15, rotation=270)
    cbar.set_ticks([0, 1, 2])
    cbar.ax.set_yticklabels(
        [
            "ALTA (0-3m)\nCalha do Rio",
            "MÉDIA (3-10m)\nVárzeas",
            "BAIXA (10-25m)\nTerraços"
        ],
        fontsize=9,
        weight="bold"
    )
    cbar.ax.tick_params(length=0)
    cbar.ax.invert_yaxis()

    ax.set_axis_off()
    ax.set_title(
        "Mapa de Suscetibilidade de Inundação - Blumenau/SC\n(Modelo HAND - Height Above Nearest Drainage)",
        fontsize=13,
        weight="bold",
        pad=15
    )

    plt.tight_layout()
    if output_png:
        plt.savefig(output_png, dpi=300, bbox_inches='tight')
        print(f"[SUCESSO] Imagem do mapa salva em: {output_png}")
    plt.show()


# ==============================================================================
# 8. FUNÇÃO PRINCIPAL (ORQUESTRADOR DO PIPELINE)
# ==============================================================================

def main():
    print("==============================================================================")
    print("  AMERICAS TECHGUARD - PIPELINE EXECUTÁVEL DE MODELAGEM HAND (BLUMENAU/SC)")
    print("==============================================================================\n")

    # 1. Configuração do ambiente e diretórios
    diretorios = configurar_diretorios()
    outdir_dem = diretorios["outputs_dem"]
    outdir_hand = diretorios["outputs_hand"]

    # 2. Obtenção de vetores IBGE e ANA
    ottos4326, uniao_gdf, ottos_union_gpkg = obter_vetores_hidrologicos(outdir_dem)

    # 3. Geração de mapas interativos Folium e 2D das bacias
    gerar_visualizacoes_bacias(ottos4326, diretorios["base"])

    # 4. Obtenção e recorte do DEM
    dem_clipped = obter_e_recortar_dem(outdir_dem, ottos_union_gpkg)

    # 5. Visualização do Relevo 2D e 3D
    visualizar_relevo_2d_3d(dem_clipped)

    # 6. Processamento do Modelo HAND via WhiteboxTools
    hand_output = executar_pipeline_hand_wbt(dem_clipped, outdir_hand, threshold_cells=2000, keep_intermediates=False)

    # 7. Geração do Mapa Final de Suscetibilidade HAND
    mapa_png = diretorios["base"] / "mapa_suscetibilidade_hand_blumenau.png"
    gerar_mapa_suscetibilidade_hand(hand_output, ottos_union_gpkg, output_png=mapa_png)

    print("\n==============================================================================")
    print("  [FINALIZADO] PIPELINE HAND CONCLUÍDO COM SUCESSO DE PONTA A PONTA!")
    print("==============================================================================")


if __name__ == "__main__":
    main()