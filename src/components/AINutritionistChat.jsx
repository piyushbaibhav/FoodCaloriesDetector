import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, getDocs, doc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import dayjs from "dayjs";
import { useDarkMode } from "../context/DarkModeContext";
import Spline from '@splinetool/react-spline';

const GEMINI_API_KEY = "AIzaSyA40OoIi5AEkJhyehzX_1hvXGlSAL-DEJE";

// Chat Icon Component
const ChatIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
);

// Send Icon Component
const SendIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const AINutritionistChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI Nutritionist. I can help you with nutrition questions and provide personalized advice based on your food log. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [foodLog, setFoodLog] = useState([]);
  const auth = getAuth();
  const { isDarkMode } = useDarkMode();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchFoodLog = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db, "users", userId);
        const foodEntriesRef = collection(userRef, "foodEntries");
        const q = query(foodEntriesRef, orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        const entries = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            ...data,
            timestamp: data.timestamp?.toDate()
          });
        });

        setFoodLog(entries);
      } catch (error) {
        console.error('Error fetching food log:', error);
      }
    };

    fetchFoodLog();
  }, [auth.currentUser]);

  const getNutritionistResponse = async (question) => {
    // Format food log data for context
    const foodLogContext = foodLog
      .filter(entry => dayjs(entry.timestamp).isAfter(dayjs().subtract(7, 'day')))
      .map(entry => ({
        food: entry.foodName,
        quantity: entry.quantity,
        date: dayjs(entry.timestamp).format('MMM D, YYYY'),
        nutrition: entry.nutritionInfo
      }))
      .slice(0, 10); // Limit to last 10 entries

    const prompt = `
You are a certified nutritionist and dietitian with expertise in sports nutrition, weight management, and general dietary advice.

Given the user's question and their recent food log data, provide a helpful, accurate, and personalized response based on current nutritional science.

User's recent food log (last 7 days):
${JSON.stringify(foodLogContext, null, 2)}

Format your response with:
1. A clear, direct answer to the question
2. Key points in **bold**
3. Practical recommendations based on their food log
4. Scientific backing where relevant
5. Specific suggestions considering their recent eating patterns

Keep your response under 200 words and focus on practical advice.

User question: ${question}

Note: Use markdown formatting for **bold** text to emphasize key points.
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      console.log("Gemini nutritionist response:", data);

      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return result || "I'm sorry, I couldn't process your question at this time.";
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      return "I'm sorry, there was an error processing your question.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await getNutritionistResponse(userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, there was an error processing your question." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Component */}
      <div className="w-full lg:w-[60%] h-full">
        <div className="flex flex-col h-full">
          <div className="p-4 lg:p-6 pb-0">
            <div className="flex items-center justify-center mb-4 lg:mb-6">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-green-100'} rounded-xl flex items-center justify-center mr-3`}>
                <ChatIcon className={isDarkMode ? "text-green-400" : "text-green-600"} />
              </div>
              <h2 className={`text-xl lg:text-2xl font-bold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
                AI <span className="text-green-600">Nutritionist</span>
              </h2>
            </div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-4 lg:mb-6 text-sm lg:text-base`}>
              Ask me anything about nutrition, diet, or meal planning!
            </p>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 lg:px-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="space-y-3 lg:space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] lg:max-w-[80%] p-3 lg:p-4 rounded-lg ${
                        message.role === "user"
                          ? "bg-green-600 text-white"
                          : isDarkMode 
                            ? "bg-gray-800 text-gray-200" 
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                        {message.role === "assistant" ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'} p-3 lg:p-4 rounded-lg max-w-[90%] lg:max-w-[80%]`}>
                      <div className="flex space-x-2">
                        <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'} rounded-full animate-bounce`}></div>
                        <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: "0.2s" }}></div>
                        <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 lg:p-6 pt-2 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a nutrition question..."
                  className={`flex-1 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-200 bg-white text-gray-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-green-600 text-white p-2 lg:p-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Spline Animation - Hidden on mobile */}
      <div className="hidden lg:block w-[40%] h-full">
        <Spline 
          scene="https://prod.spline.design/ZVnO7CFbDSv4Cy0c/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </>
  );
};

export default AINutritionistChat; 