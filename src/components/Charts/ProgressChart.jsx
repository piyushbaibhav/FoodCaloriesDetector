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

const ProgressChart = ({ label, nutrientKey, goal }) => {
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

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative">
      {isComplete && (
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <SuccessIcon className="text-white" />
        </div>
      )}
      
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
          <ProgressIcon className="text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-800">
          {label}
        </h3>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-500">
          {formattedCurrent} / {formattedGoal} {unit}
        </div>
        <div className="text-sm font-medium" style={{ color }}>
          {percent}%
        </div>
      </div>
      
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${percent}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`
          }}
        />
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>0 {unit}</span>
        <span>{formattedGoal} {unit}</span>
      </div>
      
      {isComplete && (
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium animate-pulse">
            Goal Achieved! 🎉
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
