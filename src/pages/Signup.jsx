import { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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

  // 🔐 Email/Password Signup
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

  // 🔐 Google Signup
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save to Firestore if not already
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
    <div className="min-h-screen flex items-center justify-center bg-pink-100">
      <form
        className="bg-white p-8 rounded-lg shadow-lg space-y-4 w-[90%] max-w-md"
        onSubmit={handleSignup}
      >
        <h2 className="text-2xl font-bold text-center text-pink-600">
          Signup
        </h2>

        {["name", "dob", "email", "password"].map((field) => (
          <input
            key={field}
            type={
              field === "password"
                ? "password"
                : field === "email"
                ? "email"
                : field === "dob"
                ? "date"
                : "text"
            }
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-pink-300"
            required
          />
        ))}

        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
        >
          Signup
        </button>

        <div className="text-center text-gray-400">or</div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded hover:bg-gray-100 transition"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Signup with Google
        </button>
      </form>
    </div>
  );
}
