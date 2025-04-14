import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import dayjs from "dayjs";
import { getAuth } from "firebase/auth";
import { useDarkMode } from "../../context/DarkModeContext";

// Chart Icon Component
const ChartIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  const { isDarkMode } = useDarkMode();
  
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-dark-chart-tooltip-bg text-dark-chart-tooltip-text border border-dark-chart-tooltip-border' : 'bg-white text-gray-800 border border-gray-200'}`}>
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CalorieChart = () => {
  const [foodEntries, setFoodEntries] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [filter, setFilter] = useState("today");
  const [chartData, setChartData] = useState([]);
  const [selectedNutrient, setSelectedNutrient] = useState("calories");
  const [chartType, setChartType] = useState("bar");
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
    const fetchData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        let fromDate = new Date();

        if (filter === "7days") {
          fromDate = dayjs().subtract(7, "day").toDate();
        } else if (filter === "30days") {
          fromDate = dayjs().subtract(30, "day").toDate();
        } else {
          fromDate.setHours(0, 0, 0, 0); // Start of today
        }

        // Query the user's foodEntries subcollection
        const userRef = doc(db, "users", userId);
        const foodEntriesRef = collection(userRef, "foodEntries");
        const q = query(
          foodEntriesRef,
          where("timestamp", ">=", fromDate),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const foods = [];
        let total = 0;
        const chartTemp = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nutrition = extractNutrients(data.nutritionInfo);

          let nutrientValue = 0;
          switch (selectedNutrient) {
            case "calories":
              nutrientValue = nutrition.calories;
              break;
            case "protein":
              nutrientValue = nutrition.protein;
              break;
            case "fat":
              nutrientValue = nutrition.fat;
              break;
            case "carbs":
              nutrientValue = nutrition.carbs;
              break;
            case "fiber":
              nutrientValue = nutrition.fiber;
              break;
            default:
              nutrientValue = nutrition.calories;
          }

          total += nutrientValue;

          const dateKey = dayjs(data.timestamp.toDate()).format("MM/DD/YYYY");

          if (!chartTemp[dateKey]) {
            chartTemp[dateKey] = {
              date: dateKey,
              calories: 0,
              protein: 0,
              fat: 0,
              carbs: 0,
              fiber: 0,
            };
          }

          chartTemp[dateKey][selectedNutrient] += nutrientValue;
          foods.push({
            ...data,
            id: doc.id,
            nutrition,
          });
        });

        // Convert chartTemp to array and sort by date
        const chartDataArray = Object.values(chartTemp).sort((a, b) => {
          const dateA = dayjs(a.date, "MM/DD/YYYY");
          const dateB = dayjs(b.date, "MM/DD/YYYY");
          return dateA.isBefore(dateB) ? -1 : 1;
        });

        setFoodEntries(foods);
        setTotalCalories(total);
        setChartData(chartDataArray);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [filter, selectedNutrient, auth.currentUser]);

  // Get color based on selected nutrient
  const getNutrientColor = (nutrient) => {
    switch (nutrient) {
      case "calories":
        return "#10b981"; // Green
      case "protein":
        return "#3b82f6"; // Blue
      case "fat":
        return "#f59e0b"; // Yellow
      case "carbs":
        return "#8b5cf6"; // Purple
      case "fiber":
        return "#ec4899"; // Pink
      default:
        return "#10b981"; // Default green
    }
  };

  // Get gradient color for area chart
  const getGradientColor = (nutrient) => {
    switch (nutrient) {
      case "calories":
        return "url(#caloriesGradient)";
      case "protein":
        return "url(#proteinGradient)";
      case "fat":
        return "url(#fatGradient)";
      case "carbs":
        return "url(#carbsGradient)";
      case "fiber":
        return "url(#fiberGradient)";
      default:
        return "url(#caloriesGradient)";
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChartIcon className="text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
            Calorie History
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("today")}
            className={`p-2 rounded-lg ${
              filter === "today"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("7days")}
            className={`p-2 rounded-lg ${
              filter === "7days"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setFilter("30days")}
            className={`p-2 rounded-lg ${
              filter === "30days"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType("bar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chartType === "bar"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chartType === "area"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chartType === "line"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Line
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedNutrient("calories")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedNutrient === "calories"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Calories
          </button>
          <button
            onClick={() => setSelectedNutrient("protein")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedNutrient === "protein"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Protein
          </button>
          <button
            onClick={() => setSelectedNutrient("carbs")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedNutrient === "carbs"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Carbs
          </button>
          <button
            onClick={() => setSelectedNutrient("fat")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedNutrient === "fat"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Fat
          </button>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="carbsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fiberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#404040" : "#e5e7eb"} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
                axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
              />
              <YAxis 
                tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
                axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey={selectedNutrient} 
                name={selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)}
                fill={getNutrientColor(selectedNutrient)} 
                radius={[10, 10, 0, 0]}
                animationDuration={1500}
                animationBegin={0}
              />
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="carbsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fiberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#404040" : "#e5e7eb"} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
                axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
              />
              <YAxis 
                tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
                axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={selectedNutrient} 
                name={selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)}
                stroke={getNutrientColor(selectedNutrient)} 
                fillOpacity={1} 
                fill={getGradientColor(selectedNutrient)}
                animationDuration={1500}
                animationBegin={0}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#404040" : "#e5e7eb"} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
                axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
              />
              <YAxis 
                tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
                axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedNutrient} 
                name={selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)}
                stroke={getNutrientColor(selectedNutrient)} 
                strokeWidth={3}
                dot={{ fill: getNutrientColor(selectedNutrient), r: 6 }}
                activeDot={{ r: 8, fill: getNutrientColor(selectedNutrient) }}
                animationDuration={1500}
                animationBegin={0}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-gray-800">
          Total {selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)}:{" "}
          <span className="text-green-600 font-bold">
            {selectedNutrient === "calories" 
              ? Math.round(totalCalories) 
              : totalCalories.toFixed(1)}{" "}
            {selectedNutrient === "calories" ? "kcal" : "g"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CalorieChart;
