import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function RegisteredSheltersScreen() {
  const router = useRouter();
  const [shelters, setShelters] = useState<any[]>([]);

  useEffect(() => {
    async function loadShelters() {
      const data = await api.get('/shelters');
      if (data) setShelters(data);
    }
    loadShelters();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Abrigos Homologados na Cidade</Text>
        <Text style={styles.subtitle}>Gestão de ocupação e capacidade em tempo real</Text>
      </View>

      <FlatList
        data={shelters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const occ = item.current_occupancy || 0;
          const pct = Math.round((occ / item.capacity) * 100);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.shelterName}>{item.name}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>ATIVO ({pct}% OCUPADO)</Text>
                </View>
              </View>

              <Text style={styles.address}>📍 {item.address}</Text>

              <View style={styles.statsRow}>
                <Text style={styles.statText}>Ocupação: <Text style={styles.statBold}>{occ} / {item.capacity}</Text></Text>
                <Text style={styles.statText}>Vagas Restantes: <Text style={[styles.statBold, { color: theme.colors.riskLow }]}>{item.capacity - occ}</Text></Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: pct > 80 ? theme.colors.riskHigh : theme.colors.primary }]} />
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(civil-defense)/dashboard')}>
        <Text style={styles.backButtonText}>← Voltar ao Painel Operacional</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  activeText: {
    color: theme.colors.riskLow,
    fontSize: 10,
    fontWeight: 'bold',
  },
  address: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  statBold: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
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
