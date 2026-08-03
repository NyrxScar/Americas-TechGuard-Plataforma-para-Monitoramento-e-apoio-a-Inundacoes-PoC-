import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function MapScreen() {
  const router = useRouter();
  const [activeLayers, setActiveLayers] = useState({
    boundary: true,
    basins: true,
    handModel: true,
    riskAreas: true,
    sensors: true,
    shelters: true,
  });

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      {/* Controles de Camadas Cartográficas */}
      <View style={styles.controlsHeader}>
        <Text style={styles.controlsTitle}>Camadas do Mapa (Blumenau SC):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[styles.chip, activeLayers.boundary && styles.chipActive]}
            onPress={() => toggleLayer('boundary')}
          >
            <Text style={[styles.chipText, activeLayers.boundary && styles.chipTextActive]}>📍 Limite Municipal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, activeLayers.basins && styles.chipActive]}
            onPress={() => toggleLayer('basins')}
          >
            <Text style={[styles.chipText, activeLayers.basins && styles.chipTextActive]}>🌊 Ottobacias (ANA)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, activeLayers.handModel && styles.chipActive]}
            onPress={() => toggleLayer('handModel')}
          >
            <Text style={[styles.chipText, activeLayers.handModel && styles.chipTextActive]}>🏔️ Modelo HAND</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, activeLayers.sensors && styles.chipActive]}
            onPress={() => toggleLayer('sensors')}
          >
            <Text style={[styles.chipText, activeLayers.sensors && styles.chipTextActive]}>📡 Sensores IoT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, activeLayers.shelters && styles.chipActive]}
            onPress={() => toggleLayer('shelters')}
          >
            <Text style={[styles.chipText, activeLayers.shelters && styles.chipTextActive]}>🏢 Abrigos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Visualização de Mapa Interativo (Container Cartográfico Simulativo e Responsivo) */}
      <View style={styles.mapViewport}>
        <View style={styles.mapCanvas}>
          <Text style={styles.mapWatermark}>Rio Itajaí-Açú — Blumenau, SC</Text>
          
          {/* Representação Interativa das Estações de Sensores */}
          {activeLayers.sensors && (
            <>
              <TouchableOpacity
                style={[styles.mapMarker, { top: '30%', left: '45%', backgroundColor: theme.colors.riskModerate }]}
                onPress={() => router.push('/(user)/shelter-details?id=s1')}
              >
                <Text style={styles.markerText}>📡 ST-01 (4.85m)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mapMarker, { top: '65%', left: '35%', backgroundColor: theme.colors.riskLow }]}
              >
                <Text style={styles.markerText}>📡 ST-02 (2.10m)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mapMarker, { top: '50%', left: '70%', backgroundColor: theme.colors.riskHigh }]}
              >
                <Text style={styles.markerText}>📡 ST-03 (6.20m)</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Representação dos Abrigos no Mapa */}
          {activeLayers.shelters && (
            <TouchableOpacity
              style={[styles.shelterMarker, { top: '38%', left: '50%' }]}
              onPress={() => router.push('/(user)/shelter-details?id=s1')}
            >
              <Text style={styles.shelterMarkerText}>🏢 Abrigo Matriz (108 vagas)</Text>
            </TouchableOpacity>
          )}

          {/* Legenda do Modelo HAND */}
          {activeLayers.handModel && (
            <View style={styles.handLegendBox}>
              <Text style={styles.legendTitle}>Modelo HAND (Height Above Nearest Drainage)</Text>
              <View style={styles.legendGradient}>
                <View style={[styles.legendStep, { backgroundColor: '#ef4444' }]}><Text style={styles.legendStepText}>0-2m (Alto Risco)</Text></View>
                <View style={[styles.legendStep, { backgroundColor: '#f59e0b' }]}><Text style={styles.legendStepText}>2-5m (Atenção)</Text></View>
                <View style={[styles.legendStep, { backgroundColor: '#10b981' }]}><Text style={styles.legendStepText}>&gt;5m (Seguro)</Text></View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Roda-pé de Ações */}
      <View style={styles.mapFooter}>
        <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/(user)/shelters')}>
          <Text style={styles.footerButtonText}>Listar Todos os Abrigos →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  controlsHeader: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  controlsTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsScroll: {
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  mapViewport: {
    flex: 1,
    position: 'relative',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#0d1b2a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapWatermark: {
    color: 'rgba(255, 255, 255, 0.1)',
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  mapMarker: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    elevation: 4,
  },
  markerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  shelterMarker: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  shelterMarkerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  handLegendBox: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(22, 30, 46, 0.9)',
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legendTitle: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  legendGradient: {
    flexDirection: 'row',
    height: 24,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  legendStep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendStepText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mapFooter: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  footerButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  footerButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
