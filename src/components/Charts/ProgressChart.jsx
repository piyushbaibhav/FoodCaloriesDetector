import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { useDarkMode } from "../../context/DarkModeContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// Progress Icon Component
const ProgressIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 20c4.41 0 8-3.59 8-8s-3.59-8-8-8v8l-4-4 4-4v8c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>
  </svg>
);

// Success Checkmark Icon
const SuccessIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);

// Custom tooltip for progress chart
const CustomTooltip = ({ active, payload, label }) => {
  const { isDarkMode } = useDarkMode();
  
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-dark-chart-tooltip-bg text-dark-chart-tooltip-text border border-dark-chart-tooltip-border' : 'bg-white text-gray-800 border border-gray-200'}`}>
        <p className="font-semibold">{label}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          Progress: {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const ProgressChart = ({ label, nutrientKey, goal }) => {
  const { isDarkMode } = useDarkMode();
  const [current, setCurrent] = useState(0);
  const [color, setColor] = useState("#10b981"); // Default green
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = Timestamp.fromDate(today);

        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        const end = Timestamp.fromDate(tomorrow);

        const q = query(
          collection(db, "users", user.uid, "foodEntries"),
          where("timestamp", ">=", start),
          where("timestamp", "<", end)
        );

        const snapshot = await getDocs(q);
        let total = 0;

        snapshot.forEach((doc) => {
          const info = doc.data().nutritionInfo;
          const match = info.match(new RegExp(`${nutrientKey}:\\s*([\\d.]+)`, "i"));
          if (match) {
            total += parseFloat(match[1]);
          }
        });

        setCurrent(total);
        
        // Set color based on progress percentage
        const percentage = (total / goal) * 100;
        if (percentage < 30) {
          setColor("#10b981"); // Green for low consumption
        } else if (percentage < 70) {
          setColor("#f59e0b"); // Yellow for medium consumption
        } else if (percentage < 100) {
          setColor("#f97316"); // Orange for high consumption
        } else {
          setColor("#10b981"); // Green for completed
          setShowSuccess(true);
        }
      }
    });
  }, [nutrientKey, goal]);

  const percent = Math.min((current / goal) * 100, 100).toFixed(1);
  const unit = nutrientKey === "calories" ? "kcal" : "g";
  const formattedCurrent = nutrientKey === "calories" ? Math.round(current) : current.toFixed(1);
  const formattedGoal = nutrientKey === "calories" ? Math.round(goal) : goal.toFixed(1);
  const isComplete = percent >= 100;

  const data = [
    { name: "Mon", progress: 75 },
    { name: "Tue", progress: 85 },
    { name: "Wed", progress: 65 },
    { name: "Thu", progress: 90 },
    { name: "Fri", progress: 80 },
    { name: "Sat", progress: 70 },
    { name: "Sun", progress: 95 },
  ];

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4">
        {label} Progress
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? "#404040" : "#e5e7eb"} 
            />
            <XAxis 
              dataKey="name" 
              stroke={isDarkMode ? "#e5e5e5" : "#333333"} 
            />
            <YAxis 
              stroke={isDarkMode ? "#e5e5e5" : "#333333"} 
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="progress" 
              fill={isDarkMode ? "#4a9eff" : "#3b82f6"} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
