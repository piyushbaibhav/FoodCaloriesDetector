import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

const FoodLog = () => {
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

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
    const fetchFoodEntries = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Query the user's foodEntries subcollection
        const userRef = doc(db, "users", userId);
        const foodEntriesRef = collection(userRef, "foodEntries");
        const q = query(foodEntriesRef, orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        const entries = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nutrition = extractNutrients(data.nutritionInfo);
          
          entries.push({
            id: doc.id,
            ...data,
            nutrition,
            timestamp: data.timestamp?.toDate()
          });
        });

        // Group entries by date
        const groupedEntries = entries.reduce((acc, entry) => {
          const date = dayjs(entry.timestamp).format('MM/DD/YYYY');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(entry);
          return acc;
        }, {});

        setFoodEntries(groupedEntries);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching food entries:', error);
        setLoading(false);
      }
    };

    fetchFoodEntries();
  }, [auth.currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Food Log</h2>
      </div>
      {Object.keys(foodEntries).length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          No food entries found. Start adding your meals!
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="space-y-6">
            {Object.entries(foodEntries).map(([date, entries]) => (
              <div key={date} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">{date}</h3>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-800">{entry.foodName}</h4>
                        <p className="text-sm text-gray-600">
                          {dayjs(entry.timestamp).format('h:mm A')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {entry.nutrition.calories} calories
                        </p>
                        <p className="text-sm text-gray-600">
                          {entry.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLog; 