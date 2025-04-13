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

const ProgressChart = ({ label, nutrientKey, goal }) => {
  const [current, setCurrent] = useState(0);

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
      }
    });
  }, [nutrientKey]);

  const percent = Math.min((current / goal) * 100, 100).toFixed(1);

  return (
    <div className="mb-4">
      <h3 className="font-semibold">
        {label}: {Math.round(current)} / {goal}
      </h3>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressChart;
