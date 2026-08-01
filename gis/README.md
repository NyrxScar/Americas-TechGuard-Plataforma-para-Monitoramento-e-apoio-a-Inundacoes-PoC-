Aqui está um modelo de **`README.md`** profissional, direto e em português para você colocar dentro da pasta **`gis/`**. Ele explica exatamente como organizar o ambiente e onde posicionar os arquivos geoespaciais pesados que não vão para o Git.

---

### Crie um arquivo chamado `README.md` dentro de `gis/` com o seguinte conteúdo:

```markdown
# 🌍 Módulo de Processamento Geoespacial e Hidrológico (HAND) - TechGuard

Este módulo contém o pipeline geoespacial para o cálculo da metodologia **HAND (Height Above Nearest Drainage)** aplicado ao município de Blumenau, SC, como parte da plataforma **TechGuard**.

---

## 📂 Estrutura de Diretórios Esperada

Como arquivos raster (`.tif`) e vetoriais pesados (`.gpkg`) não são versionados no Git, você precisa estruturar as pastas locais da seguinte forma antes de executar o pipeline:

```text
gis/
├── calculate_hand.py          # Script orquestrador principal do pipeline
├── requirements.txt           # Dependências Python do módulo
├── README.md                  # Este manual de instruções
├── 📁 src/                    # Módulos auxiliares (visualização, processamento)
│   ├── __init__.py
│   └── visualization.py
├── 📁 output_rasters/         # <-- ONDE OS ARQUIVOS TIF DEVEM FICAR
│   ├── dem_source.tif         # (Opcional) DEM bruto original (~1.5GB)
│   └── dem_contrib_clipped.tif# (Obrigatório) DEM recortado de Blumenau
└── 📁 output_vectors/         # <-- ONDE OS ARQUIVOS VETORIAIS DEVEM FICAR
    └── ottobacias_blumenau_union.gpkg # Vetor unificado das bacias da região

```

---

## ⚙️ Instalação de Dependências

Certifique-se de estar com o Python atualizado (recomendado Python 3.14+) e instale as bibliotecas geoespaciais necessárias executando na pasta `gis/`:

```powershell
py -m pip install --upgrade pip
py -m pip install -r requirements.txt

```

---

## 📥 Obtenção dos Dados Brutos

Se você clonou o repositório recentemente e os arquivos raster/vetoriais não estão presentes na sua máquina:

1. **Baixe os dados base** (DEM de Blumenau e Ottobacias) no link de armazenamento compartilhado da equipe:
* [🔗 Link para Download dos Dados Geoespaciais - TechGuard (Exemplo: Google Drive / OneDrive)](https://www.google.com/search?q=INSERIR_LINK_AQUI)


2. **Posicione os arquivos** baixados nas respectivas pastas:
* Coloque o DEM recortado em: `gis/output_rasters/dem_contrib_clipped.tif`
* Coloque o GeoPackage em: `gis/output_vectors/ottobacias_blumenau_union.gpkg`



---

## 🚀 Como Executar o Pipeline

Com os dados nas pastas corretas e as dependências instaladas, execute o script orquestrador principal:

```powershell
py calculate_hand.py

```

O script irá processar o modelo digital de elevação, calcular o HAND via WhiteboxTools, salvar os resultados e disparar as janelas de visualização interativa (Folium/Plotly).

```

```