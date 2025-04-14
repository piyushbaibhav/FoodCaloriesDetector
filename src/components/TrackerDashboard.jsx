import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

const TrackerDashboard = () => {
  const [heatMapData, setHeatMapData] = useState([]);
  const [streak, setStreak] = useState(0);
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

        // Generate heat map data for the last year
        const heatMap = [];
        const today = dayjs();
        const weeks = 52; // 52 weeks in a year
        
        for (let week = 0; week < weeks; week++) {
          const weekData = [];
          for (let day = 0; day < 7; day++) {
            const date = today.subtract(week * 7 + day, 'day');
            const hasEntry = entries.some(entry => 
              dayjs(entry.timestamp).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
            );
            weekData.push({
              date: date.format('YYYY-MM-DD'),
              hasEntry,
              count: entries.filter(entry => 
                dayjs(entry.timestamp).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
              ).length
            });
          }
          heatMap.push(weekData);
        }

        setHeatMapData(heatMap);
      } catch (error) {
        console.error('Error fetching food log:', error);
      }
    };

    fetchFoodLog();
  }, [auth.currentUser]);

  const getColorIntensity = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    if (count === 3) return 'bg-green-600';
    return 'bg-green-800';
  };

  // Get month labels for the grid
  const getMonthLabels = () => {
    const labels = [];
    const today = dayjs();
    for (let i = 0; i < 12; i++) {
      const date = today.subtract(i, 'month');
      labels.push(date.format('MMM'));
    }
    return labels.reverse();
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Food Log Tracker</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-700">{streak} day streak</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span className="text-sm text-gray-600">No entries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-sm text-gray-600">1 entry</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-600">2 entries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-600">3 entries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-800 rounded"></div>
              <span className="text-sm text-gray-600">4+ entries</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {/* Weekday labels */}
              <div className="flex flex-col gap-1 mr-2">
                <div className="h-4"></div>
                {['Mon', 'Wed', 'Fri'].map((day) => (
                  <div key={day} className="h-4 text-xs text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-1">
                {heatMapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-4 h-4 rounded ${getColorIntensity(day.count)}`}
                        title={`${day.date}: ${day.count} entries`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Month labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500 min-w-max">
              {getMonthLabels().map((month, index) => (
                <span key={index} className="w-16 text-center">{month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerDashboard; 