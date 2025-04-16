importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBgzGflErXB61oSlYHHyErb3Y6Sys3iRU8",
  authDomain: "foodcalorie-563bf.firebaseapp.com",
  projectId: "foodcalorie-563bf",
  storageBucket: "foodcalorie-563bf.firebasestorage.app",
  messagingSenderId: "834401162247",
  appId: "1:834401162247:web:77a55a0dc6208640f5c6a2",
  measurementId: "G-EQQV7HTREG"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error('Error initializing Firebase in service worker:', error);
} 