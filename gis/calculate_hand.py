import os
import sys
import shutil
from pathlib import Path
import geopandas as gpd
from whitebox import WhiteboxTools

# Adiciona o diretório src ao path para importações limpas
BASE_DIR = Path(__file__).resolve().parent
SRC_DIR = BASE_DIR / "src"
sys.path.append(str(SRC_DIR))

from visualization import gerar_mapa_ottobacias, gerar_mapa_suscetibilidade_hand

def inicializar_wbt():
    """Inicializa e configura o WhiteboxTools com otimizações de performance."""
    wbt = WhiteboxTools()
    wbt.set_working_dir(str(BASE_DIR / "output_rasters"))
    wbt.set_verbose_mode(False) # Desliga logs excessivos para acelerar a execução
    return wbt

def main():
    print("[INÍCIO] Iniciando pipeline hidrológico HAND para Blumenau/SC (TechGuard)...")
    
    # 1. Configuração de caminhos
    rasters_dir = BASE_DIR / "output_rasters"
    vectors_dir = BASE_DIR / "output_vectors"
    rasters_dir.mkdir(parents=True, exist_ok=True)
    
    dem_clipped = rasters_dir / "dem_clipped.tif"
    dem_filled = rasters_dir / "dem_filled.tif"
    flow_dir = rasters_dir / "flow_dir.tif"
    flow_acc = rasters_dir / "flow_acc.tif"
    streams = rasters_dir / "streams.tif"
    hand_output = rasters_dir / "hand.tif"
    
    ottos_gpkg = vectors_dir / "ottobacias_blumenau_union.gpkg"
    map_html = BASE_DIR / "mapa_ottobacias.html"
    map_png = BASE_DIR / "mapa_suscetibilidade_blumenau.png"

    # Validação e preparação inteligente do DEM
    if not dem_clipped.exists():
        dem_source_candidatos = list(rasters_dir.glob("dem*.tif")) + list(BASE_DIR.glob("dem*.tif"))
        dem_source_candidatos = [p for p in dem_source_candidatos if p.name != "dem_clipped.tif"]
        
        if dem_source_candidatos:
            origem = dem_source_candidatos[0]
            print(f"[AVISO] 'dem_clipped.tif' não encontrado. Usando o DEM base disponível: {origem.name}")
            shutil.copy(origem, dem_clipped)
        else:
            raise FileNotFoundError(
                f"[ERRO] Nenhum DEM encontrado em {rasters_dir}. "
                f"Certifique-se de que o arquivo 'dem_source.tif' ou similar está na pasta output_rasters."
            )
            
    if not ottos_gpkg.exists():
        raise FileNotFoundError(f"[ERRO] Vetor de ottobacias não encontrado em: {ottos_gpkg}")

    wbt = inicializar_wbt()

    # 2. Execução do Pipeline Hidrológico (WhiteboxTools)
    print("[1/5] Preenchendo depressões do DEM (BreachDepressions)...")
    wbt.breach_depressions(dem=str(dem_clipped), output=str(dem_filled))

    print("[2/5] Calculando Direção de Fluxo D8...")
    wbt.d8_pointer(dem=str(dem_filled), output=str(flow_dir))

    print("[3/5] Calculando Acumulação de Fluxo D8...")
    wbt.d8_flow_accumulation(i=str(dem_filled), output=str(flow_acc), out_type="cells")

    print("[4/5] Extraindo canais de drenagem (Threshold otimizado: 2000 células)...")
    wbt.extract_streams(flow_accum=str(flow_acc), output=str(streams), threshold="2000")

    print("[5/5] Executando algoritmo HAND (Elevation Above Stream)...")
    wbt.elevation_above_stream(dem=str(dem_filled), streams=str(streams), output=str(hand_output))

    print("[SUCESSO] Raster HAND gerado com sucesso!")

    # 3. Pós-Processamento e Visualização Cartográfica
    print("[INFO] Carregando dados vetoriais para cartografia...")
    try:
        ottos_gdf = gpd.read_file(ottos_gpkg, layer="contrib_union")
    except Exception:
        ottos_gdf = gpd.read_file(ottos_gpkg)

    # Reprojeta para WGS84 para compatibilidade com Web Maps (Folium)
    ottos4326 = ottos_gdf.to_crs(epsg=4326)

    print("[INFO] Gerando visualizações cartográficas...")
    gerar_mapa_ottobacias(ottos4326, map_html)
    gerar_mapa_suscetibilidade_hand(dem_clipped, ottos_gpkg, map_png)

    print("[FINALIZADO] Pipeline executado de ponta a ponta com sucesso!")

if __name__ == "__main__":
    main()