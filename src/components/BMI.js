import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { useDarkMode } from "../context/DarkModeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// BMI Icon Component
const BMIIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
  </svg>
);

// Custom tooltip for BMI chart
const CustomTooltip = ({ active, payload, label }) => {
  const { isDarkMode } = useDarkMode();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-dark-chart-tooltip-bg text-dark-chart-tooltip-text border border-dark-chart-tooltip-border' : 'bg-white text-gray-800 border border-gray-200'}`}>
        <p className="font-medium">{label}</p>
        <p className="text-green-600 font-semibold">BMI: {data.bmi}</p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category: {data.category}</p>
      </div>
    );
  }
  return null;
};

const BMICalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBMI] = useState(null);
  const [bmiCategory, setBMICategory] = useState("");
  const [history, setHistory] = useState([]);
  const { isDarkMode } = useDarkMode();

  const user = getAuth().currentUser;

  useEffect(() => {
    if (user) {
      fetchBMIHistory();
    }
  }, [user]);

  const fetchBMIHistory = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setHistory(data.bmiHistory || []);
    }
  };

  const calculateBMI = async () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w) return;

    const bmiValue = w / (h * h);
    const roundedBMI = parseFloat(bmiValue.toFixed(2));
    setBMI(roundedBMI);

    let category = "";
    if (bmiValue < 18.5) category = "Underweight";
    else if (bmiValue < 24.9) category = "Normal";
    else if (bmiValue < 29.9) category = "Overweight";
    else category = "Obese";

    setBMICategory(category);

    // Save to Firestore
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      bmiHistory: arrayUnion({
        bmi: roundedBMI,
        category,
        date: new Date().toISOString(),
      }),
    });

    fetchBMIHistory();
  };

  // Format date for chart
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Get color based on BMI category
  const getCategoryColor = (category) => {
    switch (category) {
      case "Underweight":
        return isDarkMode ? "#3b82f6" : "#3b82f6"; // Blue
      case "Normal":
        return isDarkMode ? "#10b981" : "#10b981"; // Green
      case "Overweight":
        return isDarkMode ? "#f59e0b" : "#f59e0b"; // Yellow
      case "Obese":
        return isDarkMode ? "#ef4444" : "#ef4444"; // Red
      default:
        return isDarkMode ? "#10b981" : "#10b981"; // Default green
    }
  };

  return (
    <div className={`p-6 max-w-2xl mx-auto ${isDarkMode ? 'bg-dark-card' : 'bg-white'} rounded-xl shadow-md border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center justify-center mb-6">
        <div className={`w-12 h-12 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-xl flex items-center justify-center mr-3`}>
          <BMIIcon className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
        </div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
          BMI <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>Calculator</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Height (cm)
          </label>
          <input
            type="number"
            placeholder="Height in centimeters"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-dark-input text-dark-text' : 'border-gray-200 bg-white text-gray-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Weight (kg)
          </label>
          <input
            type="number"
            placeholder="Weight in kilograms"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-700 bg-dark-input text-dark-text' : 'border-gray-200 bg-white text-gray-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={calculateBMI}
            className="w-full bg-green-600 text-white py-3 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
          >
            Calculate BMI
          </button>
        </div>
      </div>

      {bmi && (
        <div className={`text-center mb-8 p-4 ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} rounded-lg border`}>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
            Your BMI is: <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>{bmi}</span> –{" "}
            <span
              className={`font-bold ${
                bmiCategory === "Normal"
                  ? isDarkMode ? "text-green-400" : "text-green-600"
                  : bmiCategory === "Underweight"
                  ? isDarkMode ? "text-blue-400" : "text-blue-500"
                  : bmiCategory === "Overweight"
                  ? isDarkMode ? "text-yellow-400" : "text-yellow-600"
                  : isDarkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              {bmiCategory}
            </span>
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-dark-text' : 'text-gray-800'} text-center`}>
            BMI <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>History</span>
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={history.map((item) => ({
                  name: formatDate(item.date),
                  bmi: item.bmi,
                  category: item.category,
                  color: getCategoryColor(item.category)
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? "#404040" : "#f0f0f0"} 
                />
                <XAxis 
                  dataKey="name" 
                  stroke={isDarkMode ? "#e5e5e5" : "#6b7280"}
                  tick={{ fill: isDarkMode ? "#e5e5e5" : "#6b7280" }}
                  axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#e5e7eb" }}
                />
                <YAxis 
                  stroke={isDarkMode ? "#e5e5e5" : "#6b7280"}
                  tick={{ fill: isDarkMode ? "#e5e5e5" : "#6b7280" }}
                  axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#e5e7eb" }}
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="bmi" 
                  name="BMI Value"
                  fill={isDarkMode ? "#4a9eff" : "#10b981"} 
                  radius={[10, 10, 0, 0]}
                  animationDuration={1500}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
