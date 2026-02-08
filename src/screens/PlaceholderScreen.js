import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export function PlaceholderScreen({ title, subtitle }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.panel}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 18,
  },
  panel: {
    backgroundColor: '#1b2130',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#f6f4ef',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9aa4b2',
    marginTop: 10,
  },
});

