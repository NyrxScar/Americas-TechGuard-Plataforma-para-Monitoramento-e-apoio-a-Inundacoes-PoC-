-- 1. Habilita a extensão geoespacial PostGIS no PostgreSQL
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tabela dos NÓS (Estações Físicas de Monitoramento da Rede Mesh)
CREATE TABLE IF NOT EXISTS estacoes_monitoramento (
    id SERIAL PRIMARY KEY,
    codigo_estacao VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    rio VARCHAR(100) DEFAULT 'Rio Itajaí-Açú',
    bairro VARCHAR(100),
    cota_alerta_m NUMERIC(5, 2) NOT NULL,    -- Nível em metros para Alerta
    cota_transbordo_m NUMERIC(5, 2) NOT NULL, -- Nível em metros para Enchente/Inundação
    geom GEOMETRY(Point, 4326) NOT NULL,      -- Ponto GPS (Longitude, Latitude)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice espacial para buscas geográficas ultra-rápidas
CREATE INDEX IF NOT EXISTS idx_estacoes_geom ON estacoes_monitoramento USING GIST (geom);

-- 3. Tabela de HISTÓRICO DE LEITURAS (Telemetria enviada pelo Simulador/Rede IoT)
CREATE TABLE IF NOT EXISTS leituras_sensores (
    id BIGSERIAL PRIMARY KEY,
    codigo_dispositivo VARCHAR(50) NOT NULL,
    nivel_rio_m NUMERIC(5, 2) NOT NULL,
    chuva_acumulada_mm NUMERIC(5, 2) NOT NULL,
    temperatura_c NUMERIC(4, 1),
    umidade_pct NUMERIC(4, 1),
    nivel_risco VARCHAR(20) NOT NULL,
    modo_rede VARCHAR(20) NOT NULL,           -- LoRaWAN ou Meshtastic
    mesh_hops INT DEFAULT 0,
    bateria_pct INT DEFAULT 100,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice por data e dispositivo para acelerar gráficos e relatórios
CREATE INDEX IF NOT EXISTS idx_leituras_data ON leituras_sensores (codigo_dispositivo, data_hora DESC);