import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function AlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function loadAlerts() {
      const data = await api.get('/alerts');
      if (data) setAlerts(data);
    }
    loadAlerts();
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: 'rgba(136, 19, 55, 0.25)', border: theme.colors.riskCritical, text: '#fda4af', label: 'CRÍTICO' };
      case 'high':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: theme.colors.riskHigh, text: '#fca5a5', label: 'ALTA SEVERIDADE' };
      case 'moderate':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: theme.colors.riskModerate, text: '#fde047', label: 'MODERADO' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.2)', border: theme.colors.riskLow, text: '#6ee7b7', label: 'INFORMATIVO' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Boletins e Alertas Ambientais</Text>
        <Text style={styles.subtitle}>Emitidos pela Defesa Civil de Blumenau em tempo real</Text>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }: { item: any }) => {
          const style = getSeverityStyle(item.severity);
          return (
            <View style={[styles.card, { borderColor: style.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: style.bg }]}>
                  <Text style={[styles.badgeText, { color: style.text }]}>{style.label}</Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <Text style={styles.alertTitle}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>

              {item.recommendations && (
                <View style={styles.recommendationsBox}>
                  <Text style={styles.recommendationsTitle}>💡 Recomendações de Segurança:</Text>
                  {item.recommendations.map((rec: string, idx: number) => (
                    <Text key={idx} style={styles.recItem}>• {rec}</Text>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(user)/home')}>
        <Text style={styles.backButtonText}>← Voltar à Página Inicial</Text>
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
  listContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  dateText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  recommendationsBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  recommendationsTitle: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recItem: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
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
