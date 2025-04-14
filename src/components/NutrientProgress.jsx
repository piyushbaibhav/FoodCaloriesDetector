import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';
import { useDarkMode } from '../context/DarkModeContext';

// Custom SVG Icons
const ProgressIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 20c4.41 0 8-3.59 8-8s-3.59-8-8-8v8l-4-4 4-4v8c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);

const NutrientProgress = () => {
  const [goals, setGoals] = useState(null);
  const [nutrientData, setNutrientData] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });
  const auth = getAuth();
  const user = auth.currentUser;
  const { isDarkMode } = useDarkMode();

  const extractNutrients = (nutritionInfo) => {
    if (!nutritionInfo || typeof nutritionInfo !== "string") {
      return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
    }

    const nutritionRegex =
      /Calories:\s*(\d+)\s*kcal\s*Protein:\s*([\d.]+)\s*g\s*Fat:\s*([\d.]+)\s*g\s*Carbohydrates:\s*([\d.]+)\s*g\s*Fiber:\s*([\d.]+)\s*g/;
    const match = nutritionInfo.match(nutritionRegex);

    if (match) {
      return {
        calories: parseInt(match[1], 10),
        protein: parseFloat(match[2]),
        fat: parseFloat(match[3]),
        carbs: parseFloat(match[4]),
        fiber: parseFloat(match[5]),
      };
    }

    return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
  };

  useEffect(() => {
    if (!user) return;

    const todayKey = new Date().toISOString().split('T')[0];
    
    const goalsUnsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'dailyGoals', todayKey),
      (doc) => {
        if (doc.exists()) {
          setGoals(doc.data());
        }
      }
    );

    const fetchData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const foodEntriesRef = collection(userRef, "foodEntries");
        const q = query(foodEntriesRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        let totalNutrients = {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
        };

        const today = dayjs().startOf("day");

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.();

          if (timestamp && dayjs(timestamp).isAfter(today)) {
            const nutrition = extractNutrients(data.nutritionInfo);
            totalNutrients.calories += nutrition.calories;
            totalNutrients.protein += nutrition.protein;
            totalNutrients.fat += nutrition.fat;
            totalNutrients.carbs += nutrition.carbs;
            totalNutrients.fiber += nutrition.fiber;
          }
        });

        setNutrientData({
          calories: Number(totalNutrients.calories.toFixed(1)),
          protein: Number(totalNutrients.protein.toFixed(1)),
          fat: Number(totalNutrients.fat.toFixed(1)),
          carbs: Number(totalNutrients.carbs.toFixed(1)),
          fiber: Number(totalNutrients.fiber.toFixed(1)),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const userRef = doc(db, "users", user.uid);
    const foodEntriesRef = collection(userRef, "foodEntries");
    const q = query(
      foodEntriesRef,
      orderBy("timestamp", "desc")
    );
    
    const unsubscribe = onSnapshot(q, () => {
      fetchData();
    });

    return () => {
      goalsUnsubscribe();
      unsubscribe();
    };
  }, [user]);

  if (!goals || !nutrientData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getGradientColor = (percentage) => {
    if (percentage >= 100) return '#10b981'; // Green for completed
    return `url(#gradient-${Math.min(Math.floor(percentage / 10) * 10, 90)})`;
  };

  const nutrients = [
    { name: 'Carbs', consumed: nutrientData.carbs, goal: goals.carbs, unit: 'g', icon: '🍞' },
    { name: 'Protein', consumed: nutrientData.protein, goal: goals.protein, unit: 'g', icon: '🍗' },
    { name: 'Fat', consumed: nutrientData.fat, goal: goals.fat, unit: 'g', icon: '🥑' },
    { name: 'Calories', consumed: nutrientData.calories, goal: goals.calories, unit: 'kcal', icon: '🔥' },
  ];

  return (
    <div className={`${isDarkMode ? 'bg-dark-card' : 'bg-white'} p-6 rounded-xl shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
      {/* SVG Gradients for circular progress */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#10b981" : "#10b981"} />
            <stop offset="100%" stopColor={isDarkMode ? "#10b981" : "#10b981"} />
          </linearGradient>
          <linearGradient id="gradient-10" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#10b981" : "#10b981"} />
            <stop offset="100%" stopColor={isDarkMode ? "#34d399" : "#34d399"} />
          </linearGradient>
          <linearGradient id="gradient-20" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#34d399" : "#34d399"} />
            <stop offset="100%" stopColor={isDarkMode ? "#6ee7b7" : "#6ee7b7"} />
          </linearGradient>
          <linearGradient id="gradient-30" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#6ee7b7" : "#6ee7b7"} />
            <stop offset="100%" stopColor={isDarkMode ? "#a7f3d0" : "#a7f3d0"} />
          </linearGradient>
          <linearGradient id="gradient-40" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#a7f3d0" : "#a7f3d0"} />
            <stop offset="100%" stopColor={isDarkMode ? "#f59e0b" : "#f59e0b"} />
          </linearGradient>
          <linearGradient id="gradient-50" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#f59e0b" : "#f59e0b"} />
            <stop offset="100%" stopColor={isDarkMode ? "#fbbf24" : "#fbbf24"} />
          </linearGradient>
          <linearGradient id="gradient-60" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#fbbf24" : "#fbbf24"} />
            <stop offset="100%" stopColor={isDarkMode ? "#fcd34d" : "#fcd34d"} />
          </linearGradient>
          <linearGradient id="gradient-70" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#fcd34d" : "#fcd34d"} />
            <stop offset="100%" stopColor={isDarkMode ? "#f97316" : "#f97316"} />
          </linearGradient>
          <linearGradient id="gradient-80" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#f97316" : "#f97316"} />
            <stop offset="100%" stopColor={isDarkMode ? "#fb923c" : "#fb923c"} />
          </linearGradient>
          <linearGradient id="gradient-90" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#fb923c" : "#fb923c"} />
            <stop offset="100%" stopColor={isDarkMode ? "#fdba74" : "#fdba74"} />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center mb-8">
        <div className={`w-10 h-10 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-lg flex items-center justify-center mr-4`}>
          <ProgressIcon className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
        </div>
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>Daily Nutrient Progress</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track your nutrition goals achievement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {nutrients.map((nutrient) => {
          const percentage = Math.min((nutrient.consumed / nutrient.goal) * 100, 100).toFixed(1);
          const isComplete = percentage >= 100;
          const pathColor = getGradientColor(percentage);

          return (
            <div key={nutrient.name} className="flex flex-col items-center">
              <div className="w-full max-w-[180px] mb-3">
                <CircularProgressbar
                  value={percentage}
                  text={`${percentage}%`}
                  styles={buildStyles({
                    pathColor: pathColor,
                    textColor: isDarkMode ? '#e5e7eb' : '#1f2937',
                    trailColor: isDarkMode ? '#374151' : '#f3f4f6',
                    textSize: '16px',
                    pathTransitionDuration: 0.5,
                    pathTransition: 'stroke-dashoffset 0.5s ease 0s',
                  })}
                />
              </div>
              
              <div className="text-center w-full">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-lg mr-2">{nutrient.icon}</span>
                  <h3 className={`font-medium ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>{nutrient.name}</h3>
                  {isComplete && (
                    <span className="ml-2">
                      <SuccessIcon className={isDarkMode ? 'text-green-400' : 'text-green-500'} />
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  {nutrient.consumed.toFixed(1)} / {nutrient.goal}{nutrient.unit}
                </p>
                <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-1.5`}>
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${percentage}%`,
                      background: pathColor
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${isDarkMode ? 'from-green-500 to-green-600' : 'from-green-400 to-green-600'} mr-2`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Low (0-30%)</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${isDarkMode ? 'from-yellow-500 to-yellow-600' : 'from-yellow-400 to-yellow-600'} mr-2`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Moderate (30-70%)</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${isDarkMode ? 'from-orange-500 to-orange-600' : 'from-orange-400 to-orange-600'} mr-2`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>High (70-100%)</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'} mr-2`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Goal Achieved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientProgress;