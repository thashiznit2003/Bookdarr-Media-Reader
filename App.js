import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from './src/auth/auth-context';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
