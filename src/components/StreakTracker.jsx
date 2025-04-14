import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

// Fire Icon for Streak
const FireIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
  </svg>
);

// Trophy Icon for Achievements
const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
);

const StreakTracker = () => {
  const [streak, setStreak] = useState(0);
  const [heatMapData, setHeatMapData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchFoodLog = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db, "users", userId);
        const foodEntriesRef = collection(userRef, "foodEntries");
        const q = query(foodEntriesRef, orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        const entries = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            ...data,
            timestamp: data.timestamp?.toDate()
          });
        });

        // Calculate streak
        let currentStreak = 0;
        let lastDate = dayjs();
        let hasLoggedToday = false;

        for (const entry of entries) {
          const entryDate = dayjs(entry.timestamp);
          const daysDiff = lastDate.diff(entryDate, 'day');

          if (daysDiff === 0) {
            hasLoggedToday = true;
          } else if (daysDiff === 1) {
            currentStreak++;
            lastDate = entryDate;
          } else {
            break;
          }
        }

        if (hasLoggedToday) {
          currentStreak++;
        }

        setStreak(currentStreak);

        // Generate heat map data
        const heatMap = [];
        const today = dayjs();
        for (let i = 0; i < 7; i++) {
          const date = today.subtract(i, 'day');
          const hasEntry = entries.some(entry => 
            dayjs(entry.timestamp).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
          );
          heatMap.push({
            date: date.format('MMM D'),
            hasEntry
          });
        }

        setHeatMapData(heatMap.reverse());

        // Calculate achievements
        const newAchievements = [];
        if (currentStreak >= 3) newAchievements.push('3 Day Streak');
        if (currentStreak >= 7) newAchievements.push('7 Day Streak');
        if (currentStreak >= 14) newAchievements.push('2 Week Streak');
        if (currentStreak >= 30) newAchievements.push('1 Month Streak');

        setAchievements(newAchievements);
      } catch (error) {
        console.error('Error fetching food log:', error);
      }
    };

    fetchFoodLog();
  }, [auth.currentUser]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <FireIcon className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Current Streak</h3>
            <p className="text-2xl font-bold text-orange-500">{streak} days</p>
          </div>
        </div>
      </div>

      {/* Heat Map */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Weekly Activity</h4>
        <div className="flex justify-between">
          {heatMapData.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-lg ${
                  day.hasEntry ? 'bg-green-500' : 'bg-gray-100'
                }`}
              />
              <span className="text-xs text-gray-500 mt-1">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm"
              >
                <TrophyIcon className="mr-1" />
                {achievement}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakTracker; 