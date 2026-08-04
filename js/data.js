// ============================================================================
// AMERICAS TECHGUARD
// Módulo de carregamento e organização dos dados
// ============================================================================

// Caminhos dos arquivos JSON utilizados pela aplicação.
const DATA_PATHS = {
    stations: "data/stations.json",
    telemetry: "data/telemetry.json",
    shelters: "data/shelters.json"
};


// ----------------------------------------------------------------------------
// Função genérica para carregar um arquivo JSON.
// ----------------------------------------------------------------------------

async function loadJSON(path) {
    const response = await fetch(path);

    // Verifica se o navegador conseguiu encontrar e carregar o arquivo.
    if (!response.ok) {
        throw new Error(
            `Não foi possível carregar "${path}". ` +
            `Status: ${response.status}`
        );
    }

    // Converte a resposta para um objeto JavaScript.
    return await response.json();
}


// ----------------------------------------------------------------------------
// Carrega todos os dados necessários para a aplicação.
// ----------------------------------------------------------------------------

async function loadApplicationData() {
    try {
        // Os três arquivos são carregados ao mesmo tempo.
        const [
            stationsData,
            telemetryData,
            sheltersData
        ] = await Promise.all([
            loadJSON(DATA_PATHS.stations),
            loadJSON(DATA_PATHS.telemetry),
            loadJSON(DATA_PATHS.shelters)
        ]);

        // Retorna os dados organizados.
        return {
            stations: stationsData.stations,
            telemetry: telemetryData.telemetry,
            shelters: sheltersData.shelters,

            metadata: {
                stations: stationsData.metadata,
                telemetry: telemetryData.metadata,
                shelters: sheltersData.metadata
            }
        };

    } catch (error) {
        // Exibe o erro no console do navegador.
        console.error(
            "[AMERICAS TECHGUARD] Erro ao carregar os dados:",
            error
        );

        // Interrompe a execução para evitar que o sistema use dados incompletos.
        throw error;
    }
}


// ----------------------------------------------------------------------------
// Procura um nó pelo seu identificador.
// ----------------------------------------------------------------------------

function getStationById(stations, stationId) {
    return stations.find(
        station => station.id === stationId
    );
}


// ----------------------------------------------------------------------------
// Junta uma leitura de telemetria às informações do nó correspondente.
// ----------------------------------------------------------------------------

function combineStationsAndTelemetry(stations, telemetry) {
    return telemetry.map(reading => {
        const station = getStationById(
            stations,
            reading.station_id
        );

        return {
            ...reading,

            // Informações do nó.
            station: station || null,

            // Nome e região facilitam o uso nas páginas.
            station_name: station?.name || "Nó não identificado",
            region: station?.region || "Região não identificada"
        };
    });
}


// ----------------------------------------------------------------------------
// Calcula um resumo geral das leituras.
// ----------------------------------------------------------------------------

function calculateTelemetrySummary(telemetry) {
    // Valores que possuem temperatura.
    const temperatures = telemetry
        .map(item => item.measurements.temperature_c)
        .filter(value => typeof value === "number");

    // Valores que possuem nível da água.
    const waterLevels = telemetry
        .map(item => item.measurements.water_level_m)
        .filter(value => typeof value === "number");

    // Valores que possuem chuva.
    const rainfallValues = telemetry
        .map(item => item.measurements.rainfall_mm)
        .filter(value => typeof value === "number");

    // Calcula a temperatura média.
    const averageTemperature =
        temperatures.length > 0
            ? temperatures.reduce(
                (sum, value) => sum + value,
                0
            ) / temperatures.length
            : null;

    // Obtém o maior nível de água.
    const highestWaterLevel =
        waterLevels.length > 0
            ? Math.max(...waterLevels)
            : null;

    // Obtém o maior valor de chuva.
    const highestRainfall =
        rainfallValues.length > 0
            ? Math.max(...rainfallValues)
            : null;

    return {
        averageTemperature,
        highestWaterLevel,
        highestRainfall,
        totalReadings: telemetry.length
    };
}