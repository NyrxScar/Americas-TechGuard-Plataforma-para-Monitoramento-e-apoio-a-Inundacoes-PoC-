import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";


const Colors = {
  background: "#08111F",
  card: "#101C2E",
  input: "#162438",

  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",

  accent: "#00E5FF",
  border: "#26364D",

  buttonText: "#001018",
};


export default function RegisterScreen() {

  const router = useRouter();


  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [number, setNumber] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);



  const handleCpfChange = (text:string)=>{

    const raw = text.replace(/\D/g,"").slice(0,11);

    const formatted = raw
      .replace(/(\d{3})(\d)/,"$1.$2")
      .replace(/(\d{3})(\d)/,"$1.$2")
      .replace(/(\d{3})(\d{1,2})$/,"$1-$2");


    setCpf(formatted);

  };



  const handlePhoneChange = (text:string)=>{

    const raw=text.replace(/\D/g,"").slice(0,11);


    const formatted = raw
      .replace(/^(\d{2})(\d)/g,"($1) $2")
      .replace(/(\d{5})(\d)/,"$1-$2");


    setPhone(formatted);

  };




  const handleRegister = ()=>{


    if(!acceptedTerms){

      alert(
        "É necessário aceitar os termos e declarar a veracidade dos dados."
      );

      return;
    }


    if(
      !fullName ||
      !cpf ||
      !phone ||
      !email ||
      !password
    ){

      alert(
        "Por favor, preencha todos os campos obrigatórios."
      );

      return;

    }


    if(password !== confirmPassword){

      alert(
        "As senhas não coincidem."
      );

      return;

    }



    console.log({
      fullName,
      cpf,
      phone,
      cep,
      number,
      email
    });



    router.replace("/(Tela_inicial)");

  };



return (

<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS==="ios"
?"padding"
:"height"
}

>


<ScrollView

contentContainerStyle={styles.scrollContent}

showsVerticalScrollIndicator={false}

>



<View style={styles.card}>


<View style={styles.header}>


<Text style={styles.title}>
Criar Conta
</Text>


<Text style={styles.subtitle}>
Cadastro Oficial • Defesa Civil TecGuard
</Text>


</View>




<TouchableOpacity
style={styles.googleBtn}
activeOpacity={0.8}
>


<Svg
width={20}
height={20}
viewBox="0 0 24 24"
>


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
Registrar-se com o Google
</Text>



</TouchableOpacity>




<View style={styles.divider}>

<View style={styles.dividerLine}/>


<Text style={styles.dividerText}>
OU PREENCHA OS DADOS
</Text>


<View style={styles.dividerLine}/>


</View>
{/* FORMULÁRIO */}

<View style={styles.form}>


<TextInput
style={styles.input}
placeholder="Nome Completo *"
placeholderTextColor={Colors.textSecondary}
value={fullName}
onChangeText={setFullName}
autoCapitalize="words"
/>



<TextInput
style={styles.input}
placeholder="CPF (apenas números) *"
placeholderTextColor={Colors.textSecondary}
value={cpf}
onChangeText={handleCpfChange}
keyboardType="numeric"
/>



<TextInput
style={styles.input}
placeholder="Telefone / WhatsApp com DDD *"
placeholderTextColor={Colors.textSecondary}
value={phone}
onChangeText={handlePhoneChange}
keyboardType="phone-pad"
/>



<View style={styles.row}>


<TextInput
style={[styles.input,styles.cepInput]}
placeholder="CEP"
placeholderTextColor={Colors.textSecondary}
value={cep}
onChangeText={setCep}
keyboardType="numeric"
maxLength={8}
/>



<TextInput
style={[styles.input,styles.numberInput]}
placeholder="Nº"
placeholderTextColor={Colors.textSecondary}
value={number}
onChangeText={setNumber}
/>



</View>




<TextInput
style={styles.input}
placeholder="Endereço de Email *"
placeholderTextColor={Colors.textSecondary}
value={email}
onChangeText={setEmail}
keyboardType="email-address"
autoCapitalize="none"
/>



<TextInput
style={styles.input}
placeholder="Senha *"
placeholderTextColor={Colors.textSecondary}
value={password}
onChangeText={setPassword}
secureTextEntry
/>



