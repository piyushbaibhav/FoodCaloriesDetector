/**
 * Parses a nutrition information string into an object with numeric values
 * @param {string} nutritionString - The nutrition information string
 * @returns {Object} Object containing parsed nutrition values
 */
export const parseNutritionString = (nutritionString) => {
  const result = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0
  };

  // Extract calories
  const caloriesMatch = nutritionString.match(/Calories:\s*(\d+)/i);
  if (caloriesMatch) {
    result.calories = parseFloat(caloriesMatch[1]);
  }

  // Extract protein
  const proteinMatch = nutritionString.match(/Protein:\s*(\d+\.?\d*)/i);
  if (proteinMatch) {
    result.protein = parseFloat(proteinMatch[1]);
  }

  // Extract fat
  const fatMatch = nutritionString.match(/Fat:\s*(\d+\.?\d*)/i);
  if (fatMatch) {
    result.fat = parseFloat(fatMatch[1]);
  }

  // Extract carbs
  const carbsMatch = nutritionString.match(/Carbohydrates:\s*(\d+\.?\d*)/i);
  if (carbsMatch) {
    result.carbs = parseFloat(carbsMatch[1]);
  }

  // Extract fiber
  const fiberMatch = nutritionString.match(/Fiber:\s*(\d+\.?\d*)/i);
  if (fiberMatch) {
    result.fiber = parseFloat(fiberMatch[1]);
  }

  return result;
}; 