import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';
import { useDarkMode } from '../context/DarkModeContext';

const FoodLog = () => {
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const auth = getAuth();
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

  const handleDelete = async (entryId, date) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const entryRef = doc(db, "users", userId, "foodEntries", entryId);
      await deleteDoc(entryRef);

      // Update local state
      setFoodEntries(prev => {
        const newEntries = { ...prev };
        newEntries[date] = newEntries[date].filter(entry => entry.id !== entryId);
        if (newEntries[date].length === 0) {
          delete newEntries[date];
        }
        return newEntries;
      });
    } catch (error) {
      console.error('Error deleting food entry:', error);
    }
  };

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-green-400' : 'border-green-600'}`}></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-0">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'} mb-6`}>Food Log</h2>
      </div>
      {Object.keys(foodEntries).length === 0 ? (
        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} py-8`}>
          No food entries found. Start adding your meals!
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="space-y-6">
            {Object.entries(foodEntries).map(([date, entries]) => (
              <div key={date} className={`rounded-lg shadow-md p-4 ${isDarkMode ? 'bg-dark-card border border-gray-700' : 'bg-white border border-gray-100'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>{date}</h3>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'bg-dark-input hover:bg-gray-700 border border-gray-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                      }`}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{entry.foodName}</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {dayjs(entry.timestamp).format('h:mm A')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {entry.nutrition.calories} calories
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {entry.quantity}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id, date);
                          }}
                          className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Details Modal */}
      {showModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg p-6 max-w-md w-full ${isDarkMode ? 'bg-dark-card border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEntry.foodName}</h3>
              <button
                onClick={() => setShowModal(false)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Calories</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{selectedEntry.nutrition.calories} kcal</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Protein</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEntry.nutrition.protein}g</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fat</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEntry.nutrition.fat}g</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carbs</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEntry.nutrition.carbs}g</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fiber</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEntry.nutrition.fiber}g</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quantity</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEntry.quantity}</p>
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
                Added on {dayjs(selectedEntry.timestamp).format('MMM D, YYYY h:mm A')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLog; 