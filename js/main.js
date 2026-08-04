// ============================================================================
// AMERICAS TECHGUARD
// Inicialização e atualização da página inicial
// ============================================================================

document.addEventListener("DOMContentLoaded", async () => {

console.log(
    "[AMERICAS TECHGUARD] Iniciando aplicação..."
);

try {

    // Carrega stations.json, telemetry.json e shelters.json.
    const appData = await loadApplicationData();


    // Junta cada leitura às informações do nó correspondente.
    const completeTelemetry =
        combineStationsAndTelemetry(
            appData.stations,
            appData.telemetry
        );


    // Calcula os valores gerais da telemetria.
    const summary =
        calculateTelemetrySummary(
            completeTelemetry
        );


    // --------------------------------------------------------------------
    // Atualiza os valores visíveis na Home.
    // --------------------------------------------------------------------

    const temperatureElement =
        document.getElementById(
            "average-temperature"
        );

    const waterLevelElement =
        document.getElementById(
            "highest-water-level"
        );

    const rainfallElement =
        document.getElementById(
            "highest-rainfall"
        );

    const stationsElement =
        document.getElementById(
            "total-stations"
        );


    // Mostra a temperatura média.
    if (
        temperatureElement &&
        summary.averageTemperature !== null
    ) {
        temperatureElement.textContent =
            `${summary.averageTemperature.toFixed(1)} °C`;
    }


    // Mostra o maior nível de água.
    if (
        waterLevelElement &&
        summary.highestWaterLevel !== null
    ) {
        waterLevelElement.textContent =
            `${summary.highestWaterLevel.toFixed(2)} m`;
    }


    // Mostra o maior volume de chuva.
    if (
        rainfallElement &&
        summary.highestRainfall !== null
    ) {
        rainfallElement.textContent =
            `${summary.highestRainfall.toFixed(1)} mm`;
    }


    // Mostra a quantidade de nós cadastrados.
    if (stationsElement) {
        stationsElement.textContent =
            `${appData.stations.length} nós`;
    }


    // --------------------------------------------------------------------
    // Informações para teste no Console.
    // --------------------------------------------------------------------

    console.log(
        "Dados carregados:",
        appData
    );

    console.log(
        "Telemetria organizada:",
        completeTelemetry
    );

    console.log(
        "Resumo da telemetria:",
        summary
    );

} catch (error) {

    console.error(
        "[AMERICAS TECHGUARD] Falha ao iniciar:",
        error
    );

}

});
