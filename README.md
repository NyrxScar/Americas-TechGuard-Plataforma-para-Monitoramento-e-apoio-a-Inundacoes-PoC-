# Americas TechGuard
## Plataforma para Monitoramento e Apoio a Inundações — Prova de Conceito

[![Status](https://img.shields.io/badge/Status-PoC%20Funcional-success?style=for-the-badge)](https://github.com/NyrxScar/Americas-TechGuard-Plataforma-para-Monitoramento-e-apoio-a-Inundacoes-PoC-)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![GIS](https://img.shields.io/badge/GIS-WhiteboxTools%20%7C%20Rasterio%20%7C%20GeoPandas-4CAF50?style=for-the-badge)](https://www.whiteboxgeo.com/)
[![IoT](https://img.shields.io/badge/IoT-LoRaWAN%20%7C%20Meshtastic-FF6B35?style=for-the-badge)](https://meshtastic.org)
[![Eixo](https://img.shields.io/badge/Eixo-Integra%C3%A7%C3%A3o%20de%20Sistemas-blueviolet?style=for-the-badge)](#)

---

| Campo | Informação |
|---|---|
| **Estudante** | Nyrx Oliveira de Aquino Farias |
| **Eixo** | Integração de Sistemas — Dados Ambientais, IA, Nowcasting, LoRa/Meshtastic, Alertas Móveis |
| **Modalidade** | Prova de Conceito (PoC) |
| **Período** | 20/07/2026 até 06/08/2026 |
| **Docentes** | Valério Piana, Lucas Lacerda e Alex Salazar |

---

# 🟢 PARTE 1: IMPLEMENTAÇÃO ATUAL DA PROVA DE CONCEITO (`branch: Min_Poc`)

Esta primeira parte do documento descreve a **versão funcional executável** presente no repositório.

---

## 📌 Sobre o Projeto

A **Americas TechGuard** é uma plataforma integrada de monitoramento hidrológico e apoio à tomada de decisão em cenários de inundação. Esta Prova de Conceito demonstra, de ponta a ponta, o pipeline completo de um sistema real: desde a simulação de sensores IoT de campo até a classificação geoespacial de risco de inundação, com base no modelo hidrológico HAND (Height Above Nearest Drainage) aplicado à bacia do Rio Itajaí-Açú, no município de **Blumenau/SC** — uma das regiões com maior histórico de cheias do Brasil.

O projeto foi desenvolvido de forma inteiramente local (sem dependência de infraestrutura de nuvem), com todos os dados, modelos e processamentos executáveis a partir do próprio repositório.

---

## 🎯 Objetivos da PoC Atual

- Simular uma rede de sensores IoT resiliente (LoRaWAN + Meshtastic) que transmite telemetria ambiental mesmo em cenários de falha de infraestrutura;
- Processar dados geoespaciais reais (DEM/HAND) para produzir uma matriz de suscetibilidade topográfica à inundação;
- Cruzar telemetria de campo com dados HAND para classificar o risco hidrológico por estação, de forma fundamentada e explicável;
- Demonstrar um pipeline funcional de dados que vai do sensor à classificação de risco final, consumível por um dashboard web;
- Contribuir com uma base técnica sólida para evolução futura em direção a um sistema de alerta precoce real.

---

## ⚙️ Justificativa

### Qual problema a solução busca resolver

Eventos de inundação extrema no Vale do Itajaí causam perdas humanas e materiais recorrentes. A falta de sistemas locais de monitoramento em tempo real, especialmente em cenários onde a infraestrutura de comunicação (energia elétrica, redes celulares) é a primeira a falhar, compromete a capacidade de resposta de Defesa Civil e comunidades.

Este projeto propõe uma arquitetura de sensoriamento resiliente que opera sobre redes de rádio de baixo consumo (LoRaWAN e Meshtastic), capaz de continuar transmitindo dados críticos mesmo durante o colapso das redes convencionais.

### Quem é o usuário da tecnologia

- **Defesa Civil municipal** — para monitoramento contínuo e acionamento de alertas;
- **Gestores de emergência** — para apoio à tomada de decisão sobre evacuação e ativação de abrigos;
- **Pesquisadores e técnicos em hidrologia** — para análise e calibração do modelo de risco;
- **Comunidades em zonas de risco** — como receptoras finais dos alertas gerados.

---

## 🏗️ Arquitetura e Pipeline da PoC Executável

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE CAMPO (IoT)                        │
│                                                                 │
│  [Nó ATG_BLU_001]  [Nó ATG_BLU_002]  [Nó ATG_BLU_003]        │
│  Ponte de Ferro     Morro Nova Rússia   Ribeirão Garcia         │
│       │                   │                   │                 │
│       └──── LoRaWAN ──────┴──── Mesh ─────────┘                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Telemetria (JSON/MQTT simulado)
┌─────────────────────────▼───────────────────────────────────────┐
│                SIMULADOR IoT  (IOT/simulator.py)                │
│  • Gera payloads UUID v4 validados                              │
│  • 3 cenários: NORMAL / DEGRADACAO_LORA / INDISPONIBILIDADE     │
│  • Saída: data/processed/telemetry_output.json                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────────┐
          │                                   │
┌─────────▼──────────┐             ┌──────────▼──────────────────┐
│  PIPELINE GIS      │             │  MOTOR DE RISCO             │
│  (gis/)            │             │  (IOT/risk_engine.py)       │
│                    │             │                             │
│ calculoHand        │             │ • Carrega hand_metrics.json │
│ Inteiro.py         │             │ • Projeta coords → UTM 22S  │
│ → hand.tif         │             │ • KDTree: busca HAND mais   │
│                    │             │   próximo (raio 500m)       │
│ export_hand        │             │ • Classificação multicritério│
│ _json.py           │─────────────▶   SEGURO / ATENÇÃO /        │
│ → hand_metrics     │             │   ALERTA / CRÍTICO          │
│   .json            │             │                             │
└────────────────────┘             │ Saída:                      │
                                   │ telemetry_processed_        │
                                   │ with_risk.json              │
                                   └─────────────────────────────┘
```

---

## 📥 Dados de Entrada

| Fonte | Tipo | Descrição |
|---|---|---|
| **Simulador IoT** | JSON (telemetria) | Payloads de sensores: nível de água (m), chuva acumulada (mm), bateria, status de rede |
| **Raster HAND** (`hand.tif`) | GeoTIFF | Elevação relativa à drenagem, derivado de DEM Copernicus GLO-30 e Ottobacias ANA |
| **`hand_metrics.json`** | JSON espacial | ~21 MB — matriz de suscetibilidade HAND com lat/lon, valor HAND (m), classe e peso de risco |
| **`shelters.json`** | JSON | 4 abrigos municipais simulados de Blumenau com capacidade, ocupação e localização |

---

## 🔄 Como os Dados São Processados na PoC

### 1. Geração de Telemetria (`IOT/simulator.py`)

O `IoTSimulator` itera sobre 3 estações cadastradas em 3 ciclos determinísticos que simulam a progressão de um evento de cheia:

| Ciclo | Cenário | Status de Rede | Nível d'água | Chuva Acum. |
|---|---|---|---|---|
| 1 | `NORMAL` | `connected` | 1,90 m | 2,5 mm |
| 2 | `DEGRADACAO_LORA` | `debouncing` / `fallback_active` | 2,30 m | 5,0 mm |
| 3 | `INDISPONIBILIDADE_DUPLA` | `unavailable` | 2,70 m | 7,5 mm |

Cada payload é validado por `TelemetryValidator` contra contrato estrito (UUID v4, ISO 8601 UTC, limites físicos). O módulo `PayloadCompactor` demonstra a economia de ~60% no tamanho do JSON para redes de rádio LPWAN.

### 2. Pipeline Geoespacial HAND (`gis/`)

O script `calculoHandInteiro.py` executa o pipeline completo de modelagem hidrológica via WhiteboxTools (D8 Flow Accumulation, Stream Extraction, Elevation Above Stream) e `export_hand_json.py` converte o raster em matriz de pontos espacializada.

**Tabela de classificação HAND:**

| Classe | Faixa HAND | Peso de Risco | Interpretação |
|---|---|---|---|
| `ALTA` | 0 – 3 m | 1,00 | Zona de várzea — inundação frequente |
| `MEDIA` | 3 – 10 m | 0,60 | Zona de risco moderado |
| `BAIXA` | 10 – 25 m | 0,25 | Baixa suscetibilidade |
| `MUITO_BAIXA` | > 25 m | 0,05 | Terreno elevado — risco desprezível |

### 3. Motor de Risco Multicritério (`IOT/risk_engine.py`)

O `RiskEngine` cruza a telemetria com a matriz HAND indexada via **KDTree em coordenadas UTM 22S**:
- **Com dado HAND:** classifica em SEGURO, ATENÇÃO, ALERTA ou CRÍTICO com justificativa explicável (`risk_justification`).
- **Modo de contingência:** ativação automática de fallback por regra puramente telemétrica caso o ponto HAND não esteja no raio de 500m.

---

## 🚨 Como o Risco é Identificado e o Alerta é Gerado

O risco é **geoespacialmente fundamentado**: o mesmo nível de água em terrenos diferentes recebe classificações distintas. Um sensor marcando 1,9m em várzea (HAND < 3m, peso 1,00) é `ALERTA`; o mesmo valor em terreno elevado (HAND > 10m) seria `ATENÇÃO`.

### Exemplo real de saída do Risk Engine

```json
{
  "station_id": "ATG_BLU_001",
  "readings": { "water_level_m": 2.7, "rainfall_accumulated_mm": 7.5 },
  "risk_assessment": {
    "hand_value_m": 1.79,
    "hand_risk_factor": 1.0,
    "topographic_susceptibility": "ALTA",
    "hand_match_distance_m": 29.44,
    "risk_classification": "CRITICO",
    "risk_justification": "Nível crítico de água (2.7m) superou o limiar de emergência. Suscetibilidade local HAND: ALTA (1.79m).",
    "contingency_mode": false
  }
}
```

---

## 🖥️ Como o Usuário Visualiza a Informação

- **Mapa Folium interativo** (`data/mapa_estacoes.html`) — exibe os nós de monitoramento com popups de status de rede, nível de água e chuva por ciclo, com camada de estado consolidado (último registro de cada estação);
- **JSON processado** (`telemetry_processed_with_risk.json`) — consumível por qualquer dashboard web ou sistema GIS, com classificação de risco e justificativa explicável para cada leitura.

---

## 📂 Estrutura do Repositório (`branch: Min_Poc`)

```
Americas-TechGuard-PoC/
│
├── IOT/
│   ├── simulator.py               # Simulador de telemetria IoT (3 estações, 3 cenários)
│   └── risk_engine.py             # Motor de risco geoespacial multicritério
│
├── gis/
│   ├── calculoHandInteiro.py      # Pipeline completo HAND (DEM → WhiteboxTools → rasters)
│   ├── export_hand_json.py        # Exportação do raster HAND para JSON consumível
│   ├── outputs_dem/
│   │   └── dem_recortado.tif      # Modelo Digital de Elevação recortado (Copernicus GLO-30)
│   ├── outputs_hand/
│   │   ├── hand.tif               # Raster principal HAND (Altura sobre a Drenagem)
│   │   ├── dem_breached.tif       # DEM com condicionamento hidrológico
│   │   ├── d8_pntr.tif            # Direção de fluxo D8
│   │   ├── d8_flw.tif             # Acumulação de fluxo
│   │   └── streams.tif            # Rede de drenagem extraída
│   └── output_maps/
│       ├── mapa_ottobacias_blumenau.html          # Mapa de bacias hidrográficas
│       ├── mapa_suscetibilidade_hand_blumenau.html# Mapa de suscetibilidade HAND
│       └── relevo_blumenau_3d.html                # Visualização 3D do relevo
│
├── data/
│   ├── input/
│   │   └── shelters.json                       # Abrigos municipais simulados (4 unidades)
│   └── processed/
│       ├── hand_metrics.json                   # Matriz HAND (~21 MB)
│       ├── telemetry_output.json               # Saída bruta do simulator.py
│       └── telemetry_processed_with_risk.json  # Telemetria enriquecida com risco
│
├── requirements.txt               # Dependências Python do projeto
└── README.md                      # Este documento
```

---

## 🛠️ Linguagens, Bibliotecas e Dependências

| Categoria | Tecnologia |
|---|---|
| Linguagem | Python 3.10+ |
| GIS / Hidrologia | WhiteboxTools |
| Geoespacial | GeoPandas, Rasterio, Fiona, Shapely |
| Projeção de coordenadas | PyProj |
| Indexação espacial | SciPy (KDTree) |
| DEM via STAC | planetary-computer, pystac-client |
| Rasters | rioxarray, xarray, numpy |
| Mapas interativos | Folium |
| IoT / MQTT | paho-mqtt |

---

# 🚀 Guia de Execução Sequencial da PoC

Este documento apresenta o passo a passo para configurar o ambiente e executar todos os módulos da **PoC Americas TechGuard**, seguindo o fluxo completo:

PS: Não esqueça de acessar e usar a branch Min_Poc

---

# 1. Preparação do Ambiente (Windows)

## 1.1 Criar ambiente virtual

Na raiz do projeto:

```powershell
python -m venv .venv
```

Ativar o ambiente virtual:

```powershell
.\.venv\Scripts\activate
```

Validar instalação:

```powershell
python --version
pip --version
```

---

# 2. Redução do Caminho do Projeto (Recomendado no Windows)

## ⚠️ Por que utilizar?

O pipeline utiliza bibliotecas geoespaciais que podem apresentar falhas quando o caminho absoluto do projeto é muito extenso.

Principais bibliotecas afetadas:

- Rasterio
- GDAL
- PROJ
- GeoPandas
- WhiteboxTools

Para evitar problemas de limite de caminho do Windows, recomenda-se utilizar uma unidade virtual com `subst`.

---

## 2.1 Criar unidade virtual

Execute:

```powershell
subst X: "CAMINHO_COMPLETO_DA_RAIZ_DO_PROJETO"
```

Exemplo:

```powershell
subst X: "C:\Users\Delcio\Documents\Americas-TechGuard-Plataforma-para-Monitoramento-e-apoio-a-Inundacoes-PoC-"
```

Acesse a unidade:

```powershell
X:
```

Ative novamente o ambiente virtual:

```powershell
.\.venv\Scripts\activate
```

---

# 3. Instalação das Dependências

Instale todas as dependências do projeto:

```powershell
pip install -r requirements.txt
```

Principais componentes:

| Biblioteca | Utilização |
|---|---|
| GeoPandas | Manipulação de dados vetoriais |
| Rasterio | Processamento de dados raster |
| GDAL | Operações geoespaciais |
| PyProj | Transformação de coordenadas |
| WhiteboxTools | Processamento hidrológico HAND |

---

# 4. Inicialização do WhiteboxTools

Na primeira execução, o WhiteboxTools realiza automaticamente o download do binário necessário.

Execute:

```powershell
python -c "from whitebox import WhiteboxTools; wbt=WhiteboxTools(); print(wbt.version())"
```

Saída esperada:

```text
WhiteboxTools v2.4.0
```

> Caso uma página do navegador seja aberta durante o download, basta fechá-la e retornar ao terminal.

---

# 5. Configuração da Variável PROJ (Windows)

Antes de executar o pipeline:

```powershell
$env:PROJ_LIB=""
```

Essa configuração evita conflitos entre:

- Instalação PROJ do PostgreSQL/PostGIS;
- Instalação PROJ utilizada pelo Python (`pyproj`).

---

# 6. Execução do Pipeline Geoespacial HAND 🌎

Execute:

```powershell
python gis/calculoHandInteiro.py
```

O pipeline realiza:

1. Download dos limites municipais do IBGE;
2. Seleção da área de estudo;
3. Consulta das Ottobacias ANA;
4. Aquisição do Modelo Digital de Elevação;
5. Recorte e preparação do DEM;
6. Processamento hidrológico HAND;
7. Geração dos mapas e produtos finais.

---
## Saídas geradas

Produtos gerados:

- Modelo Digital de Elevação processado;
- Raster HAND;
- Mapas interativos;
- Dados utilizados pelo motor de risco.

---

# 7. Exportação da Matriz HAND 📊

Após o processamento geoespacial:

```powershell
python gis/export_hand_json.py
```

Saída:

```text
data/
└── processed/
    └── hand_metrics.json
```

O arquivo contém os valores derivados do modelo HAND utilizados pelo sistema de análise de risco.

---

# 8. Execução do Simulador IoT 📡

Execute:

```powershell
python IOT/simulator.py
```

O simulador gera dados telemétricos dos sensores virtuais.

Saídas:

```text
data/
├── processed/
│   └── telemetry_output.json
│
└── mapa_estacoes.html
```

Dados produzidos:

- Identificação dos sensores;
- Localização geográfica;
- Leituras simuladas;
- Histórico temporal.

---

# 9. Execução do Risk Engine ⚠️

Execute:

```powershell
python IOT/risk_engine.py
```

O motor de risco realiza o cruzamento entre:

- Dados simulados dos sensores IoT;
- Informações topográficas do HAND;
- Regras de classificação de risco.


# ⚠️ Observação Importante — Windows

Em ambientes Windows, recomenda-se:

✅ Utilizar `subst` para reduzir o caminho absoluto do projeto;

ou

✅ Manter o projeto em um caminho curto:

```text
C:\Projects\Americas-TechGuard
```

Isso evita problemas relacionados ao limite máximo de caminhos utilizados por bibliotecas geoespaciais.

Bibliotecas afetadas:

- GDAL;
- Rasterio;
- GeoPandas;
- WhiteboxTools.

---

## 🧩 Status Atual dos Componentes Funcionais (O que está pronto vs. O que falta)

| Componente | Status Atual (`Min_Poc`) | Escopo Implementado |
|---|---|---|
| **Simulador IoT** | ✅ Pronto | 3 estações, 3 cenários de falha, validação de contrato UUIDv4 |
| **Compactador LPWAN** | ✅ Pronto | Redução estimada de ~60% de payload JSON para rádio |
| **Pipeline HAND GIS** | ✅ Pronto | DEM Copernicus → WhiteboxTools → Raster HAND |
| **Matriz Spatial HAND** | ✅ Pronto | Conversão para JSON espacializado (~21 MB) |
| **Engine de Risco KDTree** | ✅ Pronto | Busca espacial UTM Zona 22S + Regras Multicritério |
| **Modo de Contingência** | ✅ Pronto | Fallback automático quando dado HAND ausente |
| **Mapa Folium** | ✅ Pronto | Mapa HTML interativo por ciclo + consolidado |
| **Dashboard React/Web** | 🔲 Futuro | Interface gráfica web para navegação do usuário |
| **API REST Node.js** | 🔲 Futuro | Servidor para ingestão e distribuição contínua |
| **Banco PostGIS** | 🔲 Futuro | Banco de dados espacial persistente |
| **App Mobile Expo** | 🔲 Futuro | Aplicativo móvel para Cidadão e Defesa Civil |

---

## ⚠️ Limitações Atuais da PoC

1. **Dados simulados:** telemetria é gerada deterministicamente por software, sem hardware físico real.
2. **Rede IoT em software:** o comportamento de LoRaWAN e Meshtastic é representado por lógica simulada.
3. **Escala local (3 nós):** topologia cobrindo 3 pontos representativos de Blumenau.
4. **Resolução DEM 30m:** modelo HAND construído com Copernicus GLO-30 (LiDAR local traria mais detalhe).
5. **Sem persistência em BD:** nesta versão, a persistência é feita via arquivos JSON estruturados.

---

## ✨ Diferenciais Técnicos da Solução

- **Classificação espacialmente fundamentada:** risco correlacionado com a topografia local (HAND) e não apenas altura da água;
- **Resiliência por design:** failover automático LoRaWAN ➔ Meshtastic com mecanismo de debounce;
- **Motor Explicável:** cada resultado traz a justificativa textual (`risk_justification`) da decisão;
- **Modo de Contingência:** garante que falhas de dados geoespaciais nunca silenciem um alerta.

---
---

# 🔵 PARTE 2: PLANEJAMENTO FUTURO & ARQUITETURA TARGET (`Relatório Técnico`)

Esta segunda parte apresenta o **planejamento de evolução futura** e a **especificação arquitetural da plataforma expandida** (Full-Stack).

---

> [!NOTE]
> **Aviso de Escopo:** Os tópicos abaixo descrevem a especificação conceitual, modelo de dados e planejamento de rotas/telas projetados para a versão completa do sistema (Mobile + API REST + PostGIS), a ser desenvolvida nas próximas etapas do projeto.

---

## 📑 Arquitetura Expandida Target (Mobile + Web + API REST + PostGIS)

```
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND (Expo / React Native / Web)               │
│  • Visitante            • Cidadão            • Defesa Civil     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON (API REST)
┌────────────────────────────────▼────────────────────────────────┐
│                   BACKEND (Node.js / Express)                   │
│  • Autenticação & Sessões     • Ingestão de Telemetria          │
│  • Rotas de Alertas & Abrigos • Serviços CRUD GeoJSON           │
└────────────────────────────────┬────────────────────────────────┘
                                 │ SQL / PostGIS
┌────────────────────────────────▼────────────────────────────────┐
│           BANCO DE DADOS ESPACIAL (PostgreSQL + PostGIS)        │
│  • Banco: americas_techguard                                    │
│  • Geometrias: EPSG:4326 (Point, Polygon, MultiPolygon)         │
└────────────────────────────────▲────────────────────────────────┘
                                 │ Telemetria & GeoJSON
┌────────────────────────────────┴────────────────────────────────┐
│               SIMULADOR & GIS (Python Engine)                   │
│  • WhiteboxTools / HAND        • Engine de Risco                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👤 Especificação dos Perfis de Usuários (Futuro)

1. **Visitante (Sem autenticação):** Acesso a mapa de risco público, lista de abrigos ativos e alertas gerais.
2. **Cidadão (Usuário Autenticado):** Painel pessoal com alertas da sua localização, detalhes de abrigos e envio de solicitações de novos abrigos comunitários.
3. **Operador da Defesa Civil (Painel Administrativo):** Dashboard operacional em tempo real, aprovação/recusa de abrigos comunitários e emissão/encerramento de alertas públicos.

---

## 📱 Planejamento das 25 Telas / Rotas do Aplicativo

| Grupo de Rotas | Telas Planejadas |
|---|---|
| **Públicas (9)** | `index`, `splash`, `access`, `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `privacy-policy` |
| **Cidadão (9)** | `home`, `map`, `shelters`, `shelter-details`, `register-shelter`, `alerts`, `profile`, `edit-profile`, `settings` |
| **Defesa Civil (7)** | `dashboard`, `pending-shelters`, `shelter-review`, `registered-shelters`, `telemetry`, `risk-analysis`, `alerts-management` |

---

## 🗄️ Modelo do Banco de Dados Espacial (`PostgreSQL + PostGIS`)

A arquitetura do banco `americas_techguard` prevê 9 tabelas relacionais e espaciais:
- `users` (contas e papéis `citizen`/`civil_defense`/`administrator`);
- `stations` (nós com geometria `GEOMETRY(Point, 4326)`);
- `sensor_readings` (historização de leituras de água e chuva);
- `shelters` (abrigos oficiais com geometria espacial);
- `shelter_requests` (fluxo de aprovação de abrigos enviados por cidadãos);
- `alerts` (gerenciamento de alertas com níveis de severidade `low`/`moderate`/`high`/`critical`);
- `risk_assessments`, `password_reset_tokens`, `refresh_tokens`.

---

## 🔭 Roadmap dos Próximos Passos de Desenvolvimento

1. **Fase 1 — Dashboard Web Local:** Construção do dashboard HTML/JS consumindo os JSONs gerados localmente.
2. **Fase 2 — Backend API REST & PostGIS:** Implementação do servidor Node.js/Express e criação do banco `americas_techguard`.
3. **Fase 3 — Aplicativo Mobile Expo:** Desenvolvimento das telas React Native para cidadãos e Defesa Civil.
4. **Fase 4 — Integração MQTT Real:** Conexão com brokers e gateways LoRaWAN físicos (RAK/Heltec).
5. **Fase 5 — Nowcasting Hidrológico:** Integração de dados de radar/previsão meteorológica para horizonte de 1–6h.
6. **Fase 6 — Alertas Push:** Envio de notificações via Firebase (FCM) / SMS.

---

## 🔬 Referências Científicas e Técnicas

1. **Development of a smart sensing unit for LoRaWAN-based IoT flood monitoring and warning system in catchment areas**  
   *Internet of Things and Cyber-Physical Systems*, 2023. DOI: [10.1016/j.iotcps.2023.04.005](https://www.sciencedirect.com/science/article/pii/S2667345223000263)

2. **A Meshtastic-based LoRa Mesh System for Smart Campus Applications: From Solar-Powered Sensing to Containerized Data Management**  
   *arXiv*, 2026. Link: [https://arxiv.org/abs/2605.20379](https://arxiv.org/abs/2605.20379)

3. **Documentações de Referência:**
   - [Meshtastic MQTT/JSON Configuration](https://meshtastic.org/docs/software/integrations/mqtt/)
   - [Meshtastic Telemetry Module](https://meshtastic.org/docs/configuration/module/telemetry/)
   - [WhiteboxTools User Manual — Hydrological Analysis](https://www.whiteboxgeo.com/manual/wbt_book/available_tools/hydrological_analysis.html)
   - [Modelo HAND — Nobre et al., 2011](https://doi.org/10.1029/2011WR011275)

---

## 📜 Licença

Este projeto é disponibilizado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

</div>
