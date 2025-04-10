import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const sampleData = [
  { date: "Apr 1", bmi: 22 },
  { date: "Apr 2", bmi: 22.1 },
  { date: "Apr 3", bmi: 21.8 },
  { date: "Apr 4", bmi: 22.3 },
];

const BMIChart = () => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-center">📉 BMI History</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={sampleData}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="bmi" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BMIChart;
