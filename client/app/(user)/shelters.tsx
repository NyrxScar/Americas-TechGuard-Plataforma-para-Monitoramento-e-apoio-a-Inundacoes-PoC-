import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function SheltersScreen() {
  const router = useRouter();
  const [shelters, setShelters] = useState<any[]>([]);

  useEffect(() => {
    async function fetchShelters() {
      const data = await api.get('/shelters');
      if (data) setShelters(data);
    }
    fetchShelters();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Abrigos Emergenciais em Blumenau</Text>
        <Text style={styles.subtitle}>Consulte vagas disponíveis e localizações homologadas pela Defesa Civil</Text>
      </View>

      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => router.push('/(user)/register-shelter')}
      >
        <Text style={styles.requestButtonIcon}>➕</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.requestButtonTitle}>Sugerir Novo Abrigo Comunitário</Text>
          <Text style={styles.requestButtonSub}>Envie uma solicitação de cadastro para análise da Defesa Civil</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>

      <FlatList
        data={shelters}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }: { item: any }) => {
          const spots = item.capacity - (item.current_occupancy || 0);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(user)/shelter-details?id=${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>ATIVO</Text>
                </View>
              </View>

              <Text style={styles.address}>📍 {item.address}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Capacidade Total</Text>
                  <Text style={styles.statValue}>{item.capacity} pessoas</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Vagas Disponíveis</Text>
                  <Text style={[styles.statValue, { color: theme.colors.riskLow }]}>{spots} vagas</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Distância</Text>
                  <Text style={styles.statValue}>{item.distance || '1.5 km'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    marginBottom: 14,
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
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 16,
  },
  requestButtonIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  requestButtonTitle: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  requestButtonSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: theme.colors.accent,
    fontWeight: 'bold',
    fontSize: 18,
  },
  listContainer: {
    gap: 12,
    paddingBottom: 24,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.riskLow,
    fontSize: 10,
    fontWeight: 'bold',
  },
  address: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 10,
  },
  statBox: {
    alignItems: 'flex-start',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
  },
});
