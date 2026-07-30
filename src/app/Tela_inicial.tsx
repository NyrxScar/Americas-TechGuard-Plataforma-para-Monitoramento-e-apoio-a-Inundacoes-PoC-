import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Definição da interface do Abrigo
interface Shelter {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  phone: string;
  currentOccupancy: number;
  maxCapacity: number;
  latitude: number;
  longitude: number;
  status: 'baixo' | 'moderado' | 'alto' | 'severo';
}

// Dados simulados de abrigos
const MOCK_SHELTERS: Shelter[] = [
  {
    id: '1',
    name: 'Escola Municipal João Pereira',
    neighborhood: 'Centro',
    address: 'Rua das Acácias, 120 - Centro',
    phone: '(31) 3456-7890',
    currentOccupancy: 85,
    maxCapacity: 300,
    latitude: -19.916681,
    longitude: -43.934493,
    status: 'baixo',
  },
  {
    id: '2',
    name: 'Ginásio Poliesportivo Serra',
    neighborhood: 'Serra',
    address: 'Av. das Montanhas, 500 - Serra',
    phone: '(31) 3456-7891',
    currentOccupancy: 220,
    maxCapacity: 500,
    latitude: -19.925000,
    longitude: -43.920000,
    status: 'baixo',
  },
  {
    id: '3',
    name: 'Centro Comunitário Vale do Sol',
    neighborhood: 'Vale',
    address: 'Rua do Sol, 45 - Vale',
    phone: '(31) 3456-7892',
    currentOccupancy: 410,
    maxCapacity: 450,
    latitude: -19.935000,
    longitude: -43.910000,
    status: 'alto',
  },
];

export default function AbrigosScreen() {
  const [selectedShelter, setSelectedShelter] = useState<Shelter>(MOCK_SHELTERS[0]);

  // Cálculos dinâmicos dos indicadores
  const totalShelters = MOCK_SHELTERS.length;
  const totalCapacity = MOCK_SHELTERS.reduce((acc, curr) => acc + curr.maxCapacity, 0);
  const totalOccupied = MOCK_SHELTERS.reduce((acc, curr) => acc + curr.currentOccupancy, 0);
  const totalAvailable = totalCapacity - totalOccupied;

  // Ação de Ligar
  const handleCall = (phone: string) => {
    const rawPhone = phone.replace(/\D/g, '');
    Linking.openURL(`tel:${rawPhone}`);
  };

  // Ação de Rota (GPS)
  const handleTraceRoute = (lat: number, lng: number, name: string) => {
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const latLng = `${lat},${lng}`;
    const label = encodeURIComponent(name);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      
      {/* 1. Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Abrigos Seguros</Text>
        <Text style={styles.subtitle}>Encontre abrigos disponíveis na cidade</Text>
      </View>

      {/* 2. 4 Cards de Indicadores na Horizontal */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.statsContainer}
      >
        {/* Card 1: Abrigos cadastrados */}
        <View style={styles.statCard}>
          <View style={styles.statIconHeader}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2">
              <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </Svg>
          </View>
          <Text style={styles.statNumber}>{totalShelters}</Text>
          <Text style={styles.statLabel}>Abrigos cadastrados</Text>
        </View>

        {/* Card 2: Capacidade total */}
        <View style={styles.statCard}>
          <View style={styles.statIconHeader}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2">
              <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <Path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </Svg>
          </View>
          <Text style={styles.statNumber}>{totalCapacity}</Text>
          <Text style={styles.statLabel}>Capacidade total</Text>
        </View>

        {/* Card 3: Pessoas abrigadas */}
        <View style={styles.statCard}>
          <View style={styles.statIconHeader}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
              <Path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <Path d="M4 21v-2a4 4 0 0 1 3-3.87" />
            </Svg>
          </View>
          <Text style={styles.statNumber}>{totalOccupied}</Text>
          <Text style={styles.statLabel}>Pessoas abrigadas</Text>
        </View>

        {/* Card 4: Vagas disponíveis */}
        <View style={styles.statCard}>
          <View style={styles.statIconHeader}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <Path d="M22 4L12 14.01l-3-3" />
            </Svg>
          </View>
          <Text style={styles.statNumber}>{totalAvailable}</Text>
          <Text style={styles.statLabel}>Vagas disponíveis</Text>
        </View>
      </ScrollView>

      {/* 3. Área do Mapa Interativo */}
      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: -19.920000,
            longitude: -43.925000,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {MOCK_SHELTERS.map((shelter) => (
            <Marker
              key={shelter.id}
              coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
              onPress={() => setSelectedShelter(shelter)}
            >
              {/* Luz do Pino Personalizada (Ponto com Brilho) */}
              <View style={styles.pinContainer}>
                <View style={styles.pinGlow} />
                <View style={styles.pinCore} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Legenda do Mapa */}
        <View style={styles.legendBox}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Baixo</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Moderado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Alto / Severo</Text>
          </View>
        </View>
      </View>

      {/* 4. Painel Inferior de Detalhes do Abrigo Selecionado */}
      {selectedShelter && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.shelterTitle}>{selectedShelter.name}</Text>
              <Text style={styles.shelterSub}>{selectedShelter.neighborhood}</Text>
            </View>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>
                {Math.round((selectedShelter.currentOccupancy / selectedShelter.maxCapacity) * 100)}%
              </Text>
            </View>
          </View>

          <Text style={styles.infoRow}>📍 {selectedShelter.address}</Text>
          <Text style={styles.infoRow}>
            👥 {selectedShelter.currentOccupancy} / {selectedShelter.maxCapacity} pessoas
          </Text>
          <Text style={styles.infoRow}>📞 {selectedShelter.phone}</Text>

          {/* Botões de Ação */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.btnPrimary}
              activeOpacity={0.8}
              onPress={() => handleTraceRoute(selectedShelter.latitude, selectedShelter.longitude, selectedShelter.name)}
            >
              <Text style={styles.btnPrimaryText}>Traçar Rota</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnSecondary}
              activeOpacity={0.8}
              onPress={() => handleCall(selectedShelter.phone)}
            >
              <Text style={styles.btnSecondaryText}>Ligar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
  },
  statCard: {
    width: 130,
    backgroundColor: '#161E2E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
  },
  statIconHeader: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinGlow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    position: 'absolute',
  },
  pinCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  legendBox: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#161E2E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  detailCard: {
    backgroundColor: '#161E2E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    gap: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shelterTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  shelterSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  percentageBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  percentageText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});