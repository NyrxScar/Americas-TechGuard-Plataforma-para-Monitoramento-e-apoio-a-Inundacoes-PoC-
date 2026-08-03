import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function RegisterShelterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    await api.post('/shelter-requests', {
      name,
      address,
      capacity: parseInt(capacity) || 50,
      contact,
      notes
    });

    Alert.alert('Solicitação Enviada', 'Sua sugestão de abrigo foi encaminhada para análise da Defesa Civil.');
    router.replace('/(user)/shelters');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitar Cadastro de Abrigo</Text>
        <Text style={styles.subtitle}>
          Insira as informações de um local com estrutura para abrigo comunitário. A Defesa Civil fará a homologação presencial/técnica.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome da Instalação / Local</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Salão Comunitário Capela São José"
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Endereço Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Rua, Número, Bairro - Blumenau/SC"
          placeholderTextColor={theme.colors.textMuted}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Capacidade Estimada de Pessoas</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 100"
          placeholderTextColor={theme.colors.textMuted}
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Telefone de Contato / Responsável</Text>
        <TextInput
          style={styles.input}
          placeholder="(47) 99999-9999"
          placeholderTextColor={theme.colors.textMuted}
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Observações (Banheiros, Cozinha, Acessibilidade)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva a estrutura disponível..."
          placeholderTextColor={theme.colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar Solicitação à Defesa Civil →</Text>
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
    marginTop: 4,
    lineHeight: 18,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
