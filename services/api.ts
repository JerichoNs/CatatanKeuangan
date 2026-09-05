import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUBLIC_URL_KEY = '@catatan_public_api_url';
const ADMIN_URL_KEY = '@catatan_admin_api_url';
const TOKEN_KEY = '@catatan_keuangan_token';

// Default URL: pada web gunakan localhost, pada device fisik gunakan IP LAN
export const DEFAULT_LAN_IP = '192.168.1.6';

export const DEFAULT_PUBLIC_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8000/api'
    : `http://${DEFAULT_LAN_IP}:8000/api`;

export const DEFAULT_ADMIN_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8001/api'
    : `http://${DEFAULT_LAN_IP}:8001/api`;

let currentPublicUrl = DEFAULT_PUBLIC_URL;
let currentAdminUrl = DEFAULT_ADMIN_URL;

// Muat URL tersimpan saat modul dimuat
(async () => {
  try {
    const [savedPublic, savedAdmin] = await Promise.all([
      AsyncStorage.getItem(PUBLIC_URL_KEY),
      AsyncStorage.getItem(ADMIN_URL_KEY),
    ]);
    if (savedPublic) currentPublicUrl = savedPublic;
    if (savedAdmin) currentAdminUrl = savedAdmin;
  } catch {
    // Gunakan default
  }
})();

export async function getApiUrls() {
  try {
    const [savedPublic, savedAdmin] = await Promise.all([
      AsyncStorage.getItem(PUBLIC_URL_KEY),
      AsyncStorage.getItem(ADMIN_URL_KEY),
    ]);
    return {
      publicUrl: savedPublic || currentPublicUrl,
      adminUrl: savedAdmin || currentAdminUrl,
    };
  } catch {
    return {
      publicUrl: currentPublicUrl,
      adminUrl: currentAdminUrl,
    };
  }
}

export async function setApiUrls(publicUrl: string, adminUrl: string) {
  const cleanPublic = publicUrl.trim().replace(/\/+$/, '');
  const cleanAdmin = adminUrl.trim().replace(/\/+$/, '');

  currentPublicUrl = cleanPublic;
  currentAdminUrl = cleanAdmin;

  await Promise.all([
    AsyncStorage.setItem(PUBLIC_URL_KEY, cleanPublic),
    AsyncStorage.setItem(ADMIN_URL_KEY, cleanAdmin),
  ]);
}

// Helper untuk mengetes apakah URL server bisa dihubungi
export async function testConnection(baseUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/auth/login`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.status > 0;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

// --- Token helpers ----------------------------------------------------------
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// --- HTTP client utama ------------------------------------------------------
async function request<T>(
  method: string,
  path: string,
  body?: object,
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Pilih base URL: Jika request ke admin (/admin/*), pakai currentAdminUrl, selain itu currentPublicUrl
  const baseUrl = path.startsWith('/admin') ? currentAdminUrl : currentPublicUrl;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000); // 15s timeout

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(
        err.message ?? `HTTP ${res.status}`,
        res.status,
        err.errors
      );
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new ApiError('Request timeout — cek koneksi internet atau IP server kamu.', 0);
    }
    throw e;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Shorthand helpers ------------------------------------------------------
export const api = {
  get: <T>(path: string, auth = true) => request<T>('GET', path, undefined, auth),
  post: <T>(path: string, body: object, auth = true) => request<T>('POST', path, body, auth),
  put: <T>(path: string, body: object, auth = true) => request<T>('PUT', path, body, auth),
  delete: <T>(path: string, auth = true) => request<T>('DELETE', path, undefined, auth),
};
