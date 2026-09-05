import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
// getReactNativePersistence ada & jalan normal di runtime (Metro resolve ke bundle
// RN-nya firebase), tapi type declaration Firebase belum expose ini dengan benar -
// ini known issue lama di firebase-js-sdk, bukan salah kode kita. @ts-ignore aman dipakai di sini.
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Config project Firebase "MoneyPlan" (Project Settings > General > Your apps).
const firebaseConfig = {
  apiKey: 'AIzaSyCLFSlgYcw2VqvG0MOgbRxLZIRAzsBrdBQ',
  authDomain: 'moneyplan-3c620.firebaseapp.com',
  projectId: 'moneyplan-3c620',
  storageBucket: 'moneyplan-3c620.firebasestorage.app',
  messagingSenderId: '583798201543',
  appId: '1:583798201543:web:546c7300f75e69a0b4b2e2',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Web pakai persistence browser bawaan. iOS/Android perlu didorong ke
// AsyncStorage biar sesi login nggak hilang tiap kali app ditutup.
export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);

export default app;
