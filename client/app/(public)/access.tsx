import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/theme/theme';

export default function AccessScreen() {
  const router = useRouter();
  const { setVisitor } = useAuth();

  const handleVisitor = () => {
    setVisitor();
    router.replace('/(user)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.iconSymbol}>🛡️</Text>
        <Text style={styles.title}>Bem-vindo ao Americas TechGuard</Text>
        <Text style={styles.subtitle}>Escolha como deseja acessar a plataforma de apoio a inundações de Blumenau</Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(public)/login')}>
          <Text style={styles.primaryButtonText}>Entrar na Minha Conta</Text>
          <Text style={styles.buttonDescription}>Para cidadãos e operadores cadastrados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(public)/register')}>
          <Text style={styles.secondaryButtonText}>Criar Nova Conta</Text>
          <Text style={styles.buttonDescriptionSecondary}>Cadastre-se para receber alertas e cadastrar abrigos</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.visitorButton} onPress={handleVisitor}>
          <Text style={styles.visitorButtonText}>Entrar como Visitante →</Text>
          <Text style={styles.buttonDescriptionMuted}>Acesso público ao mapa de risco, alertas e abrigos sem login</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/(public)/privacy-policy')}>
        <Text style={styles.privacyLink}>Política de Privacidade e Proteção de Dados</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconSymbol: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
    lineHeight: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDescriptionSecondary: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textMuted,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  visitorButton: {
    backgroundColor: theme.colors.surfaceHover,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  visitorButtonText: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDescriptionMuted: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  privacyLink: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
