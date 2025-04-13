import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getNutritionalFacts } from '../api/nutrition-facts';

// Custom SVG Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const NutritionIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
  </svg>
);

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
      const data = await getNutritionalFacts(foodName);
      setResult(data);

      if (user) {
        const timestamp = new Date();
        const foodEntryRef = doc(db, 'users', user.uid, 'foodEntries', timestamp.toISOString());
        
        await setDoc(foodEntryRef, {
          foodName,
          timestamp,
          nutritionInfo: data.nutritionInfo,
          quantity: '100',
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
    <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-rose-100 relative">
      {/* Decorative background elements */}
      <div className="absolute -z-10 inset-0 overflow-hidden opacity-10">
        <svg className="absolute top-1/4 left-1/4 w-40 h-40" viewBox="0 0 24 24" fill="#f43f5e">
          <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
        </svg>
        <svg className="absolute bottom-1/4 right-1/4 w-32 h-32" viewBox="0 0 24 24" fill="#f43f5e">
          <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
        </svg>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
          <NutritionIcon className="text-rose-600" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Nutritional <span className="text-rose-600">Fact Finder</span>
        </h2>
        <p className="text-gray-500 mt-2 text-center">
          Discover detailed nutrition information for any food
        </p>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400" />
          </div>
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="Search for a food (e.g., banana, salmon, quinoa)"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-0 top-0 h-full px-6 bg-rose-600 text-white rounded-r-lg hover:bg-rose-700 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="bg-rose-50/50 p-6 rounded-lg border border-rose-100">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-rose-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800">
              {result.foodName}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-rose-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <h4 className="font-medium text-gray-800">Nutritional Information</h4>
              </div>
              <p className="text-gray-700 mb-6">{result.nutritionInfo}</p>
              
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-rose-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="font-medium text-gray-800">Health Benefits</h4>
              </div>
              <ul className="space-y-2 text-gray-700">
                {result.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-rose-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-rose-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <h4 className="font-medium text-gray-800">Potential Concerns</h4>
              </div>
              <ul className="space-y-3 text-gray-700">
                {result.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-100 text-rose-800 text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    {concern}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-rose-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium text-gray-800">Recommended Consumption</h4>
                </div>
                <p className="text-gray-700 mb-6">{result.recommendation}</p>
                
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-rose-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium text-gray-800">Overall Assessment</h4>
                </div>
                <p className="text-gray-700">{result.assessment}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionalFactFinder;