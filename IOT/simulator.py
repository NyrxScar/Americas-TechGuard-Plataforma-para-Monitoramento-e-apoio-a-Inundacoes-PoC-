import os
import json
import time
import uuid

from datetime import datetime, timezone


# ============================================================
# CONFIGURAÇÕES GERAIS
# ============================================================

DATA_DIR = "../data"

STATIONS_FILE = os.path.join(
    DATA_DIR,
    "stations.json"
)

TELEMETRY_FILE = os.path.join(
    DATA_DIR,
    "telemetry.json"
)


os.makedirs(DATA_DIR, exist_ok=True)


PROJECT_NAME = "Americas TechGuard"

MUNICIPALITY = "Blumenau"

STATE = "SC"

COUNTRY = "Brazil"



# ============================================================
# ESTAÇÕES IoT SIMULADAS
# ============================================================

STATION_CONFIGURATION = [

    {
        "id": "ATG_BLU_001",
        "name": "Nó Centro",
        "region": "Centro",

        "latitude": -26.9188,
        "longitude": -49.0662,

        "sensors": [
            "water_level",
            "rainfall",
            "temperature",
            "humidity"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "LoRaWAN",

            "lorawan_available": True,
            "mesh_available": True
        },

        "status": "online"
    },


    {
        "id": "ATG_BLU_002",
        "name": "Nó Garcia",
        "region": "Garcia",

        "latitude": -26.9502,
        "longitude": -49.0815,

        "sensors": [
            "water_level",
            "rainfall",
            "temperature"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "LoRaWAN",

            "lorawan_available": True,
            "mesh_available": True
        },

        "status": "online"
    },


    {
        "id": "ATG_BLU_003",
        "name": "Nó Itoupava Norte",
        "region": "Itoupava Norte",

        "latitude": -26.8948,
        "longitude": -49.0668,

        "sensors": [
            "water_level",
            "rainfall",
            "temperature",
            "humidity"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "Mesh",

            "lorawan_available": False,
            "mesh_available": True
        },

        "status": "online"
    },


    {
        "id": "ATG_BLU_004",
        "name": "Nó Itoupava Central",
        "region": "Itoupava Central",

        "latitude": -26.8706,
        "longitude": -49.0894,

        "sensors": [
            "water_level",
            "rainfall",
            "temperature"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "LoRaWAN",

            "lorawan_available": True,
            "mesh_available": True
        },

        "status": "online"
    },


    {
        "id": "ATG_BLU_005",
        "name": "Nó Vila Itoupava",
        "region": "Vila Itoupava",

        "latitude": -26.8165,
        "longitude": -49.1128,

        "sensors": [
            "rainfall",
            "temperature",
            "humidity"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "LoRaWAN",

            "lorawan_available": True,
            "mesh_available": True
        },

        "status": "online"
    },


    {
        "id": "ATG_BLU_006",
        "name": "Nó Velha",
        "region": "Velha",

        "latitude": -26.9336,
        "longitude": -49.0907,

        "sensors": [
            "water_level",
            "rainfall",
            "temperature",
            "humidity"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "LoRaWAN",

            "lorawan_available": True,
            "mesh_available": True
        },

        "status": "online"
    },


    {
        "id": "ATG_BLU_007",
        "name": "Nó Fortaleza",
        "region": "Fortaleza",

        "latitude": -26.8809,
        "longitude": -49.0745,

        "sensors": [
            "rainfall",
            "temperature",
            "humidity"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "Mesh",

            "lorawan_available": False,
            "mesh_available": True
        },

        "status": "online"
    },


    {
        "id": "ATG_BLU_008",
        "name": "Nó Badenfurt",
        "region": "Badenfurt",

        "latitude": -26.8735,
        "longitude": -49.1318,

        "sensors": [
            "water_level",
            "rainfall",
            "temperature"
        ],

        "communication": {

            "primary": "LoRaWAN",
            "fallback": "Mesh",

            "current_channel": "LoRaWAN",

            "lorawan_available": True,
            "mesh_available": True
        },

        "status": "online"
    }

]



# ============================================================
# EXPORTAÇÃO DAS ESTAÇÕES
# ============================================================

