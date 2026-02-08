function normalizeBaseUrl(input) {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  const withoutTrailing = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return withoutTrailing;
}

function buildUrl(baseUrl, path) {
  const base = normalizeBaseUrl(baseUrl);
  if (!base) throw new Error('BMS base URL is required.');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export class BmsClient {
  constructor({ baseUrl, getRefreshToken, setRefreshToken }) {
    this.baseUrl = baseUrl;
    this._getRefreshToken = getRefreshToken;
    this._setRefreshToken = setRefreshToken;
    this._accessToken = null;
    this._accessExpMs = null;
    this._refreshPromise = null;
  }

  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token) {
    this._accessToken = token ?? null;
    this._accessExpMs = null;
  }

  getAccessToken() {
    return this._accessToken;
  }

  getAccessExpMs() {
    return this._accessExpMs;
  }

  async login({ username, password }) {
    const res = await fetch(buildUrl(this.baseUrl, '/api/v1/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const body = await safeJson(res);
    if (res.status === 401 && body?.twoFactorRequired) {
      return { twoFactorRequired: true, challengeToken: body?.challengeToken ?? null };
    }
    if (!res.ok) {
      throw new Error(body?.message ?? 'Login failed.');
    }
    return { twoFactorRequired: false, result: body };
  }

  async login2fa({ otp, challengeToken }) {
    const res = await fetch(buildUrl(this.baseUrl, '/api/v1/auth/login/2fa'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, challengeToken }),
    });
    const body = await safeJson(res);
    if (!res.ok) {
      throw new Error(body?.message ?? 'Two-factor login failed.');
    }
    return body;
  }

  async refresh() {
    // Single-flight refresh to avoid refresh token reuse.
    if (this._refreshPromise) return this._refreshPromise;

    this._refreshPromise = (async () => {
      const refreshToken = await this._getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token.');
      }

      const res = await fetch(buildUrl(this.baseUrl, '/api/v1/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const body = await safeJson(res);
      if (!res.ok) {
        throw new Error(body?.message ?? 'Refresh failed.');
      }

      const nextAccess = body?.tokens?.accessToken ?? null;
      const nextRefresh = body?.tokens?.refreshToken ?? null;
      if (!nextAccess || !nextRefresh) {
        throw new Error('Invalid refresh response.');
      }
      await this._setRefreshToken(nextRefresh);
      this.setAccessToken(nextAccess);
      return { accessToken: nextAccess, refreshToken: nextRefresh };
    })();

    try {
      return await this._refreshPromise;
    } finally {
      this._refreshPromise = null;
    }
  }

  async fetchJson(path, options = {}) {
    const url = buildUrl(this.baseUrl, path);
    const headers = { ...(options.headers ?? {}) };

    if (this._accessToken) {
      headers.Authorization = `Bearer ${this._accessToken}`;
    }

    let res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // One retry after refresh.
      await this.refresh();
      const retryHeaders = { ...(headers ?? {}), Authorization: `Bearer ${this._accessToken}` };
      res = await fetch(url, { ...options, headers: retryHeaders });
    }

    const body = await safeJson(res);
    if (!res.ok) {
      const msg = body?.message ?? `Request failed (${res.status}).`;
      throw new Error(msg);
    }
    return body;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
