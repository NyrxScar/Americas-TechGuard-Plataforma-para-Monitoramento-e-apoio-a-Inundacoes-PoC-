-- ==============================================================================
-- AMERICAS TECHGUARD - SEED DE ESTAÇÕES DE MONITORAMENTO (BLUMENAU / SC)
-- ==============================================================================
-- Justificativa da Rede Mesh e Posicionamento Espacial:
-- Blumenau possui uma topografia recortada por morros e fundos de vale. Rádios LoRa
-- (Sub-GHz) dependem de Linha de Visada (Line-of-Sight - LoS).
-- A escolha dos pontos equilibra:
-- 1. Riscos Hidrológicos (Pontos de inundação e gargalos de escoamento).
-- 2. Engenharia de Rádio Mesh (Garantia de saltos entre cotas baixas e elevadas).
-- ==============================================================================

INSERT INTO estacoes_monitoramento (codigo_estacao, nome, rio, bairro, cota_alerta_m, cota_transbordo_m, geom)
VALUES 
    -- --------------------------------------------------------------------------
    -- NÓ 1: PONTE DE FERRO (CENTRO)
    -- Função: Sensor de Calha Principal / Ponto Crítico Urbano
    -- Motivo Espacial/Hidrológico: Local histórico de monitoramento da Defesa Civil.
    -- Fica no coração urbano de Blumenau onde a mancha de inundação atinge maior
    -- densidade populacional. Cota de alerta em 8m devido ao relevo do leito local.
    -- --------------------------------------------------------------------------
    (
        'NODE_BLU_001', 
        'Estação Ponte de Ferro (Centro)', 
        'Rio Itajaí-Açú', 
        'Ponta Aguda', 
        8.00, 
        10.00, 
        ST_SetSRID(ST_MakePoint(-49.0560, -26.9165), 4326)
    ),

    -- --------------------------------------------------------------------------
    -- NÓ 2: MORRO DA NOVA RÚSSIA
    -- Função: Nó Repetidor de Sinal (Mesh Repeater / High Ground)
    -- Motivo Espacial/Hidrológico: Localizado em cota topográfica elevada.
    -- Não serve apenas para medir o rio, mas para atuar como "Gateway/Torre" da
    -- rede Meshtastic. Ele garante visada direta (LoS) de 5km a 10km, recebendo
    -- os pacotes dos nós de fundo de vale e retransmitindo quando a celular/IP cair.
    -- --------------------------------------------------------------------------
    (
        'NODE_BLU_002', 
        'Repetidor Morro da Nova Rússia', 
        'Bacia do Garcia', 
        'Progresso', 
        12.00, 
        15.00, 
        ST_SetSRID(ST_MakePoint(-49.0700, -26.9350), 4326)
    ),

    -- --------------------------------------------------------------------------
    -- NÓ 3: CONFLUÊNCIA RIBEIRÃO GARCIA
    -- Função: Sensor de Afluente Crítico / Efeito Funil
    -- Motivo Espacial/Hidrológico: O Ribeirão Garcia é o principal afluente urbano.
    -- Quando o Rio Itajaí-Açú sobe, ele "represa" o Garcia, fazendo o bairro encher
    -- muito rápido (com cotas baixas de 3.5m a 5m). Ponto de alerta antecipado.
    -- --------------------------------------------------------------------------
    (
        'NODE_BLU_003', 
        'Confluência Ribeirão Garcia', 
        'Ribeirão Garcia', 
        'Garcia', 
        3.50, 
        5.00, 
        ST_SetSRID(ST_MakePoint(-49.0680, -26.9500), 4326)
    ),

    -- --------------------------------------------------------------------------
    -- NÓ 4: BAIRRO VORSTADT (JUZANTE)
    -- Função: Sensor de Escoamento Leste
    -- Motivo Espacial/Hidrológico: Posicionado na saída do fluxo de água de Blumenau
    -- em direção ao município de Gaspar. Permite calcular a taxa/velocidade de
    -- escoamento da bacia após o pico da enchente.
    -- --------------------------------------------------------------------------
    (
        'NODE_BLU_004', 
        'Estação Vorstadt (Juzante)', 
        'Rio Itajaí-Açú', 
        'Vorstadt', 
        7.50, 
        9.50, 
        ST_SetSRID(ST_MakePoint(-49.0380, -26.9230), 4326)
    )

-- Se o nó já existir no banco, atualiza os dados sem duplicar
ON CONFLICT (codigo_estacao) DO UPDATE SET
    nome = EXCLUDED.nome,
    cota_alerta_m = EXCLUDED.cota_alerta_m,
    cota_transbordo_m = EXCLUDED.cota_transbordo_m,
    geom = EXCLUDED.geom;