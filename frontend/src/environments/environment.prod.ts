export const environment = {
  production: true,
  // Mismo origen: Vercel reenvía /api/* al backend de Railway (ver vercel.json).
  // Esto evita problemas de cookies SameSite entre dominios y de CORS.
  apiUrl: '/api',
  firebase: {
    apiKey: 'AIzaSyAb82mhrjNT7bKAgeVNqklYUantaxAJTjw',
    authDomain: 'diapptrack.firebaseapp.com',
    projectId: 'diapptrack',
    storageBucket: 'diapptrack.firebasestorage.app',
    messagingSenderId: '760248063746',
    appId: '1:760248063746:web:9be63fe1e9aaf3ca24541b',
    vapidKey: 'BIzG095N6yWcJjkpXgXkbSPzaf6vfe8f62AZvqTt5180KFp9AYXQuLFs3lXnHTdpKWsTZTk5RC7Uh08m7rwXIb4'
  }
};
