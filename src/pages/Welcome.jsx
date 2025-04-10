import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-400 to-pink-500 text-white">
      <h1 className="text-5xl font-bold mb-10">Welcome to Food Calorie 🍽️</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-6 py-2 bg-white text-purple-700 rounded-full shadow-md hover:bg-purple-100 transition">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="px-6 py-2 bg-white text-pink-700 rounded-full shadow-md hover:bg-pink-100 transition">
            Signup
          </button>
        </Link>
      </div>
    </div>
  );
}
