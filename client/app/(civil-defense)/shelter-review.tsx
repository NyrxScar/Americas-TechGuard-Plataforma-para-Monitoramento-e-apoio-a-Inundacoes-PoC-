import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function ShelterReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [notes, setNotes] = useState('');

  const handleDecision = async (action: 'approve' | 'reject') => {
    await api.put(`/shelter-requests/${id || 'req-101'}/review`, { action, notes });

    Alert.alert(
      action === 'approve' ? 'Abrigo Homologado' : 'Solicitação Recusada',
      action === 'approve'
        ? 'O abrigo foi aprovado e já está visível para a população no mapa e lista de abrigos.'
        : 'A solicitação foi indeferida e arquivada.'
    );
    router.replace('/(civil-defense)/pending-shelters');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Auditoria do Local Sugerido</Text>
        <Text style={styles.subtitle}>ID da Solicitação: {id || 'req-101'}</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.label}>Nome do Abrigo:</Text>
        <Text style={styles.value}>Ginásio Comunitário Itoupava Norte</Text>

        <Text style={styles.label}>Endereço:</Text>
        <Text style={styles.value}>Rua 2 de Setembro, 1200 - Itoupava Norte, Blumenau - SC</Text>

        <Text style={styles.label}>Capacidade Informada:</Text>
        <Text style={styles.value}>120 pessoas</Text>

        <Text style={styles.label}>Solicitante:</Text>
        <Text style={styles.value}>Cidadão Blumenau (Verificado)</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formLabel}>Parecer Técnico / Observações da Defesa Civil:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Insira detalhes sobre vistoria de segurança, banheiros, gerador..."
          placeholderTextColor={theme.colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.approveButton} onPress={() => handleDecision('approve')}>
            <Text style={styles.buttonText}>Aprovar & Homologar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectButton} onPress={() => handleDecision('reject')}>
            <Text style={styles.buttonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formLabel: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: theme.colors.riskLow,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: theme.colors.riskHigh,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
