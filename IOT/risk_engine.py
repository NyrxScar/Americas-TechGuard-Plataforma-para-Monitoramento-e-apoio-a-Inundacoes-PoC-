"""
============================================================
AMERICAS TECHGUARD
RISK ENGINE v2
============================================================

Motor inteligente de análise de risco hidrológico.

Entrada:
    data/telemetry.json

Saída:
    data/alerts.json


Responsabilidades:

- Avaliar risco de inundação
- Calcular score de perigo
- Gerar alertas automáticos
- Explicar motivo do alerta
- Preparar integração HAND/GIS
- Preparar consumo pelo Dashboard

============================================================
"""


from pathlib import Path
from datetime import datetime, timezone
import json



# ============================================================
# CAMINHOS
# ============================================================


BASE_DIR = Path(__file__).resolve().parent.parent


DATA_DIR = BASE_DIR / "data"


TELEMETRY_FILE = DATA_DIR / "telemetry.json"


ALERTS_FILE = DATA_DIR / "alerts.json"





# ============================================================
# NÍVEIS DE RISCO
# ============================================================


RISK_LEVELS = {


    "safe": {

        "label": "Seguro",

        "severity": 0

    },


    "attention": {

        "label": "Atenção",

        "severity": 1

    },


    "alert": {

        "label": "Alerta",

        "severity": 2

    },


    "critical": {

        "label": "Crítico",

        "severity": 3

    }

}







# ============================================================
# MOTOR DE RISCO
# ============================================================


class RiskEngine:



    def analyze(
        self,
        water_level,
        rainfall,
        humidity,
        communication
    ):


        score = 0


        reasons = []




        # ====================================================
        # NÍVEL DA ÁGUA
        # Peso máximo: 45 pontos
        # ====================================================


        if water_level >= 4:


            score += 45


            reasons.append(
                "Nível da água extremamente elevado."
            )



        elif water_level >= 3:


            score += 35


            reasons.append(
                "Nível da água acima do limite seguro."
            )



        elif water_level >= 2:


            score += 20


            reasons.append(
                "Elevação significativa do nível da água."
            )



        elif water_level >= 1:


            score += 10



        # ====================================================
        # CHUVA
        # Peso máximo: 30 pontos
        # ====================================================


        if rainfall >= 50:


            score += 30


            reasons.append(
                "Chuva intensa detectada."
            )



        elif rainfall >= 30:


            score += 20


            reasons.append(
                "Volume elevado de precipitação."
            )



        elif rainfall >= 10:


            score += 10





        # ====================================================
        # UMIDADE
        # Peso máximo: 15 pontos
        # ====================================================


        if humidity >= 95:


            score += 15


            reasons.append(
                "Umidade crítica indicando saturação ambiental."
            )



        elif humidity >= 80:


            score += 8





        # ====================================================
        # COMUNICAÇÃO DO SENSOR
        # Peso máximo: 10 pontos
        # ====================================================


        if communication == "Mesh":


            score += 5


            reasons.append(
                "Comunicação utilizando fallback Mesh."
            )


        elif communication == "LoRaWAN":


            score += 0





        score = min(score,100)



        risk = self.classify(score)



        confidence = self.calculate_confidence(
            score,
            communication
        )



        return {


            "score": score,


            "risk": risk,


            "confidence": confidence,


            "reasons": reasons

        }







    def classify(
        self,
        score
    ):


        if score < 25:

            return "safe"



        elif score < 50:

            return "attention"



        elif score < 75:

            return "alert"



        return "critical"







    def calculate_confidence(
        self,
        score,
        communication
    ):


        confidence = 0.70



        if communication == "LoRaWAN":

            confidence += 0.20


        else:

            confidence += 0.10



        if score >= 75:

            confidence += 0.05



        return round(
            min(confidence,0.99),
            2
        )






    def recommendation(
        self,
        risk
    ):


        actions = {


            "safe":
            [
                "Continuar monitoramento."
            ],



            "attention":
            [
                "Acompanhar evolução dos sensores.",
                "Verificar áreas vulneráveis."
            ],



            "alert":
            [
                "Notificar equipe de monitoramento.",
                "Preparar resposta preventiva."
            ],



            "critical":
            [
                "Acionar protocolo de emergência.",
                "Avaliar evacuação preventiva.",
                "Verificar abrigos disponíveis."
            ]

        }


        return actions[risk]









# ============================================================
# GERAÇÃO DE ALERTAS
# ============================================================



def generate_alerts():



    print("="*60)

    print(
        " AMERICAS TECHGUARD - RISK ENGINE v2 "
    )

    print("="*60)



    if not TELEMETRY_FILE.exists():

        raise FileNotFoundError(
            f"Arquivo inexistente: {TELEMETRY_FILE}"
        )




    with open(
        TELEMETRY_FILE,
        encoding="utf-8"
    ) as file:


        telemetry = json.load(file)





    engine = RiskEngine()


    alerts = []





    for index,item in enumerate(
        telemetry["telemetry"]
    ):



        measurements = item["measurements"]



        water = measurements.get(
            "water_level_m",
            0
        )


        rain = measurements.get(
            "rainfall_mm",
            0
        )


        humidity = measurements.get(
            "humidity_percent",
            0
        )


        communication = item.get(
            "communication",
            {}
        ).get(
            "channel_used",
            "Unknown"
        )




        analysis = engine.analyze(

            water,

            rain,

            humidity,

            communication

        )



        risk = analysis["risk"]




        alert = {


            "alert_id":

                f"ATG-{datetime.now().strftime('%Y%m%d')}-{index+1:03}",



            "event": {


                "type":

                    "FLOOD_RISK",


                "timestamp":

                    datetime.now(
                        timezone.utc
                    ).isoformat()

            },



            "station": {


                "id":

                    item["station_id"]

            },



            "risk": {


                "level":

                    risk,


                "label":

                    RISK_LEVELS[risk]["label"],


                "severity":

                    RISK_LEVELS[risk]["severity"],


                "score":

                    analysis["score"],


                "confidence":

                    analysis["confidence"]

            },



            "measurements": {


                "water_level_m":

                    water,


                "rainfall_mm":

                    rain,


                "humidity_percent":

                    humidity

            },



            "communication": {


                "channel":

                    communication

            },



            "reasons":

                analysis["reasons"],



            "recommendations":

                engine.recommendation(
                    risk
                ),



            "requires_action":

                analysis["score"] >= 50

        }



        alerts.append(alert)





    output = {


        "metadata": {


            "project":

                "Americas TechGuard",


            "engine":

                "Risk Engine v2",


            "generated_at":

                datetime.now(
                    timezone.utc
                ).isoformat(),


            "total_alerts":

                len(alerts)

        },


        "alerts":

            alerts

    }






    with open(
        ALERTS_FILE,
        "w",
        encoding="utf-8"
    ) as file:


        json.dump(

            output,

            file,

            indent=4,

            ensure_ascii=False

        )





    print()

    print(
        "[OK] alerts.json atualizado:"
    )

    print(
        ALERTS_FILE
    )


    print()



    for alert in alerts:


        print(

            f"{alert['station']['id']} -> "

            f"{alert['risk']['label']} "

            f"{alert['risk']['score']} pontos"

        )


# ============================================================
# MAIN
# ============================================================


if __name__ == "__main__":


    generate_alerts()