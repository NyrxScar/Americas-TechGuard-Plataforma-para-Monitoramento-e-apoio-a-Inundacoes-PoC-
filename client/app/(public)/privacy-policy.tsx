import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Política de Privacidade e Proteção de Dados</Text>
      <Text style={styles.updated}>Última atualização: Prova de Conceito (PoC) Blumenau SC</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Dados Coletados</Text>
        <Text style={styles.paragraph}>
          A plataforma Americas TechGuard armazena nome, e-mail e telefone informados voluntariamente no cadastro, além de coordenadas de localização geográfica quando autorizadas pelo usuário para exibição no mapa de risco.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Uso das Informações</Text>
        <Text style={styles.paragraph}>
          As informações são utilizadas exclusivamente para envio de alertas ambientais de inundação, localização do abrigo mais próximo e gerenciamento das solicitações comunitárias da Defesa Civil.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Localização & Permissões</Text>
        <Text style={styles.paragraph}>
          A permissão de geolocalização é opcional e utilizada estritamente no dispositivo do usuário para calcular distâncias em relação aos abrigos e cotas de inundação.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Segurança & Responsabilidades do Sistema</Text>
        <Text style={styles.paragraph}>
          O Americas TechGuard é uma Prova de Conceito (PoC) software-only com finalidade acadêmica e demonstrativa. Os dados de sensores são simulados por software.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>← Voltar à Tela Anterior</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  updated: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.surfaceHover,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
});
