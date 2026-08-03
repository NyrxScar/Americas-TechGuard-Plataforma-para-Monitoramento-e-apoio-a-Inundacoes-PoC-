import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/theme/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, role, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'C'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Cidadão Blumenau'}</Text>
        <Text style={styles.userRole}>
          {role === 'civil_defense' ? '🚨 Operador da Defesa Civil' : '👤 Cidadão Cadastrado'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Dados da Conta</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-mail:</Text>
          <Text style={styles.infoValue}>{user?.email || 'cidadao@blumenau.sc.gov.br'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telefone:</Text>
          <Text style={styles.infoValue}>{user?.phone || '(47) 99999-1111'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Município:</Text>
          <Text style={styles.infoValue}>Blumenau / SC</Text>
        </View>
      </View>

      {/* Opções de Navegação */}
      <View style={styles.menuGroup}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(user)/edit-profile')}>
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={styles.menuText}>Editar Dados do Perfil</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(user)/settings')}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Configurações e Preferências</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutItem} onPress={logout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.logoutText}>Encerrar Sessão (Sair)</Text>
        </TouchableOpacity>
      </View>
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
  avatarCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  userRole: {
    fontSize: 13,
    color: theme.colors.accent,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  menuGroup: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  chevron: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.riskHigh,
    marginTop: 10,
  },
  logoutText: {
    color: theme.colors.riskHigh,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
