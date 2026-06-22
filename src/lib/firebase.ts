import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: 'AIzaSyBQL_RnE6MSZFO07LBL9__FSbGOPZk_wK4',
  authDomain: 'meoo-tech.firebaseapp.com',
  projectId: 'meoo-tech',
  storageBucket: 'meoo-tech.firebasestorage.app',
  messagingSenderId: '632657114689',
  appId: '1:632657114689:web:ac8fe713b915b2d34f38c0',
};

export const VAPID_KEY =
  'BLa_ClIaue6oLefN3TeFTbLHhpof9JsM8Vv7ohOZrFDyZuwxBdI4OgUulsk7wCUs8gMkuS5lN-6Xn6WKnJxnyU8';

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export async function getMessagingIfSupported(): Promise<Messaging | null> {
  try {
    if (!(await isSupported())) return null;
    return getMessaging(firebaseApp);
  } catch {
    return null;
  }
}
