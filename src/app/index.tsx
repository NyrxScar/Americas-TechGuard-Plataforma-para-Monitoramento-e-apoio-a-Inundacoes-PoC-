import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";


export default function Index() {

  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;


  useEffect(() => {

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 1800,
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );


    pulseAnimation.start();


    Animated.parallel([

      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),

    ]).start();



    const timer = setTimeout(() => {


      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {


        router.replace("/access");


      });


    }, 3000);



    return () => {

      clearTimeout(timer);
      pulseAnimation.stop();

    };


  }, []);



  return (

    <Animated.View

      style={[
        styles.container,
        {
          opacity,
          transform:[
            {
              translateY
            }
          ]
        }
      ]}

    >


      {/* Radar */}

      <Animated.View

        style={[
          styles.radarOuter,
          {
            transform:[
              {
                scale:pulse
              }
            ]
          }
        ]}

      />


      <View style={styles.glowTop}/>

      <View style={styles.glowBottom}/>




      {/* Conteúdo */}

      <View style={styles.mainContainer}>


        <View style={styles.badge}>

          <View style={styles.badgeDot}/>

          <Text style={styles.badgeText}>
            SISTEMA DE PREVENÇÃO
          </Text>

        </View>



        <Text style={styles.title}>
          Americas{"\n"}

          <Text style={styles.titleAccent}>
            TechGuard
          </Text>

        </Text>




        <View style={styles.divider}/>



        <Text style={styles.subtitle}>
          Tecnologia e inteligência para monitoramento,
          prevenção e resposta a eventos climáticos.
        </Text>




        <View style={styles.statusContainer}>


          <View style={styles.statusItem}>

            <View style={styles.onlineDot}/>

            <Text style={styles.statusText}>
              LoRa conectado
            </Text>

          </View>



          <View style={styles.statusItem}>

            <View style={styles.onlineDot}/>

            <Text style={styles.statusText}>
              MQTT ativo
            </Text>

          </View>


        </View>


      </View>





      {/* Footer */}

      <View style={styles.footer}>


        <ActivityIndicator
          size="small"
          color="#00E5FF"
        />


        <Text style={styles.loadingText}>
          Inicializando sensores ambientais...
        </Text>


      </View>



    </Animated.View>

  );

}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#05131A",
    paddingHorizontal:28,
    paddingVertical:50,
    justifyContent:"space-between",
    overflow:"hidden",
  },


  radarOuter:{
    position:"absolute",
    width:420,
    height:420,
    borderRadius:210,
    borderWidth:1,
    borderColor:"rgba(0,229,255,0.15)",
    top:"30%",
    left:"50%",
    marginLeft:-210,
    marginTop:-210,
  },


  glowTop:{
    position:"absolute",
    top:-120,
    right:-100,
    width:350,
    height:350,
    borderRadius:175,
    backgroundColor:"#0A4052",
    opacity:0.4,
  },


  glowBottom:{
    position:"absolute",
    bottom:-150,
    left:-100,
    width:450,
    height:450,
    borderRadius:225,
    backgroundColor:"#00E5FF",
    opacity:0.08,
  },


  mainContainer:{
    flex:1,
    justifyContent:"center",
    alignItems:"flex-start",
  },


  badge:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"rgba(0,229,255,0.08)",
    paddingVertical:6,
    paddingHorizontal:12,
    borderRadius:20,
    borderWidth:1,
    borderColor:"rgba(0,229,255,0.25)",
    marginBottom:24,
  },


  badgeDot:{
    width:7,
    height:7,
    borderRadius:5,
    backgroundColor:"#00E5FF",
    marginRight:8,
  },


  badgeText:{
    color:"#00E5FF",
    fontSize:10,
    fontWeight:"700",
    letterSpacing:1.5,
  },


  title:{
    fontSize:42,
    fontWeight:"300",
    color:"#FFF",
    lineHeight:48,
  },


  titleAccent:{
    color:"#00E5FF",
    fontWeight:"800",
  },


  divider:{
    width:45,
    height:3,
    backgroundColor:"#00E5FF",
    borderRadius:5,
    marginVertical:20,
  },


  subtitle:{
    color:"#94B0B7",
    fontSize:15,
    lineHeight:24,
    maxWidth:310,
  },


  statusContainer:{
    marginTop:35,
    gap:12,
  },


  statusItem:{
    flexDirection:"row",
    alignItems:"center",
  },


  onlineDot:{
    width:8,
    height:8,
    borderRadius:4,
    backgroundColor:"#00FF88",
    marginRight:10,
  },


  statusText:{
    color:"#78939B",
    fontSize:12,
  },


  footer:{
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    gap:10,
  },


  loadingText:{
    color:"#6B8E96",
    fontSize:13,
  },


});