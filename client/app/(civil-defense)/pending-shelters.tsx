import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function PendingSheltersScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    async function loadPending() {
      const data = await api.get('/shelter-requests/pending');
      if (data) setRequests(data);
    }
    loadPending();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitações Pendentes de Homologação</Text>
        <Text style={styles.subtitle}>Locais sugeridos por cidadãos aguardando validação técnica</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(civil-defense)/shelter-review?id=${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.shelterName}>{item.shelter_name}</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>AGUARDANDO ANÁLISE</Text>
              </View>
            </View>

            <Text style={styles.address}>📍 {item.address}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.capacity}>Capacidade Estimada: {item.capacity} pessoas</Text>
              <Text style={styles.actionText}>Auditar Solicitação →</Text>
            </View>
          </TouchableOpacity>
        )}
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
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.pending,
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
  pendingBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  pendingText: {
    color: theme.colors.pending,
    fontSize: 10,
    fontWeight: 'bold',
  },
  address: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 8,
  },
  capacity: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  actionText: {
    color: theme.colors.accent,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
