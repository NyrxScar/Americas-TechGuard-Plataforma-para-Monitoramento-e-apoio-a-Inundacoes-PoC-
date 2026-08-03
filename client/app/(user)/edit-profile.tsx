import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { theme } from '../../src/theme/theme';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || 'Cidadão Blumenau');
  const [email, setEmail] = useState(user?.email || 'cidadao@blumenau.sc.gov.br');
  const [phone, setPhone] = useState(user?.phone || '(47) 99999-1111');

  const handleSave = () => {
    Alert.alert('Perfil Atualizado', 'Seus dados cadastrais foram atualizados com sucesso.');
    router.replace('/(user)/profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar Dados Pessoais</Text>
        <Text style={styles.subtitle}>Atualize suas informações de contato para emergências</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.label}>Telefone / WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={theme.colors.textMuted}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Salvar Alterações →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
