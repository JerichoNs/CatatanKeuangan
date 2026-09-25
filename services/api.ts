import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUBLIC_URL_KEY = '@catatan_public_api_url';
const ADMIN_URL_KEY = '@catatan_admin_api_url';
const TOKEN_KEY = '@catatan_keuangan_token';

// Default URL: Railway production backend
export const DEFAULT_LAN_IP = '192.168.1.6';
export const RAILWAY_API_URL = 'https://catatan-keuangan-api-production.up.railway.app/api';

export const DEFAULT_PUBLIC_URL =
  Platform.OS === 'web'
    ? RAILWAY_API_URL
    : RAILWAY_API_URL;

export const DEFAULT_ADMIN_URL =
  Platform.OS === 'web'
    ? RAILWAY_API_URL
    : RAILWAY_API_URL;

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

  // Intercept untuk Demo Mode (Rekap.id / FintechX)
  const token = requiresAuth ? await getToken() : null;
  if (token && (token.startsWith('demo_') || token === 'demo_fintechx_token' || token === 'demo_rekap_token')) {
    return handleDemoRequest<T>(method, path, body);
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
    if (e instanceof ApiError) {
      throw e;
    }
    // Tangani network failure, connection refused, CORS, atau server mati
    throw new ApiError(
      'Tidak dapat terhubung ke server (Port 8000). Pastikan server backend sudah dijalankan.',
      0
    );
  }
}

function toDemoDate(daysAgo = 0): string {
  const d = new Date(Date.now() - 86400000 * daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Memory store untuk Demo Rekap.id
let demoStorage: any[] = [
  {
    id: 'tx-1',
    userId: 'demo-user-rekap',
    type: 'income',
    amount: 18500000,
    category: 'Gaji',
    note: 'Gaji Bulanan & Tunjangan Operasional',
    pocket: 'simpanan_pertama',
    date: toDemoDate(1),
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tx-2',
    userId: 'demo-user-rekap',
    type: 'income',
    amount: 6200000,
    category: 'Investasi',
    note: 'Dividen Portofolio Saham & Reksadana [Nabung]',
    pocket: 'pocket_nabung',
    date: toDemoDate(2),
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-3',
    userId: 'demo-user-rekap',
    type: 'expense',
    amount: 3200000,
    category: 'Belanja',
    note: 'Belanja Bulanan & Kebutuhan Rumah',
    pocket: 'simpanan_pertama',
    date: toDemoDate(2),
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-4',
    userId: 'demo-user-rekap',
    type: 'expense',
    amount: 1450000,
    category: 'Makanan',
    note: 'Dining Kuliner & Coffee Workspace',
    pocket: 'simpanan_pertama',
    date: toDemoDate(3),
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'tx-5',
    userId: 'demo-user-rekap',
    type: 'income',
    amount: 4500000,
    category: 'Bonus',
    note: 'Project Freelance Web App [Nabung]',
    pocket: 'pocket_nabung',
    date: toDemoDate(4),
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'tx-6',
    userId: 'demo-user-rekap',
    type: 'expense',
    amount: 850000,
    category: 'Tagihan',
    note: 'Listrik PLN, WiFi, & Air',
    pocket: 'simpanan_pertama',
    date: toDemoDate(5),
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'tx-7',
    userId: 'demo-user-rekap',
    type: 'expense',
    amount: 650000,
    category: 'Transportasi',
    note: 'Bensin & Saldo E-Toll',
    pocket: 'simpanan_pertama',
    date: toDemoDate(6),
    createdAt: Date.now() - 86400000 * 6,
  },
];

async function handleDemoRequest<T>(method: string, path: string, body?: any): Promise<T> {
  // Latency responsif 80ms
  await new Promise((r) => setTimeout(r, 80));

  if (path === '/transactions') {
    if (method === 'GET') {
      return [...demoStorage] as T;
    }
    if (method === 'POST') {
      const newTx = {
        id: `demo-${Date.now()}`,
        userId: 'demo-user-rekap',
        ...body,
        createdAt: Date.now(),
      };
      demoStorage = [newTx, ...demoStorage];
      return newTx as T;
    }
  }

  if (path === '/transactions/reset/all' || (path.startsWith('/transactions/') && path.includes('reset'))) {
    demoStorage = [];
    return { message: 'Reset transaksi berhasil' } as T;
  }

  if (path.startsWith('/transactions/')) {
    const id = path.replace('/transactions/', '');
    if (method === 'DELETE') {
      demoStorage = demoStorage.filter((t) => t.id !== id);
      return undefined as T;
    }
    if (method === 'GET') {
      const item = demoStorage.find((t) => t.id === id);
      return (item || {}) as T;
    }
    if (method === 'PUT') {
      demoStorage = demoStorage.map((t) => (t.id === id ? { ...t, ...body } : t));
      const updated = demoStorage.find((t) => t.id === id);
      return (updated || body) as T;
    }
  }

  if (path === '/auth/logout') {
    return {} as T;
  }

  return {} as T;
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
