// Firebase Cloud Messaging service worker.
//
// This file MUST live at this exact path (frontend/public/firebase-messaging-sw.js
// so it's served from the site root) for push notifications to work at all —
// that's a Firebase requirement, not a Celebro one.
//
// Fill in the same values you put in frontend/.env below. Service workers
// can't read Vite env vars, so these have to be hardcoded here — that's
// normal for Firebase web push, not a security issue, since this is
// public client-side config, not a secret.

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "Celebro", {
    body: body || "You have a new notification.",
    icon: "/favicon.ico",
  });
});
