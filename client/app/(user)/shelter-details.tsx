import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function ShelterDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    async function loadDetails() {
      const data = await api.get(`/shelters/${id || 's1'}`);
      setDetails(data);
    }
    loadDetails();
  }, [id]);

  if (!details) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <View style={styles.statusRow}>
          <Text style={styles.shelterIcon}>🏢</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>HOMOLOGADO — OPERACIONAL</Text>
          </View>
        </View>
        <Text style={styles.title}>{details.name}</Text>
        <Text style={styles.address}>📍 {details.address}</Text>
      </View>

      {/* Grid de Estatísticas de Vagas */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Capacidade Total</Text>
          <Text style={styles.statNumber}>{details.capacity}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Ocupação Atual</Text>
          <Text style={[styles.statNumber, { color: theme.colors.riskModerate }]}>{details.current_occupancy}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Vagas Livres</Text>
          <Text style={[styles.statNumber, { color: theme.colors.riskLow }]}>{details.available_spots || (details.capacity - details.current_occupancy)}</Text>
        </View>
      </View>

      {/* Informações de Contato e Suporte */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações de Contato & Responsáveis</Text>
        <Text style={styles.infoText}>📞 Contato: {details.contact || '(47) 3381-6900 — Defesa Civil de Blumenau'}</Text>
        <Text style={styles.infoText}>⏰ Horário de Funcionamento: 24 horas durante emergências</Text>
        <Text style={styles.infoText}>🎒 Itens recomendados: Documentos, remédios contínuos, roupas de cama e higiene pessoal.</Text>
      </View>

      <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/(user)/map')}>
        <Text style={styles.mapButtonText}>🗺️ Ver Localização no Mapa de Risco</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar para a Lista de Abrigos</Text>
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
  headerBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shelterIcon: {
    fontSize: 28,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.riskLow,
    fontWeight: 'bold',
    fontSize: 11,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  address: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  mapButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: 12,
  },
  mapButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