<TextInput
style={styles.input}
placeholder="Confirmação da Senha *"
placeholderTextColor={Colors.textSecondary}
value={confirmPassword}
onChangeText={setConfirmPassword}
secureTextEntry
/>




<TouchableOpacity
style={styles.btnPrimary}
activeOpacity={0.8}
onPress={handleRegister}
>


<Text style={styles.btnPrimaryText}>
Registrar
</Text>


</TouchableOpacity>



</View>






<View style={styles.loginBox}>


<Text style={styles.loginText}>
Já possui uma conta?
</Text>



<TouchableOpacity
onPress={()=>router.push("/login")}
>


<Text style={styles.loginLink}>
Entrar
</Text>


</TouchableOpacity>


</View>






<View style={styles.termsContainer}>


<TouchableOpacity

style={[
styles.checkbox,
acceptedTerms && styles.checkboxChecked
]}

onPress={()=>
setAcceptedTerms(!acceptedTerms)
}

>


{
acceptedTerms &&
<Text style={styles.checkmark}>
✓
</Text>
}


</TouchableOpacity>



<Text style={styles.footerText}>

Declaro que os dados fornecidos são verdadeiros para fins de emergência e concordo com os Termos de Serviço e Política de Privacidade.

</Text>



</View>



</View>


</ScrollView>


</KeyboardAvoidingView>


);

}




const styles = StyleSheet.create({



container:{
flex:1,
backgroundColor:Colors.background,
},



scrollContent:{
flexGrow:1,
justifyContent:"center",
alignItems:"center",

paddingHorizontal:20,
paddingVertical:40,

},



card:{


width:"100%",

maxWidth:420,

backgroundColor:Colors.card,

borderRadius:20,

padding:28,

},




header:{

alignItems:"center",

marginBottom:24,

},




title:{

fontSize:30,

fontWeight:"800",

letterSpacing:1,

color:Colors.textPrimary,

},




subtitle:{

fontSize:11,

marginTop:6,

color:Colors.accent,

letterSpacing:1,

textTransform:"uppercase",

},






googleBtn:{


height:48,

width:"100%",


flexDirection:"row",

alignItems:"center",

justifyContent:"center",

gap:10,


backgroundColor:Colors.input,

borderWidth:1,

borderColor:Colors.border,

borderRadius:12,


},




googleText:{

color:Colors.textPrimary,

fontSize:14,

fontWeight:"600",

},






divider:{


flexDirection:"row",

alignItems:"center",

marginVertical:20,


},



dividerLine:{


flex:1,

height:1,

backgroundColor:Colors.border,


},




dividerText:{


fontSize:10,

color:Colors.textSecondary,

marginHorizontal:10,

letterSpacing:0.5,

},






form:{


width:"100%",

gap:12,


},






input:{


height:48,

width:"100%",


backgroundColor:Colors.input,


borderWidth:1,

borderColor:Colors.border,


borderRadius:10,


paddingHorizontal:14,


fontSize:14,


color:Colors.textPrimary,


},





row:{


flexDirection:"row",

gap:10,


},




cepInput:{


flex:2,


},




numberInput:{


flex:1,


},







btnPrimary:{


width:"100%",


height:50,


backgroundColor:Colors.accent,


borderRadius:12,


justifyContent:"center",

alignItems:"center",


marginTop:8,


},






btnPrimaryText:{


fontSize:15,


fontWeight:"800",


color:Colors.buttonText,


},






loginBox:{


flexDirection:"row",


justifyContent:"center",


alignItems:"center",


marginTop:22,


},






loginText:{


color:Colors.textSecondary,

fontSize:12,


},




loginLink:{


color:Colors.accent,


fontWeight:"800",


fontSize:12,


marginLeft:5,


},







termsContainer:{


flexDirection:"row",


alignItems:"flex-start",


marginTop:25,


},




checkbox:{


width:20,

height:20,


borderWidth:1.5,

borderColor:Colors.accent,


borderRadius:5,


justifyContent:"center",

alignItems:"center",


marginRight:10,


},





checkboxChecked:{


backgroundColor:Colors.accent,


},





checkmark:{


fontSize:13,


fontWeight:"900",


color:Colors.buttonText,


},





footerText:{


flex:1,


fontSize:11,


lineHeight:16,


color:Colors.textSecondary,


},



});