def generate_stations():

    payload = {

        "metadata": {

            "project": PROJECT_NAME,

            "municipality": MUNICIPALITY,

            "state": STATE,

            "country": COUNTRY,

            "simulation": True,

            "communication_architecture": "Hybrid",

            "primary_communication": "LoRaWAN",

            "fallback_communication": "Mesh",

            "description":
            "Topologia simulada de nós ambientais preparada para futura integração com hardware próprio."

        },


        "stations": STATION_CONFIGURATION

    }


    with open(
        STATIONS_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            payload,
            file,
            indent=4,
            ensure_ascii=False
        )


    print(
        "[OK] stations.json gerado"
    )



# ============================================================
# SENSOR SIMULADO
# ============================================================

def read_simulated_sensors(station_index):


    scenarios = [

        {
            "water_level": 0.6,
            "rain": 0.0,
            "temperature": 24.5,
            "humidity": 65
        },


        {
            "water_level": 1.8,
            "rain": 12.5,
            "temperature": 22.1,
            "humidity": 80
        },


        {
            "water_level": 2.6,
            "rain": 34.0,
            "temperature": 20.3,
            "humidity": 92
        },


        {
            "water_level": 3.4,
            "rain": 52.8,
            "temperature": 19.0,
            "humidity": 98
        },


        {
            "water_level": 4.1,
            "rain": 55.0,
            "temperature": 18.5,
            "humidity": 98
        },


        {
            "water_level": 3.0,
            "rain": 40.0,
            "temperature": 20.0,
            "humidity": 90
        }

    ]


    return scenarios[
        station_index % len(scenarios)
    ]



# ============================================================
# MOTOR DE RISCO
# ============================================================

class RiskEngine:


    @staticmethod
    def classify(level):


        if level < 1:

            return "Seguro"


        elif level < 2:

            return "Atenção"


        elif level < 3:

            return "Alerta"


        else:

            return "Crítico"



# ============================================================
# GERENCIADOR DE COMUNICAÇÃO
# ============================================================

class CommunicationManager:


    def select_channel(
            self,
            station
    ):


        if station["communication"]["lorawan_available"]:

            return "LoRaWAN"


        return "Mesh"
# ============================================================
# GERAÇÃO DA TELEMETRIA
# ============================================================

def generate_telemetry():

    manager = CommunicationManager()


    telemetry_payload = {

        "metadata": {

            "simulation": True,

            "municipality": MUNICIPALITY,

            "updated_at":
            datetime.now(
                timezone.utc
            ).astimezone().isoformat(),

            "unit_system": "metric",

            "description":
            "Leituras ambientais simuladas recebidas pelos nós da plataforma."

        },


        "telemetry": []

    }



    for index, station in enumerate(
        STATION_CONFIGURATION
    ):


        sensor_data = read_simulated_sensors(
            index
        )


        channel = manager.select_channel(
            station
        )


        timestamp = datetime.now(
            timezone.utc
        ).astimezone().isoformat()



        measurement = {

            "station_id":
            station["id"],


            "timestamp":
            timestamp,


            "measurements": {

                "water_level_m":
                sensor_data["water_level"],


                "rainfall_mm":
                sensor_data["rain"],


                "temperature_c":
                sensor_data["temperature"],


                "humidity_percent":
                sensor_data["humidity"]

            },


            "communication": {

                "channel_used":
                channel,


                "delivery_status":
                "delivered"

            }

        }



        # adiciona informação de fallback
        if channel == "Mesh":

            measurement["communication"][
                "fallback_reason"
            ] = "LoRaWAN unavailable"



        # adiciona classificação local de risco
        measurement["risk_analysis"] = {

            "level":
            RiskEngine.classify(
                sensor_data["water_level"]
            ),


            "water_level_m":
            sensor_data["water_level"]

        }



        telemetry_payload[
            "telemetry"
        ].append(
            measurement
        )



    with open(
        TELEMETRY_FILE,
        "w",
        encoding="utf-8"
    ) as file:


        json.dump(

            telemetry_payload,

            file,

            indent=4,

            ensure_ascii=False

        )



    print(
        "[OK] telemetry.json gerado"
    )



# ============================================================
# SIMULAÇÃO DE CICLOS
# ============================================================

def run_simulation():


    print("\n")
    print("=" * 60)
    print(
        " AMERICAS TECHGUARD - IoT SIMULATOR "
    )
    print("=" * 60)



    print(
        "\nGerando topologia dos sensores..."
    )


    generate_stations()



    print(
        "Gerando telemetria ambiental..."
    )


    generate_telemetry()



    print("\nArquivos atualizados:")

    print(
        f"- {STATIONS_FILE}"
    )

    print(
        f"- {TELEMETRY_FILE}"
    )


    print("\nSimulação finalizada.")




# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":


    run_simulation()