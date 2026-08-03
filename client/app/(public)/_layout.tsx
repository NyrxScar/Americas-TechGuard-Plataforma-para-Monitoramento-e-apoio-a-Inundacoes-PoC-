import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/theme';

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: theme.colors.background },
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="access" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Criar Conta' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Recuperar Senha' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Redefinir Senha' }} />
      <Stack.Screen name="verify-email" options={{ title: 'Verificação de E-mail' }} />
      <Stack.Screen name="privacy-policy" options={{ title: 'Política de Privacidade' }} />
    </Stack>
  );
}
