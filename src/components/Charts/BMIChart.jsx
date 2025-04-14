import React from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// Custom tooltip for BMI chart
const CustomTooltip = ({ active, payload, label }) => {
  const { isDarkMode } = useDarkMode();
  
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-dark-chart-tooltip-bg text-dark-chart-tooltip-text border border-dark-chart-tooltip-border' : 'bg-white text-gray-800 border border-gray-200'}`}>
        <p className="font-semibold">{label}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          BMI: {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

// BMI Icon Component
const BMIIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
  </svg>
);

const BMIChart = () => {
  const { isDarkMode } = useDarkMode();
  
  const sampleData = [
    { date: "Jan", bmi: 22.5 },
    { date: "Feb", bmi: 22.3 },
    { date: "Mar", bmi: 22.1 },
    { date: "Apr", bmi: 21.9 },
    { date: "May", bmi: 21.8 },
    { date: "Jun", bmi: 21.7 },
  ];

  return (
    <div className={`${isDarkMode ? 'bg-dark-card' : 'bg-white'} p-6 rounded-xl shadow-md border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-10 h-10 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
          <BMIIcon className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
        </div>
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>BMI History</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track your BMI progress over time</p>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampleData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? "#404040" : "#e5e7eb"} 
            />
            <XAxis 
              dataKey="date" 
              stroke={isDarkMode ? "#e5e5e5" : "#333333"}
              tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
              axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
            />
            <YAxis 
              stroke={isDarkMode ? "#e5e5e5" : "#333333"}
              tick={{ fill: isDarkMode ? "#e5e5e5" : "#333333" }}
              axisLine={{ stroke: isDarkMode ? "#e5e5e5" : "#333333" }}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="bmi" 
              fill={isDarkMode ? "#4a9eff" : "#3b82f6"} 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'} mr-2`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>BMI Value</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'} mr-2`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Healthy Range (18.5-24.9)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMIChart;
