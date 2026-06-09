// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Configurar con los datos reales del proyecto Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyAb82mhrjNT7bKAgeVNqklYUantaxAJTjw',
    authDomain: 'diapptrack.firebaseapp.com',
    projectId: 'diapptrack',
    storageBucket: 'diapptrack.firebasestorage.app',
    messagingSenderId: '760248063746',
    appId: '1:760248063746:web:9be63fe1e9aaf3ca24541b'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png'
  });
});
