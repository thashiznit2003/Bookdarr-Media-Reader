import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/auth-context';

export function LoginScreen() {
  const auth = useAuth();
  const [bmsUrl, setBmsUrl] = useState(auth.baseUrl ?? 'https://bms.shiznit.duckdns.org');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const needsOtp = Boolean(auth.challengeToken);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!bmsUrl.trim()) return false;
    if (!needsOtp) {
      return Boolean(username.trim() && password);
    }
    return Boolean(otp.trim());
  }, [submitting, bmsUrl, username, password, otp, needsOtp]);

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    auth.setError(null);
    try {
      if (!needsOtp) {
        await auth.signIn({ nextBaseUrl: bmsUrl, username, password });
      } else {
        await auth.completeTwoFactor({ otp });
      }
    } catch (e) {
      auth.setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>Bookdarr Media Reader</Text>
        <Text style={styles.subtitle}>Sign in to BMS</Text>

        <View style={styles.field}>
          <Text style={styles.label}>BMS URL</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            value={bmsUrl}
            onChangeText={setBmsUrl}
            editable={!submitting && !needsOtp}
            placeholder="https://bms.example.com"
          />
        </View>

        {!needsOtp ? (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Username or Email</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                editable={!submitting}
                placeholder="joe"
                returnKeyType="next"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                editable={!submitting}
                placeholder="password"
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={onSubmit}
              />
            </View>
          </>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Authenticator Code</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              editable={!submitting}
              placeholder="123456"
              inputMode="numeric"
              keyboardType="number-pad"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
            />
          </View>
        )}

        {auth.error ? <Text style={styles.error}>{auth.error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, !canSubmit ? styles.buttonDisabled : null]}
          disabled={!canSubmit}
          onPress={onSubmit}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Signing in...' : needsOtp ? 'Verify code' : 'Sign in'}
          </Text>
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
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1b2130',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#f5b942',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#9aa4b2',
    marginTop: 6,
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: '#9aa4b2',
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(10,12,18,0.7)',
    color: '#f6f4ef',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  error: {
    color: '#f87171',
    marginTop: 6,
    marginBottom: 10,
  },
  button: {
    marginTop: 8,
    backgroundColor: 'rgba(245,185,66,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245,185,66,0.35)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#f6f4ef',
    fontWeight: '700',
  },
});

