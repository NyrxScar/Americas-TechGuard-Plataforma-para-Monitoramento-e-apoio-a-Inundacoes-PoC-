import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function CivilDefenseLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1e1b4b' }, // Tom escuro violeta/operacional para Defesa Civil
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Painel Operacional — Defesa Civil' }} />
      <Stack.Screen name="pending-shelters" options={{ title: 'Solicitações de Abrigo Pendentes' }} />
      <Stack.Screen name="shelter-review" options={{ title: 'Auditoria e Revisão de Abrigo' }} />
      <Stack.Screen name="registered-shelters" options={{ title: 'Abrigos Homologados' }} />
      <Stack.Screen name="telemetry" options={{ title: 'Telemetria IoT & Nós Mesh/LoRaWAN' }} />
      <Stack.Screen name="risk-analysis" options={{ title: 'Análise de Risco Integrada (HAND)' }} />
      <Stack.Screen name="alerts-management" options={{ title: 'Gerenciamento de Alertas' }} />
    </Stack>
  );
}
