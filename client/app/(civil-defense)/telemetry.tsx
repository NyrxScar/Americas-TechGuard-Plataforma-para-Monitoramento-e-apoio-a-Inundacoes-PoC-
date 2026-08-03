import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function TelemetryScreen() {
  const router = useRouter();
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    async function loadTelemetry() {
      const res = await api.get('/telemetria/recentes');
      if (res && res.data) setReadings(res.data);
    }
    loadTelemetry();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nós de Monitoramento IoT (Rede Mesh / LoRaWAN)</Text>
        <Text style={styles.subtitle}>Telemetria em tempo real gerada pelo simulador Python</Text>
      </View>

      <FlatList
        data={readings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.deviceId}>📡 {item.device_id}</Text>
              <View style={styles.modeBadge}>
                <Text style={styles.modeText}>{item.network_mode || 'LoRaWAN'} ({item.hops || 1} Hops)</Text>
              </View>
            </View>

            <Text style={styles.stationName}>{item.station_name}</Text>

            <View style={styles.gridData}>
              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Nível da Água</Text>
                <Text style={[styles.dataValue, { color: theme.colors.accent }]}>{item.water_level} m</Text>
              </View>

              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Precipitação (24h)</Text>
                <Text style={styles.dataValue}>{item.rainfall} mm</Text>
              </View>

              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Nível de Risco</Text>
                <Text style={[styles.dataValue, { color: item.risk_level === 'high' ? theme.colors.riskHigh : theme.colors.riskModerate }]}>
                  {item.risk_level?.toUpperCase() || 'MODERADO'}
                </Text>
              </View>

              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Bateria do Nó</Text>
                <Text style={styles.dataValue}>🔋 {item.battery || 98}%</Text>
              </View>
            </View>

            <Text style={styles.timestamp}>
              Última leitura: {new Date(item.timestamp).toLocaleTimeString()} — Status Comunicação: OPERACIONAL (Simulado)
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/(civil-defense)/risk-analysis')}
      >
        <Text style={styles.actionButtonText}>Ver Análise Integrada de Risco (HAND) →</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
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
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  modeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  modeText: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: 'bold',
  },
  stationName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  dataBox: {
    width: '48%',
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dataLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  dataValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontSize: 11,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 8,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
