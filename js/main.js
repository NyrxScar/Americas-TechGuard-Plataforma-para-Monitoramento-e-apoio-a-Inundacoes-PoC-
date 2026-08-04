// ============================================================================
// AMERICAS TECHGUARD
// Inicialização e atualização da Home Dashboard
// ============================================================================


document.addEventListener(
    "DOMContentLoaded",
    async () => {


    console.log(
        "[AMERICAS TECHGUARD] Inicializando dashboard..."
    );


    try {


        const appData =
            await loadApplicationData();



        const completeTelemetry =
            combineStationsAndTelemetry(
                appData.stations,
                appData.telemetry
            );



        const summary =
            calculateTelemetrySummary(
                completeTelemetry
            );



        updateStationCards(
            appData.stations
        );



        updateTelemetryCards(
            summary
        );



        updateShelterCard(
            appData.shelters
        );



        updateCriticalSensors(
            completeTelemetry
        );



        loadHANDMap(
            appData.riskMaps
        );



        console.log(
            "[AMERICAS TECHGUARD] Dashboard carregado."
        );


    } catch(error){


        console.error(
            "[AMERICAS TECHGUARD] Erro:",
            error
        );


    }


});





// ============================================================================
// Atualiza sensores
// ============================================================================


function updateStationCards(stations){


    const online =
        stations.filter(
            station =>
            station.status === "online"
        ).length;



    const offline =
        stations.filter(
            station =>
            station.status !== "online"
        ).length;



    document
    .getElementById(
        "active-stations"
    )
    .textContent =
        online;



    document
    .getElementById(
        "offline-stations"
    )
    .textContent =
        offline;


}






// ============================================================================
// Atualiza dados ambientais
// ============================================================================


function updateTelemetryCards(summary){


    const water =
        document.getElementById(
            "highest-water-level"
        );


    const rain =
        document.getElementById(
            "highest-rainfall"
        );


    if(water){

        water.textContent =
            summary.highestWaterLevel !== null
            ?
            `${summary.highestWaterLevel.toFixed(2)} m`
            :
            "--";

    }



    if(rain){

        rain.textContent =
            summary.highestRainfall !== null
            ?
            `${summary.highestRainfall.toFixed(1)} mm`
            :
            "--";

    }


}






// ============================================================================
// Atualiza abrigos
// ============================================================================


function updateShelterCard(shelters){


    const element =
        document.getElementById(
            "total-shelters"
        );


    if(element){

        element.textContent =
            shelters.length;

    }


}







// ============================================================================
// Sensores críticos
// ============================================================================


function updateCriticalSensors(
    telemetry
){


    const container =
        document.getElementById(
            "critical-list"
        );



    if(!container)
        return;



    const critical =
        telemetry.filter(
            item =>
            item.risk === "high" ||
            item.risk === "critical"
        );



    if(critical.length === 0){


        container.innerHTML = `

        <p>
        Nenhum sensor em estado crítico.
        </p>

        `;


        return;

    }



    container.innerHTML =
        critical.map(sensor => `

        <div class="critical-item">

            <strong>
            ${sensor.station_name}
            </strong>

            <span>
            ${sensor.measurements.water_level_m} m
            </span>

        </div>


        `).join("");


}







// ============================================================================
// GIS HAND
// ============================================================================


function loadHANDMap(
    riskMaps
){


    const map =
        getRiskMapById(
            riskMaps,
            "hand_blumenau"
        );


    if(map){

        console.log(
            "[GIS] HAND disponível:",
            map.file
        );

    }


}