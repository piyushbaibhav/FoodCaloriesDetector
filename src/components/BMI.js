import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BMICalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBMI] = useState(null);
  const [bmiCategory, setBMICategory] = useState("");
  const [history, setHistory] = useState([]);

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

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-pink-600 mb-4">
        BMI Calculator
      </h2>

      <div className="flex flex-col gap-4 md:flex-row md:justify-between mb-6">
        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-pink-300"
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-pink-300"
        />
        <button
          onClick={calculateBMI}
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
        >
          Calculate BMI
        </button>
      </div>

      {bmi && (
        <div className="text-center mb-6">
          <p className="text-lg font-semibold">
            Your BMI is: <span className="text-pink-600">{bmi}</span> –{" "}
            <span
              className={`font-bold ${
                bmiCategory === "Normal"
                  ? "text-green-600"
                  : bmiCategory === "Underweight"
                  ? "text-blue-500"
                  : bmiCategory === "Overweight"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {bmiCategory}
            </span>
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-pink-500 text-center">
            BMI History
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={history.map((item) => ({
                name: new Date(item.date).toLocaleDateString(),
                bmi: item.bmi,
              }))}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bmi" fill="#ec4899" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
