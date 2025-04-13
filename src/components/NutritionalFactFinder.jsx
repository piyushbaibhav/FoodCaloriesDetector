import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getNutritionalFacts } from '../api/nutrition-facts';

const NutritionalFactFinder = () => {
  const [foodName, setFoodName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Direct call to Gemini API through our utility function
      const data = await getNutritionalFacts(foodName);
      setResult(data);

      // Save to Firestore if user is logged in
      if (user) {
        const timestamp = new Date();
        const foodEntryRef = doc(db, 'users', user.uid, 'foodEntries', timestamp.toISOString());
        
        await setDoc(foodEntryRef, {
          foodName,
          timestamp,
          nutritionInfo: data.nutritionInfo,
          quantity: '100', // Default to 100g
          image: '',
        });
      }
    } catch (err) {
      console.error('Error fetching nutritional facts:', err);
      setError('Failed to fetch nutritional information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center text-rose-700 mb-6">
        🔍 Nutritional Fact Finder
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="Enter a food item (e.g., apple, chicken breast)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors disabled:bg-rose-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-rose-700 mb-4">
            {result.foodName}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Nutritional Information</h4>
              <p className="text-gray-700 mb-4">{result.nutritionInfo}</p>
              
              <h4 className="font-medium text-gray-800 mb-2">Health Benefits</h4>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {result.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Potential Concerns</h4>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {result.concerns.map((concern, index) => (
                  <li key={index}>{concern}</li>
                ))}
              </ul>
              
              <h4 className="font-medium text-gray-800 mb-2">Recommended Consumption</h4>
              <p className="text-gray-700 mb-4">{result.recommendation}</p>
              
              <h4 className="font-medium text-gray-800 mb-2">Overall Assessment</h4>
              <p className="text-gray-700">{result.assessment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionalFactFinder; 