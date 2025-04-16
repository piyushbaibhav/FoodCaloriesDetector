import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgzGflErXB61oSlYHHyErb3Y6Sys3iRU8",
  authDomain: "foodcalorie-563bf.firebaseapp.com",
  projectId: "foodcalorie-563bf",
  storageBucket: "foodcalorie-563bf.firebasestorage.app",
  messagingSenderId: "834401162247",
  appId: "1:834401162247:web:77a55a0dc6208640f5c6a2",
  measurementId: "G-EQQV7HTREG"
};

const app = initializeApp(firebaseConfig);
let messaging;

// Check if browser supports Firebase Messaging
if ('Notification' in window && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Firebase Messaging is not supported:', error);
  }
}

const auth = getAuth(app);
const db = getFirestore(app);

// Request permission for notifications
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.log('Firebase Messaging is not supported in this browser.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BKfvXz3rstcsKeRhh4k4VV48jg4RU5Azuqoryir_NXBEu680FeCzdkTNWiYBy0EeaLiFJBCelTjMpKiSeVKJiyk'
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Handle incoming messages when app is in foreground
export const onMessageListener = () => {
  if (!messaging) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

// Check if user has logged meals for specific time periods
export const checkMealLogs = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const mealsRef = collection(db, 'meals');
  const q = query(mealsRef, 
    where('userId', '==', user.uid),
    where('date', '>=', today)
  );

  const querySnapshot = await getDocs(q);
  const meals = querySnapshot.docs.map(doc => doc.data());

  const currentHour = now.getHours();
  
  // Check breakfast (before 12 PM)
  if (currentHour < 12) {
    const hasBreakfast = meals.some(meal => 
      meal.mealType === 'breakfast' && 
      new Date(meal.date).getDate() === today.getDate()
    );
    if (!hasBreakfast) {
      sendNotification('Breakfast Reminder', 'Don\'t forget to log your breakfast!');
    }
  }
  
  // Check lunch (between 12 PM and 4 PM)
  if (currentHour >= 12 && currentHour < 16) {
    const hasLunch = meals.some(meal => 
      meal.mealType === 'lunch' && 
      new Date(meal.date).getDate() === today.getDate()
    );
    if (!hasLunch) {
      sendNotification('Lunch Reminder', 'Time to log your lunch!');
    }
  }
  
  // Check dinner (after 6 PM)
  if (currentHour >= 18) {
    const hasDinner = meals.some(meal => 
      meal.mealType === 'dinner' && 
      new Date(meal.date).getDate() === today.getDate()
    );
    if (!hasDinner) {
      sendNotification('Dinner Reminder', 'Remember to log your dinner!');
    }
  }
};

// Send notification
const sendNotification = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/logo192.png'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
};

// Start periodic checks
export const startMealReminders = () => {
  if (!messaging) {
    console.log('Firebase Messaging is not supported in this browser.');
    return;
  }

  // Check every hour
  setInterval(checkMealLogs, 60 * 60 * 1000);
  // Initial check
  checkMealLogs();
}; 