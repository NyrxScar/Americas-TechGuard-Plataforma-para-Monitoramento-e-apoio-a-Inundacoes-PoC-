import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function RiskAnalysisScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadRisk() {
      const res = await api.get('/risk-analysis');
      setData(res);
    }
    loadRisk();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Análise Integrada de Risco Hidrológico</Text>
        <Text style={styles.subtitle}>Cruzamento de Telemetria + Motor de Risco + Modelo HAND (Blumenau/SC)</Text>
      </View>

      {/* Card de Score Geral */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Índice de Risco Calculado</Text>
        <Text style={styles.scoreNumber}>{data?.overall_score || '6.8'} / 10</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>RISCO MODERADO A ELEVADO</Text>
        </View>
      </View>

      {/* Modelo HAND (Height Above Nearest Drainage) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🏔️ Modelo HAND (Geoprocessamento GIS)</Text>
        <Text style={styles.sectionText}>
          Processado a partir do Copernicus DEM (30m de resolução) e malha hidrográfica de Ottobacias da Agência Nacional de Águas (ANA).
        </Text>

        <View style={styles.handBox}>
          <View style={styles.handItem}>
            <Text style={styles.handCota}>0,0 - 2,0 m</Text>
            <Text style={[styles.handStatus, { color: theme.colors.riskHigh }]}>Suscetibilidade Alta (Cotas Rurais/Baixada)</Text>
          </View>

          <View style={styles.handItem}>
            <Text style={styles.handCota}>2,0 - 5,0 m</Text>
            <Text style={[styles.handStatus, { color: theme.colors.riskModerate }]}>Suscetibilidade Moderada (Área Urbana Próxima)</Text>
          </View>

          <View style={styles.handItem}>
            <Text style={styles.handCota}>&gt; 5,0 m</Text>
            <Text style={[styles.handStatus, { color: theme.colors.riskLow }]}>Baixa Suscetibilidade (Encostas/Planalto)</Text>
          </View>
        </View>
      </View>

      {/* Regras do Motor de Risco */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⚡ Regras Ativas do Motor de Risco</Text>
        <Text style={styles.ruleText}>• Cota &lt; 4.00m → Risco Baixo (Verde)</Text>
        <Text style={styles.ruleText}>• Cota entre 4.00m e 6.00m → Risco Moderado (Amarelo)</Text>
        <Text style={styles.ruleText}>• Cota &gt; 6.00m → Risco Alto / Inundação (Vermelho)</Text>
        <Text style={styles.ruleText}>• Precipitação &gt; 30mm/h → Incrementa fator de deslizamento em encostas</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(civil-defense)/dashboard')}>
        <Text style={styles.backButtonText}>← Voltar ao Painel Operacional</Text>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scoreCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.riskModerate,
    marginVertical: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.riskModerate,
    fontWeight: 'bold',
    fontSize: 11,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  handBox: {
    gap: 8,
  },
  handItem: {
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  handCota: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  handStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  ruleText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
