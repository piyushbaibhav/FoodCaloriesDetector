import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI('AIzaSyA40OoIi5AEkJhyehzX_1hvXGlSAL-DEJE');

export async function getNutritionalFacts(food) {
  if (!food) {
    throw new Error('Food name is required');
  }

  try {
    // Get the Gemini 1.5 Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Create a prompt for the Gemini API
    const prompt = `
      Provide detailed nutritional information about ${food} in the following JSON format:
      {
        "foodName": "${food}",
        "nutritionInfo": "Calories: X kcal Protein: Y g Fat: Z g Carbohydrates: W g Fiber: V g",
        "benefits": ["benefit 1", "benefit 2", "benefit 3"],
        "concerns": ["concern 1", "concern 2"],
        "recommendation": "Detailed recommendation on how much to consume and frequency",
        "assessment": "Overall assessment of whether this food is good or bad for health"
      }
      
      Make sure the nutritionInfo string follows exactly this format: "Calories: X kcal Protein: Y g Fat: Z g Carbohydrates: W g Fiber: V g"
      Replace the placeholder values with actual numbers.
      The benefits and concerns should be arrays of strings.
      The recommendation should be a detailed paragraph.
      The assessment should be a concise paragraph.
      Return only valid JSON.
    `;

    // Generate content using the Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response from Gemini API');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    return data;
    
  } catch (error) {
    console.error('Error fetching nutritional facts:', error);
    throw new Error('Failed to fetch nutritional information');
  }
} 