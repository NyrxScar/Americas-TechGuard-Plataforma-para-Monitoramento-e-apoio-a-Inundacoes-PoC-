import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleVerify = () => {
    router.replace('/(public)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Verificação de E-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de confirmação de 6 dígitos para o e-mail: {'\n'}
          <Text style={styles.emailHighlight}>{email || 'seu.email@exemplo.com'}</Text>
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Código de Verificação</Text>
        <TextInput
          style={styles.inputCode}
          placeholder="123456"
          placeholderTextColor={theme.colors.textMuted}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleVerify}>
          <Text style={styles.submitButtonText}>Confirmar E-mail e Ir para Login →</Text>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  emailHighlight: {
    color: theme.colors.accent,
    fontWeight: 'bold',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  inputCode: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 8,
    textAlign: 'center',
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
    fontSize: 15,
  },
});
