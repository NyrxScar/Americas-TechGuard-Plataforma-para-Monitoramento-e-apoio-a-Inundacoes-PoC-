import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/theme/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (selectedRole?: 'citizen' | 'civil_defense') => {
    const targetEmail = email || (selectedRole === 'civil_defense' ? 'defesacivil@blumenau.sc.gov.br' : 'cidadao@blumenau.sc.gov.br');
    login(targetEmail, selectedRole);

    if (selectedRole === 'civil_defense' || targetEmail.includes('defesa') || targetEmail.includes('civil')) {
      router.replace('/(civil-defense)/dashboard');
    } else {
      router.replace('/(user)/home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Entrar na Conta</Text>
        <Text style={styles.subtitle}>Digite suas credenciais para acessar os recursos da plataforma</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu.email@exemplo.com"
          placeholderTextColor={theme.colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={theme.colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => router.push('/(public)/forgot-password')}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={() => handleLogin()}>
          <Text style={styles.submitButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>Atalhos de Acesso Rápido (PoC):</Text>
        <View style={styles.demoButtonsRow}>
          <TouchableOpacity style={styles.demoButtonCitizen} onPress={() => handleLogin('citizen')}>
            <Text style={styles.demoButtonText}>👤 Login Cidadão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoButtonDefense} onPress={() => handleLogin('civil_defense')}>
            <Text style={styles.demoButtonText}>🚨 Login Defesa Civil</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta? </Text>
        <TouchableOpacity onPress={() => router.push('/(public)/register')}>
          <Text style={styles.registerLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 15,
  },
  forgotText: {
    color: theme.colors.accent,
    textAlign: 'right',
    marginTop: 10,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoSection: {
    marginTop: 24,
    padding: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  demoTitle: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  demoButtonCitizen: {
    flex: 1,
    backgroundColor: theme.colors.surfaceHover,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  demoButtonDefense: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.riskHigh,
  },
  demoButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
