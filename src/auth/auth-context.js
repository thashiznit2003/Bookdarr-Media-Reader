import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BmsClient } from '../api/bms-client';
import {
  clearAllAuth,
  getBaseUrl,
  getRefreshToken,
  getStoredUser,
  setBaseUrl,
  setRefreshToken,
  setStoredUser,
} from '../storage/secure-store';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | signedOut | signedIn
  const [baseUrl, setBaseUrlState] = useState(null);
  const [user, setUser] = useState(null);
  const [challengeToken, setChallengeToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);

  const client = useMemo(() => {
    return new BmsClient({
      baseUrl: baseUrl,
      getRefreshToken,
      setRefreshToken,
    });
  }, [baseUrl]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storedBase = await getBaseUrl();
        const storedUser = await getStoredUser();
        if (!mounted) return;
        if (storedBase) {
          setBaseUrlState(storedBase);
          client.setBaseUrl(storedBase);
        }
        if (storedUser) setUser(storedUser);

        const refresh = await getRefreshToken();
        if (!storedBase || !refresh) {
          setStatus('signedOut');
          return;
        }

        // Restore session by refreshing immediately.
        const tokens = await client.refresh();
        if (!mounted) return;
        setAccessToken(tokens.accessToken);
        client.setAccessToken(tokens.accessToken);
        setStatus('signedIn');
      } catch {
        // If refresh fails, force sign-out (don't get stuck in a broken loop).
        await clearAllAuth();
        if (!mounted) return;
        setAccessToken(null);
        setUser(null);
        setChallengeToken(null);
        setStatus('signedOut');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [client]);

  async function configureBaseUrl(nextBaseUrl) {
    const cleaned = (nextBaseUrl ?? '').trim().replace(/\\/$/, '');
    await setBaseUrl(cleaned);
    setBaseUrlState(cleaned);
    client.setBaseUrl(cleaned);
  }

  async function signIn({ nextBaseUrl, username, password }) {
    setError(null);
    if (nextBaseUrl) {
      await configureBaseUrl(nextBaseUrl);
    }
    if (!client.baseUrl) {
      throw new Error('BMS URL is required.');
    }
    const result = await client.login({ username, password });
    if (result.twoFactorRequired) {
      setChallengeToken(result.challengeToken ?? null);
      return { twoFactorRequired: true };
    }

    const tokens = result?.result?.tokens;
    const u = result?.result?.user;
    if (!tokens?.accessToken || !tokens?.refreshToken || !u) {
      throw new Error('Invalid login response.');
    }

    await setRefreshToken(tokens.refreshToken);
    await setStoredUser(u);
    client.setAccessToken(tokens.accessToken);
    setAccessToken(tokens.accessToken);
    setUser(u);
    setChallengeToken(null);
    setStatus('signedIn');
    return { twoFactorRequired: false };
  }

  async function completeTwoFactor({ otp }) {
    setError(null);
    if (!challengeToken) throw new Error('Missing 2FA challenge token.');
    const body = await client.login2fa({ otp, challengeToken });
    const tokens = body?.tokens;
    const u = body?.user;
    if (!tokens?.accessToken || !tokens?.refreshToken || !u) {
      throw new Error('Invalid 2FA login response.');
    }
    await setRefreshToken(tokens.refreshToken);
    await setStoredUser(u);
    client.setAccessToken(tokens.accessToken);
    setAccessToken(tokens.accessToken);
    setUser(u);
    setChallengeToken(null);
    setStatus('signedIn');
  }

  async function signOut() {
    setError(null);
    await clearAllAuth();
    setAccessToken(null);
    setUser(null);
    setChallengeToken(null);
    setStatus('signedOut');
  }

  const value = {
    status,
    baseUrl,
    user,
    accessToken,
    challengeToken,
    error,
    setError,
    client,
    configureBaseUrl,
    signIn,
    completeTwoFactor,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

