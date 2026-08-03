import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="home" options={{ title: 'Americas TechGuard — Cidadão' }} />
      <Stack.Screen name="map" options={{ title: 'Mapa de Risco & Inundações' }} />
      <Stack.Screen name="shelters" options={{ title: 'Abrigos Disponíveis' }} />
      <Stack.Screen name="shelter-details" options={{ title: 'Detalhes do Abrigo' }} />
      <Stack.Screen name="register-shelter" options={{ title: 'Solicitar Cadastro de Abrigo' }} />
      <Stack.Screen name="alerts" options={{ title: 'Alertas da Defesa Civil' }} />
      <Stack.Screen name="profile" options={{ title: 'Meu Perfil' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
    </Stack>
  );
}
