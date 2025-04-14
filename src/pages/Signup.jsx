import { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";

// Nutrition Logo Component
const NutritionLogo = () => (
  <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
  </svg>
);

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        dob: formData.dob,
        email: formData.email,
        createdAt: new Date().toISOString(),
      });

      navigate("/login");
    } catch (error) {
      alert("Signup error: " + error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || "",
        dob: "",
        email: user.email,
        createdAt: new Date().toISOString(),
        viaGoogle: true,
      });

      navigate("/login");
    } catch (error) {
      alert("Google Signup error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-dark-bg relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-green-50 dark:bg-green-900/20 opacity-20 -rotate-12 transform origin-bottom-right"></div>
      </div>
      
      {/* Wave Vector */}
      <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#10b981" opacity="0.1"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.47,89.67-39.8V0Z" fill="#10b981" opacity="0.1"></path>
      </svg>

      {/* Main Content */}
      <div className="z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center shadow-sm">
            <NutritionLogo />
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-md space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
            Join <span className="text-green-600 dark:text-green-400">NutriTrack</span>
          </h2>

          <div className="space-y-4">
            {[
              { name: "name", type: "text", placeholder: "Full Name" },
              { name: "dob", type: "date", placeholder: "Date of Birth" },
              { name: "email", type: "email", placeholder: "Email Address" },
              { name: "password", type: "password", placeholder: "Password" }
            ].map((field) => (
              <div key={field.name}>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 dark:bg-green-500 text-white py-3 rounded-lg shadow-md hover:bg-green-700 dark:hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium text-lg"
          >
            Create Account
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400">or sign up with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium text-gray-700 dark:text-gray-200"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
              Log in
            </Link>
          </div>
        </form>
      </div>
      <DarkModeToggle />
    </div>
  );
}