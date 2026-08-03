import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import { api } from '../../src/services/api';

export default function AlertsManagementScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'high' | 'critical'>('moderate');

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const res = await api.get('/alerts');
    if (res) setAlerts(res);
  }

  const handleCreateAlert = async () => {
    if (!title || !description) {
      Alert.alert('Atenção', 'Preencha o título e a descrição do alerta.');
      return;
    }

    await api.post('/alerts', {
      title,
      description,
      severity
    });

    Alert.alert('Alerta Emitido', 'O alerta foi publicado e transmitido aos cidadãos.');
    setTitle('');
    setDescription('');
    loadAlerts();
  };

  const handleCloseAlert = async (alertId: string) => {
    await api.put(`/alerts/${alertId}`, { status: 'closed' });
    Alert.alert('Alerta Encerrado', 'O alerta foi encerrado no sistema.');
    loadAlerts();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Emissão & Gestão de Alertas</Text>
        <Text style={styles.subtitle}>Alertas transmitidos em tempo real para o aplicativo do cidadão</Text>
      </View>

      {/* Formulário de Criação de Alerta */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>📢 Criar Novo Alerta da Defesa Civil</Text>

        <Text style={styles.label}>Título do Alerta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Alerta Vermelho: Elevação do Rio Itajaí-Açú"
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descrição e Orientações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva a situação hidrológica e medidas a tomar..."
          placeholderTextColor={theme.colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Nível de Severidade</Text>
        <View style={styles.severityRow}>
          <TouchableOpacity
            style={[styles.severityBtn, severity === 'low' && { backgroundColor: theme.colors.riskLow }]}
            onPress={() => setSeverity('low')}
          >
            <Text style={styles.severityBtnText}>Baixo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.severityBtn, severity === 'moderate' && { backgroundColor: theme.colors.riskModerate }]}
            onPress={() => setSeverity('moderate')}
          >
            <Text style={styles.severityBtnText}>Moderado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.severityBtn, severity === 'high' && { backgroundColor: theme.colors.riskHigh }]}
            onPress={() => setSeverity('high')}
          >
            <Text style={styles.severityBtnText}>Alto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.severityBtn, severity === 'critical' && { backgroundColor: theme.colors.riskCritical }]}
            onPress={() => setSeverity('critical')}
          >
            <Text style={styles.severityBtnText}>Crítico</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateAlert}>
          <Text style={styles.createButtonText}>Emitir Alerta à População →</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Alertas Ativos */}
      <Text style={styles.sectionTitle}>Alertas Ativos e Recentes ({alerts.length})</Text>
      {alerts.map((item) => (
        <View key={item.id} style={styles.alertCard}>
          <View style={styles.alertCardHeader}>
            <Text style={styles.alertCardTitle}>{item.title}</Text>
            <TouchableOpacity style={styles.closeAlertBtn} onPress={() => handleCloseAlert(item.id)}>
              <Text style={styles.closeAlertBtnText}>Encerrar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.alertCardDesc}>{item.description}</Text>
          <Text style={styles.alertCardMeta}>Severidade: {item.severity?.toUpperCase()} | Status: {item.status}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(civil-defense)/dashboard')}>
        <Text style={styles.backButtonText}>← Voltar ao Painel Operacional</Text>
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
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: 10,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  severityBtn: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  severityBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  alertCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertCardTitle: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  closeAlertBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  closeAlertBtnText: {
    color: theme.colors.riskHigh,
    fontSize: 11,
    fontWeight: 'bold',
  },
  alertCardDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  alertCardMeta: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
