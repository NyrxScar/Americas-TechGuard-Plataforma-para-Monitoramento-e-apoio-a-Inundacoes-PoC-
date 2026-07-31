import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";


const Colors = {
  background: "#0B0F19",
  card: "#111827",
  input: "#0F172A",
  border: "#1E293B",
  text: "#FFFFFF",
  secondary: "#94A3B8",
  accent: "#0284C7",
};



export default function LoginScreen() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [acceptedTerms,setAcceptedTerms] = useState(false);



  const handleLogin = () => {

    if(!acceptedTerms){
      alert("Por favor, aceite os termos de serviço para continuar.");
      return;
    }

    router.replace("/(tela-inicial)");

  };



  const handleGoogleLogin = () => {

    if(!acceptedTerms){
      alert("Por favor, aceite os termos de serviço para continuar.");
      return;
    }

    router.replace("/(tela-inicial)");

  };




return (

<KeyboardAvoidingView

  style={styles.container}

  behavior={
    Platform.OS === "ios"
    ? "padding"
    : undefined
  }

>


<View style={styles.card}>


{/* HEADER */}

<View style={styles.header}>


<Text style={styles.logo}>
  TEC<Text style={styles.logoAccent}>GUARD</Text>
</Text>


<Text style={styles.title}>
  Entrar
</Text>


<Text style={styles.subtitle}>
  Acesse sua conta no TecGuard
</Text>


</View>




{/* GOOGLE */}


<TouchableOpacity

style={styles.googleBtn}

activeOpacity={0.8}

onPress={handleGoogleLogin}

>


<Svg width={20} height={20} viewBox="0 0 24 24">

<Path
fill="#4285F4"
d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
/>

<Path
fill="#34A853"
d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.14C3.2 21.3 7.31 24 12 24z"
/>

<Path
fill="#FBBC05"
d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.23C.44 8.16 0 9.99 0 12s.44 3.84 1.23 5.41l4.05-3.14z"
/>

<Path
fill="#EA4335"
d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.2 2.7 1.23 6.59l4.05 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
/>

</Svg>



<Text style={styles.googleText}>
 Entrar com Google
</Text>


</TouchableOpacity>




{/* DIVISOR */}


<View style={styles.divider}>

<View style={styles.line}/>

<Text style={styles.dividerText}>
 OU
</Text>

<View style={styles.line}/>

</View>





{/* FORM */}


<View style={styles.form}>


<TextInput

style={styles.input}

placeholder="Endereço de Email"

placeholderTextColor="#64748B"

value={email}

onChangeText={setEmail}

keyboardType="email-address"

autoCapitalize="none"

autoCorrect={false}

/>



<TextInput

style={styles.input}

placeholder="Senha"

placeholderTextColor="#64748B"

value={password}

onChangeText={setPassword}

secureTextEntry

/>



<TouchableOpacity

style={styles.forgot}

>

<Text style={styles.forgotText}>
Esqueceu a senha?
</Text>

</TouchableOpacity>




<TouchableOpacity

style={styles.primaryBtn}

onPress={handleLogin}

activeOpacity={0.8}

>


<Text style={styles.primaryText}>
Entrar
</Text>


</TouchableOpacity>



</View>






{/* REGISTRO */}



<View style={styles.registerBox}>


<Text style={styles.registerText}>
Ainda não possui uma conta?
</Text>


<Pressable
onPress={()=>router.push("/register")}
>

<Text style={styles.registerLink}>
 Registrar-se
</Text>


</Pressable>


</View>






{/* TERMOS */}



<Pressable

style={styles.terms}

onPress={()=>setAcceptedTerms(!acceptedTerms)}

>


<View

style={[
styles.checkbox,
acceptedTerms && styles.checkboxActive
]}

/>


<Text style={styles.footerText}>

Ao continuar, você concorda com nossos Termos de Serviço.
{"\n"}
Consulte nossa política de privacidade.

</Text>


</Pressable>



</View>


</KeyboardAvoidingView>

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

maxWidth:420,

backgroundColor:Colors.card,

borderRadius:18,

padding:28,

borderWidth:1,

borderColor:Colors.border,

},



header:{

alignItems:"center",

marginBottom:24,

},



logo:{

fontSize:28,

fontWeight:"900",

letterSpacing:2,

color:Colors.text,

},



logoAccent:{

color:Colors.accent,

},



title:{

fontSize:28,

fontWeight:"700",

color:Colors.text,

marginTop:22,

},



subtitle:{

fontSize:13,

color:Colors.secondary,

marginTop:6,

},



googleBtn:{

height:48,

borderRadius:10,

borderWidth:1,

borderColor:Colors.border,

backgroundColor:"#FFFFFF",

flexDirection:"row",

alignItems:"center",

justifyContent:"center",

},



googleText:{

marginLeft:10,

fontWeight:"600",

color:"#111827",

},



divider:{

flexDirection:"row",

alignItems:"center",

marginVertical:20,

},



line:{

flex:1,

height:1,

backgroundColor:Colors.border,

},



dividerText:{

marginHorizontal:10,

fontSize:11,

color:Colors.secondary,

},



form:{


},



input:{

height:50,

backgroundColor:Colors.input,

borderWidth:1,

borderColor:Colors.border,

borderRadius:10,

paddingHorizontal:15,

fontSize:14,

color:Colors.text,

marginBottom:12,

},



forgot:{

alignItems:"flex-end",

marginBottom:15,

},



forgotText:{

color:Colors.accent,

fontSize:12,

},



primaryBtn:{

height:50,

backgroundColor:Colors.accent,

borderRadius:10,

alignItems:"center",

justifyContent:"center",

},



primaryText:{

color:"#FFFFFF",

fontWeight:"700",

fontSize:15,

},



registerBox:{

flexDirection:"row",

justifyContent:"center",

marginTop:22,

},



registerText:{

color:Colors.secondary,

fontSize:13,

},



registerLink:{

color:Colors.accent,

fontWeight:"700",

fontSize:13,

marginLeft:5,

},



terms:{

flexDirection:"row",

marginTop:26,

alignItems:"center",

},



checkbox:{

width:18,

height:18,

borderRadius:4,

borderWidth:1,

borderColor:Colors.accent,

marginRight:10,

},



checkboxActive:{

backgroundColor:Colors.accent,

},



footerText:{

flex:1,

fontSize:11,

lineHeight:15,

color:Colors.secondary,

},



});