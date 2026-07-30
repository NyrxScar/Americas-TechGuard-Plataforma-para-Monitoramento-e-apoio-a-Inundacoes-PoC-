import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";


const Colors = {

  background: "#0B0F19",
  cardBg: "#111827",

  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",

  accent: "#00B8D9",

  border: "#1E293B",

  toggleBg: "#0F172A",

  success: "#00FF88",

};



export default function WelcomeScreen() {


  const router = useRouter();


  const [userType, setUserType] =
    useState<"membro" | "visitante">("membro");



  const handleVisitanteAccess = () => {

    router.replace("/(tela-inicial)");

  };



  const handleLogin = () => {

    router.push("/login");

  };



  const handleRegister = () => {

    router.push("/register");

  };



  return (

    <View style={styles.container}>


      <View style={styles.card}>


        {/* Cabeçalho */}

        <View style={styles.header}>


          <Text style={styles.title}>
            TECGUARD
          </Text>



          <Text style={styles.subtitle}>
            Prevenção e Resposta a Alagamentos
          </Text>


        </View>





        {/* Seletor */}

        <View style={styles.selectorContainer}>


          <Text style={styles.selectorLabel}>
            Selecione como deseja acessar
          </Text>



          <View style={styles.toggleGroup}>


            <Pressable

              style={[
                styles.toggleBtn,
                userType === "visitante" &&
                styles.toggleBtnActive,
              ]}

              onPress={() =>
                setUserType("visitante")
              }

            >

              <Text

                style={[
                  styles.toggleText,
                  userType === "visitante" &&
                  styles.toggleTextActive,
                ]}

              >

                Visitante

              </Text>


            </Pressable>





            <Pressable

              style={[
                styles.toggleBtn,
                userType === "membro" &&
                styles.toggleBtnActive,
              ]}

              onPress={() =>
                setUserType("membro")
              }

            >

              <Text

                style={[
                  styles.toggleText,
                  userType === "membro" &&
                  styles.toggleTextActive,
                ]}

              >

                Membro

              </Text>


            </Pressable>


          </View>


        </View>





        {
          userType === "visitante"

          ?

          (

          <View style={styles.actionBox}>


            <Text style={styles.infoText}>

              Acesse alertas e mapas em tempo real
              como visitante.

            </Text>



            <TouchableOpacity

              style={styles.btnPrimary}

              onPress={handleVisitanteAccess}

              activeOpacity={0.8}

            >

              <Text style={styles.btnPrimaryText}>
                Continuar para Tela Inicial
              </Text>


            </TouchableOpacity>


          </View>


          )


          :

          (

          <View style={styles.actionBox}>


            <Text style={styles.infoText}>

              Acesse sua conta para gerenciar
              alertas e configurações.

            </Text>



            <TouchableOpacity

              style={styles.btnPrimary}

              onPress={handleLogin}

              activeOpacity={0.8}

            >

              <Text style={styles.btnPrimaryText}>
                Entrar na Conta
              </Text>


            </TouchableOpacity>





            <TouchableOpacity

              style={styles.btnSecondary}

              onPress={handleRegister}

              activeOpacity={0.8}

            >

              <Text style={styles.btnSecondaryText}>
                Criar Nova Conta
              </Text>


            </TouchableOpacity>



          </View>

          )

        }





        {/* Status */}

        <View style={styles.status}>

          <View style={styles.statusDot}/>

          <Text style={styles.statusText}>
            Sistema de monitoramento ativo
          </Text>

        </View>





        {/* Rodapé */}

        <Text style={styles.footerText}>

          Ao prosseguir no TecGuard, você aceita
          nossos Termos de Uso.{"\n"}

          Consulte nossa política de privacidade.

        </Text>


      </View>


    </View>

  );

}




const styles = StyleSheet.create({


  container:{


    flex:1,

    backgroundColor:Colors.background,


    justifyContent:"center",

    alignItems:"center",


    paddingHorizontal:20,

    paddingVertical:40,


  },




  card:{


    width:"100%",

    maxWidth:380,


    backgroundColor:Colors.cardBg,


    borderRadius:24,


    padding:28,


    borderWidth:1,

    borderColor:Colors.border,


  },





  header:{


    alignItems:"center",

    marginBottom:32,


  },





  title:{


    color:Colors.textPrimary,


    fontSize:32,


    fontWeight:"800",


    letterSpacing:3,


  },





  subtitle:{


    color:Colors.accent,


    marginTop:8,


    fontSize:11,


    fontWeight:"600",


    textTransform:"uppercase",


    letterSpacing:1,


    textAlign:"center",


  },





  selectorContainer:{


    width:"100%",


    marginBottom:22,


  },





  selectorLabel:{


    color:Colors.textSecondary,


    fontSize:12,


    fontWeight:"600",


    textAlign:"center",


    marginBottom:10,


    textTransform:"uppercase",


  },





  toggleGroup:{


    flexDirection:"row",


    backgroundColor:Colors.toggleBg,


    borderRadius:12,


    padding:4,


    borderWidth:1,

    borderColor:Colors.border,


  },





  toggleBtn:{


    flex:1,


    paddingVertical:11,


    alignItems:"center",


    borderRadius:9,


  },





  toggleBtnActive:{


    backgroundColor:Colors.accent,


  },





  toggleText:{


    color:Colors.textSecondary,


    fontSize:14,


    fontWeight:"700",


  },





  toggleTextActive:{


    color:"#FFFFFF",


  },





  actionBox:{


    width:"100%",


    gap:14,


  },





  infoText:{


    color:Colors.textSecondary,


    fontSize:13,


    textAlign:"center",


    lineHeight:20,


  },





  btnPrimary:{


    backgroundColor:Colors.accent,


    width:"100%",


    paddingVertical:14,


    borderRadius:12,


    alignItems:"center",


  },





  btnPrimaryText:{


    color:"#FFFFFF",


    fontSize:14,


    fontWeight:"800",


  },





  btnSecondary:{


    width:"100%",


    paddingVertical:13,


    borderRadius:12,


    alignItems:"center",


    borderWidth:1,


    borderColor:Colors.accent,


  },





  btnSecondaryText:{


    color:Colors.accent,


    fontSize:14,


    fontWeight:"700",


  },





  status:{


    flexDirection:"row",


    alignItems:"center",


    justifyContent:"center",


    marginTop:28,


    gap:8,


  },





  statusDot:{


    width:8,

    height:8,


    borderRadius:4,


    backgroundColor:Colors.success,


  },





  statusText:{


    color:Colors.textSecondary,


    fontSize:12,


  },





  footerText:{


    color:Colors.textSecondary,


    fontSize:10,


    textAlign:"center",


    lineHeight:15,


    marginTop:24,


  },


});