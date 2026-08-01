from pathlib import Path
import geopandas as gpd
import rasterio
import rioxarray as rxr
import xarray as xr
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as colors
import contextily as cx
import folium

def gerar_mapa_ottobacias(ottos4326: gpd.GeoDataFrame, output_html: Path):
    """Gera o mapa interativo em Folium das Ottobacias com Tooltip."""
    if ottos4326.crs is None:
        raise ValueError("O GeoDataFrame 'ottos4326' não possui um CRS definido.")

    # Projeta para um CRS plano temporariamente para calcular o centroide correto sem warnings
    if ottos4326.crs.is_geographic:
        ottos_projected = ottos4326.to_crs(epsg=31982)  # SIRGAS 2000 / UTM zone 22S
        centro_x = ottos_projected.geometry.centroid.x.mean()
        centro_y = ottos_projected.geometry.centroid.y.mean()
        ponto_medio = gpd.GeoSeries([gpd.points_from_xy([centro_x], [centro_y])[0]], crs="EPSG:31982").to_crs("EPSG:4326")
        centro_mapa = [ponto_medio.y.iloc[0], ponto_medio.x.iloc[0]]
    else:
        centro_mapa = [ottos4326.geometry.centroid.y.mean(), ottos4326.geometry.centroid.x.mean()]
    
    mapa_interativo = folium.Map(''
        location=centro_mapa,
        zoom_start=11,
        tiles="CartoDB positron"
    )

    folium.GeoJson(
        ottos4326,
        name="Áreas de Contribuição Hidrográfica (Ottobacias)",
        style_function=lambda feature: {
            "fillColor": "#3388ff",
            "color": "#0044cc",
            "weight": 1.5,
            "fillOpacity": 0.2,
        },
        highlight_function=lambda feature: {
            "fillColor": "#e63946",
            "color": "#1d3557",
            "weight": 2.0,
            "fillOpacity": 0.6,
        },
        tooltip=folium.GeoJsonTooltip(
            fields=["name"],
            aliases=["Bacia / Ottobacia:"],
            localize=True,
            sticky=True,
            style="background-color: #ffffff; border: 1px solid #1d3557; font-family: sans-serif; font-size: 12px; padding: 10px;"
        )
    ).add_to(mapa_interativo)

    folium.LayerControl().add_to(mapa_interativo)
    mapa_interativo.save(str(output_html))
    print(f"[INFO] Mapa interativo de ottobacias salvo em: {output_html}")


def gerar_mapa_suscetibilidade_hand(dem_clipped: Path, ottos_union_gpkg: Path, output_png: Path = None):
    """Processa e plota o mapa refinado de suscetibilidade a inundações (HAND)."""
    try:
        union_gdf = gpd.read_file(ottos_union_gpkg, layer="contrib_union")
    except Exception:
        union_gdf = gpd.read_file(ottos_union_gpkg)

    union_3857 = union_gdf.to_crs(3857)
    bbox = union_3857.total_bounds

    hand_source = dem_clipped.parent / "hand.tif"
    
    print("[INFO] Carregando e reprojetando o raster HAND para cartografia...")
    r_hand = (
        rxr.open_rasterio(hand_source, masked=True)
        .squeeze("band", drop=True)
        .astype("float32")
        .rio.reproject(3857)
    )

    r_hand = r_hand.rio.clip(union_3857.geometry, union_3857.crs, drop=True)

    valid = np.isfinite(r_hand)
    t1, t2, t3 = 3, 10, 25

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

    img = r_clean.plot(ax=ax, cmap=cmap_hydro, norm=norm_hydro, alpha=0.60, add_colorbar=False)

    union_3857.plot(ax=ax, facecolor="none", edgecolor="white", linewidth=1.2, alpha=0.9, zorder=3)
    cx.add_basemap(ax, source=cx.providers.Esri.WorldImagery, attribution_size=6)

    ax.set_xlim(bbox[0], bbox[2])
    ax.set_ylim(bbox[1], bbox[3])

    cbar = fig.colorbar(img, ax=ax, orientation="vertical", shrink=0.5, pad=0.03)
    cbar.set_label("Suscetibilidade a Inundação (HAND)", fontsize=11, weight="bold", labelpad=15, rotation=270)
    cbar.set_ticks([0, 1, 2])
    cbar.ax.set_yticklabels(["ALTA (0-3m)\nCalha do Rio", "MÉDIA (3-10m)\nVárzeas", "BAIXA (10-25m)\nTerraços"], fontsize=9, weight="bold")
    cbar.ax.tick_params(length=0)
    cbar.ax.invert_yaxis()

    ax.set_axis_off()
    ax.set_title("Mapa de Suscetibilidade de Inundação - Blumenau/SC\n(Modelo HAND)", fontsize=14, weight="bold", pad=15)

    plt.tight_layout()
    if output_png:
        plt.savefig(output_png, dpi=300, bbox_inches='tight')
    plt.show()
    print("[INFO] Mapa de suscetibilidade gerado com sucesso!")