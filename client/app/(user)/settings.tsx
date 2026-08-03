import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/theme/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [locationPerm, setLocationPerm] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Preferências Gerais</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Notificações de Emergência (Push)</Text>
            <Text style={styles.rowSub}>Receber alertas críticos da Defesa Civil imediatamente</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#334155', true: theme.colors.primary }} />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Permissão de Geolocalização</Text>
            <Text style={styles.rowSub}>Permitir encontrar o abrigo mais próximo</Text>
          </View>
          <Switch value={locationPerm} onValueChange={setLocationPerm} trackColor={{ false: '#334155', true: theme.colors.primary }} />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Modo Escuro (Dark Mode)</Text>
            <Text style={styles.rowSub}>Visualização otimizada de mapas e alertas</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#334155', true: theme.colors.primary }} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sobre o Sistema</Text>
      <View style={styles.card}>
        <Text style={styles.aboutText}>Americas TechGuard — Plataforma de Apoio a Inundações</Text>
        <Text style={styles.aboutSub}>Versão 1.0.0 (PoC Blumenau - SC)</Text>
        <Text style={styles.aboutSub}>Tecnologias: Expo, React Native, Node.js, PostGIS, HAND Model</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Encerrar Sessão (Sair)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(user)/profile')}>
        <Text style={styles.backButtonText}>← Voltar ao Perfil</Text>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  rowSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  aboutText: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  aboutSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.riskHigh,
    marginTop: 10,
  },
  logoutText: {
    color: theme.colors.riskHigh,
    fontWeight: 'bold',
    fontSize: 15,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
