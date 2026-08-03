import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { theme } from '../src/theme/theme';

export default function Index() {
  const { user, role, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        router.replace('/(public)/splash');
      } else if (role === 'civil_defense') {
        router.replace('/(civil-defense)/dashboard');
      } else {
        router.replace('/(user)/home');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isLoggedIn, role]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={styles.text}>Iniciando Americas TechGuard...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
});
