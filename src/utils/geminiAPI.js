export const fetchCaloriesFromGemini = async (foodName, quantity) => {
  const prompt = `Tell me the calorie count for ${quantity} of ${foodName}.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const result = await response.json();
  return result?.candidates?.[0]?.content?.parts?.[0]?.text || "No result";
};
