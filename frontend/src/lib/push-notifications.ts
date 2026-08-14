import { apiClient } from "./api-client";

/**
 * Push notifications via Firebase Cloud Messaging.
 *
 * This is entirely optional and does nothing unless you set up your own
 * Firebase project and provide these env vars in frontend/.env:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_VAPID_KEY
 *
 * Firebase's SDK is loaded via CDN <script> tags (same pattern as the
 * Razorpay checkout widget elsewhere in this app), not npm — so no
 * `npm install` is needed for this to be present in the bundle; it's
 * simply unused until you provide the env vars above.
 *
 * You'll also need to fill in frontend/public/firebase-messaging-sw.js
 * with the same config before this can actually receive pushes.
 */

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  if (!apiKey || !projectId || !messagingSenderId || !appId || !vapidKey) {
    return null; // not configured — caller should no-op
  }
  return { apiKey, projectId, messagingSenderId, appId, vapidKey };
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export async function initPushNotifications() {
  const config = getFirebaseConfig();
  if (!config) return; // silently do nothing — no Firebase project configured

  try {
    await loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

    const firebase = (window as any).firebase;
    if (!firebase) return;

    if (!firebase.apps?.length) {
      firebase.initializeApp({
        apiKey: config.apiKey,
        projectId: config.projectId,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    }

    const messaging = firebase.messaging();
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await messaging.getToken({
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await apiClient.post("/notifications/register-device/", { token });
    }
  } catch {
    // Push notifications are a nice-to-have — never let setup failures
    // affect the rest of the app.
  }
}
