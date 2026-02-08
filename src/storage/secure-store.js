import * as SecureStore from 'expo-secure-store';

const KEYS = {
  baseUrl: 'bmr.baseUrl',
  refreshToken: 'bmr.refreshToken',
  user: 'bmr.user',
};

export async function getBaseUrl() {
  return (await SecureStore.getItemAsync(KEYS.baseUrl)) ?? null;
}

export async function setBaseUrl(url) {
  if (!url) {
    await SecureStore.deleteItemAsync(KEYS.baseUrl);
    return;
  }
  await SecureStore.setItemAsync(KEYS.baseUrl, url);
}

export async function getRefreshToken() {
  return (await SecureStore.getItemAsync(KEYS.refreshToken)) ?? null;
}

export async function setRefreshToken(token) {
  if (!token) {
    await SecureStore.deleteItemAsync(KEYS.refreshToken);
    return;
  }
  await SecureStore.setItemAsync(KEYS.refreshToken, token);
}

export async function getStoredUser() {
  const raw = await SecureStore.getItemAsync(KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setStoredUser(user) {
  if (!user) {
    await SecureStore.deleteItemAsync(KEYS.user);
    return;
  }
  await SecureStore.setItemAsync(KEYS.user, JSON.stringify(user));
}

export async function clearAllAuth() {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.refreshToken),
    SecureStore.deleteItemAsync(KEYS.user),
  ]);
}

