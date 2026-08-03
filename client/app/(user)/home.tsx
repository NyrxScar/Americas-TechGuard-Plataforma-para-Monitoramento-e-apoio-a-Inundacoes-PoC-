import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function UserHomeScreen() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [telemetry, setTelemetry] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const res = await api.get('/telemetria/recentes');
      if (res && res.data) setTelemetry(res.data);
    }
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Boas-vindas */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeTextGroup}>
          <Text style={styles.greeting}>Olá, {user?.name || 'Visitante'}</Text>
          <Text style={styles.cityBadge}>📍 Blumenau / SC — Rio Itajaí-Açú</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge} onPress={() => router.push('/(user)/profile')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Card de Nível Atual de Risco */}
      <View style={styles.riskCard}>
        <View style={styles.riskHeader}>
          <Text style={styles.riskTitle}>Status Hidrológico Atual</Text>
          <View style={styles.riskBadge}>
            <Text style={styles.riskBadgeText}>ATENÇÃO MODERADA</Text>
          </View>
        </View>
        <Text style={styles.waterLevelValue}>4,85 m</Text>
        <Text style={styles.waterLevelSub}>Nível medido na Ponte de Ferro (Cota de Alerta: 6,00m)</Text>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '48%', backgroundColor: theme.colors.riskModerate }]} />
        </View>
      </View>

      {/* Card de Alertas Ativos */}
      <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/(user)/alerts')}>
        <View style={styles.alertIconBg}>
          <Text style={styles.alertIcon}>🚨</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertBannerTitle}>2 Alertas Ativos da Defesa Civil</Text>
          <Text style={styles.alertBannerSub}>Risco de elevação do nível do rio e encostas na Velha</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      {/* Resumo da Telemetria IoT */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Resumo da Telemetria Simulada</Text>
      </View>

      <View style={styles.telemetryGrid}>
        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryLabel}>Chuva Acumulada (24h)</Text>
          <Text style={styles.telemetryValue}>24,5 mm</Text>
          <Text style={styles.telemetrySub}>Chuva leve contínua</Text>
        </View>
        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryLabel}>Modelo HAND</Text>
          <Text style={styles.telemetryValue}>Copernicus 30m</Text>
          <Text style={styles.telemetrySub}>Cota topográfica processada</Text>
        </View>
      </View>

      {/* Acessos Rápidos */}
      <Text style={styles.sectionTitle}>Acesso Rápido</Text>
      <View style={styles.quickNavGrid}>
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(user)/map')}>
          <Text style={styles.navCardIcon}>🗺️</Text>
          <Text style={styles.navCardTitle}>Mapa de Risco</Text>
          <Text style={styles.navCardSub}>Visualizar camadas espacial e HAND</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(user)/shelters')}>
          <Text style={styles.navCardIcon}>🏢</Text>
          <Text style={styles.navCardTitle}>Abrigos</Text>
          <Text style={styles.navCardSub}>Consultar locais e vagas disponíveis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  cityBadge: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileIcon: {
    fontSize: 20,
  },
  riskCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  riskBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.riskModerate,
  },
  riskBadgeText: {
    color: theme.colors.riskModerate,
    fontWeight: 'bold',
    fontSize: 11,
  },
  waterLevelValue: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  waterLevelSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.riskHigh,
    marginBottom: 20,
  },
  alertIconBg: {
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertBannerTitle: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  alertBannerSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  telemetryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  telemetryLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  telemetryValue: {
    color: theme.colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  telemetrySub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  quickNavGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  navCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  navCardTitle: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  navCardSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
