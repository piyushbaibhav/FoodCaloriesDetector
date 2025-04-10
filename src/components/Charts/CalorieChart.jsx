import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sampleData = [
  { date: "Apr 1", calories: 1200 },
  { date: "Apr 2", calories: 1500 },
  { date: "Apr 3", calories: 1100 },
  { date: "Apr 4", calories: 1600 },
];

const CalorieChart = () => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">📊 Calorie Intake History</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={sampleData}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="calories" stroke="#f43f5e" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CalorieChart;
