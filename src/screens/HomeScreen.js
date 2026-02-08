import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/auth-context';

export function HomeScreen({ navigation }) {
  const auth = useAuth();
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    setStatus('Loading profile...');
    auth.client
      .fetchJson('/api/v1/me', { method: 'GET' })
      .then((body) => {
        if (!mounted) return;
        setMe(body ?? null);
        setStatus('');
      })
      .catch((e) => {
        if (!mounted) return;
        setStatus(e instanceof Error ? e.message : String(e));
      });
    return () => {
      mounted = false;
    };
  }, [auth]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <TouchableOpacity style={styles.smallButton} onPress={auth.signOut}>
          <Text style={styles.smallButtonText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Connected to</Text>
        <Text style={styles.panelValue}>{auth.baseUrl ?? '(not set)'}</Text>
        <Text style={styles.panelTitle}>Signed in as</Text>
        <Text style={styles.panelValue}>{me?.username ?? auth.user?.username ?? '(unknown)'}</Text>
        {status ? <Text style={styles.muted}>{status}</Text> : null}
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookPool')}>
          <Text style={styles.cardTitle}>Book Pool</Text>
          <Text style={styles.cardBody}>Browse and check out books.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyLibrary')}>
          <Text style={styles.cardTitle}>My Library</Text>
          <Text style={styles.cardBody}>Your checked out books.</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: '#f6f4ef',
    fontSize: 22,
    fontWeight: '800',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  smallButtonText: {
    color: '#f6f4ef',
    fontWeight: '700',
  },
  panel: {
    backgroundColor: '#1b2130',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  panelTitle: {
    color: '#9aa4b2',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  panelValue: {
    color: '#f6f4ef',
    marginTop: 4,
  },
  muted: {
    color: '#9aa4b2',
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1b2130',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    color: '#f5b942',
    fontWeight: '800',
    fontSize: 16,
  },
  cardBody: {
    color: '#9aa4b2',
    marginTop: 8,
  },
});

