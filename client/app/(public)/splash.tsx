import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function SplashScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/(public)/access');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinue();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.badgeText}>PoC Blumenau</Text>
      </View>

      <View style={styles.iconCircle}>
        <Text style={styles.iconSymbol}>🌊</Text>
      </View>

      <Text style={styles.title}>AMERICAS TECHGUARD</Text>
      <Text style={styles.subtitle}>Plataforma Integrada para Monitoramento e Apoio a Inundações</Text>

      <View style={styles.sensorStatusBox}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Simulação Hidrológica & Telemetria LoRaWAN/Mesh</Text>
      </View>

      <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Acessar Plataforma →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  logoBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  badgeText: {
    color: theme.colors.accent,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconSymbol: {
    fontSize: 44,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
    lineHeight: 20,
  },
  sensorStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    marginTop: 32,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.riskLow,
    marginRight: 10,
  },
  statusText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  button: {
    marginTop: 30,
    backgroundColor: theme.colors.surfaceHover,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});
