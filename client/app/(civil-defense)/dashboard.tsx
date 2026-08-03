import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CivilDefenseDashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Operacional */}
      <View style={styles.opHeader}>
        <View style={styles.opBadge}>
          <Text style={styles.opBadgeText}>DEFESA CIVIL BLUMENAU</Text>
        </View>
        <Text style={styles.opTitle}>Centro de Comando & Monitoramento</Text>
        <Text style={styles.opSubtitle}>Operação simulada de enchentes — bacia do Rio Itajaí-Açú</Text>
      </View>

      {/* Grid de Indicadores Operacionais KPI */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { borderColor: theme.colors.riskModerate }]}>
          <Text style={styles.kpiLabel}>Status de Risco</Text>
          <Text style={[styles.kpiValue, { color: theme.colors.riskModerate }]}>ATENÇÃO</Text>
          <Text style={styles.kpiSub}>Cota 4.85m (Ponte)</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Nós IoT Ativos</Text>
          <Text style={[styles.kpiValue, { color: theme.colors.accent }]}>3 / 3</Text>
          <Text style={styles.kpiSub}>LoRaWAN & Mesh</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: theme.colors.pending }]}>
          <Text style={styles.kpiLabel}>Abrigos Pendentes</Text>
          <Text style={[styles.kpiValue, { color: theme.colors.pending }]}>2</Text>
          <Text style={styles.kpiSub}>Aguardando revisão</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Alertas Ativos</Text>
          <Text style={[styles.kpiValue, { color: theme.colors.riskHigh }]}>2</Text>
          <Text style={styles.kpiSub}>Enviados à população</Text>
        </View>
      </View>

      {/* Módulos de Operação e Navegação */}
      <Text style={styles.sectionTitle}>Módulos Administrativos</Text>

      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => router.push('/(civil-defense)/alerts-management')}
      >
        <Text style={styles.moduleIcon}>📢</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>Gerenciamento de Alertas</Text>
          <Text style={styles.moduleSub}>Emitir novos alertas à população, alterar severidade ou encerrar</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => router.push('/(civil-defense)/pending-shelters')}
      >
        <Text style={styles.moduleIcon}>⏳</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>Abrigos Pendentes de Análise (2)</Text>
          <Text style={styles.moduleSub}>Revisar solicitações enviadas por cidadãos para aprovar ou recusar</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => router.push('/(civil-defense)/registered-shelters')}
      >
        <Text style={styles.moduleIcon}>🏢</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>Abrigos Cadastrados & Ocupação</Text>
          <Text style={styles.moduleSub}>Consultar abrigos ativos e gerenciar vagas da cidade</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => router.push('/(civil-defense)/telemetry')}
      >
        <Text style={styles.moduleIcon}>📡</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>Telemetria em Tempo Real</Text>
          <Text style={styles.moduleSub}>Acompanhar cotas de água, precipitação acumulada e hops da rede Mesh</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => router.push('/(civil-defense)/risk-analysis')}
      >
        <Text style={styles.moduleIcon}>📊</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>Análise Integrada de Risco & HAND</Text>
          <Text style={styles.moduleSub}>Visualizar motor de regras hidrológicas e modelo digital de elevação</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Sair do Painel da Defesa Civil</Text>
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
    padding: theme.spacing.md,
  },
  opHeader: {
    backgroundColor: '#1e1b4b',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#3730a3',
    marginBottom: 16,
  },
  opBadge: {
    backgroundColor: '#4338ca',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 8,
  },
  opBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  opTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  opSubtitle: {
    fontSize: 12,
    color: '#a5b4fc',
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  kpiLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  kpiSub: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  moduleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  moduleTitle: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  moduleSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: theme.colors.accent,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.riskHigh,
    marginTop: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: theme.colors.riskHigh,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
