import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { getAuth } from "firebase/auth";

// Chart Icon Component
const PieChartIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99L22 10.99c0-5.21-3.93-9.5-8.97-8.99zm0 12.01V22c5.07-.5 9-4.79 9-10h-8.97v.01z"/>
  </svg>
);

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const unit = data.name === "Calories" ? "kcal" : "g";
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
        <p className="font-medium text-gray-800">{data.name}</p>
        <p className="text-green-600 font-semibold">
          {data.name === "Calories" ? Math.round(data.value) : data.value.toFixed(1)} {unit}
        </p>
        <p className="text-sm text-gray-500">
          {((data.value / payload[0].payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

const NutritionPieChart = () => {
  const [nutrientData, setNutrientData] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });
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
    const fetchData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db, "users", userId);
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
          const timestamp = data.timestamp?.toDate?.(); // convert Firestore timestamp

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
  }, [auth.currentUser]);

  const chartData = [
    { name: "Calories", value: nutrientData.calories },
    { name: "Protein", value: nutrientData.protein },
    { name: "Fat", value: nutrientData.fat },
    { name: "Carbs", value: nutrientData.carbs },
    { name: "Fiber", value: nutrientData.fiber },
  ];

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => item.total = total);

  // Define colors with gradients
  const COLORS = {
    Calories: "#10b981", // Green
    Protein: "#3b82f6", // Blue
    Fat: "#f59e0b", // Yellow
    Carbs: "#8b5cf6", // Purple
    Fiber: "#ec4899", // Pink
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md w-full">
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3">
          <PieChartIcon className="text-green-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Today's <span className="text-green-600">Nutrition</span> Breakdown
        </h2>
      </div>

      <div className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 shadow-sm w-full">
        <div className="w-full" style={{ height: 'min(400px, 80vw)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius="40%"
                paddingAngle={2}
                label={({ name, value, total }) => {
                  const percentage = ((value / total) * 100).toFixed(0);
                  return percentage > 5 ? `${percentage}%` : '';
                }}
                labelLine={false}
                animationDuration={1500}
                animationBegin={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-gray-700 font-medium text-sm sm:text-base">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compact summary section */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        {chartData.map((item) => (
          <div 
            key={item.name}
            className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 border border-gray-200"
          >
            <div 
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: COLORS[item.name] }}
            />
            <span className="font-medium text-gray-700">{item.name}:</span>
            <span className="ml-1 text-gray-900">
              {item.name === "Calories" 
                ? Math.round(item.value) 
                : item.value.toFixed(1)}
              <span className="text-gray-500 ml-1">
                {item.name === "Calories" ? "kcal" : "g"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionPieChart;
