import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { DarkModeProvider } from "./context/DarkModeContext";
import { requestNotificationPermission, startMealReminders } from "./services/notificationService";

function App() {
  useEffect(() => {
    // Request notification permission when app starts
    requestNotificationPermission().then(token => {
      if (token) {
        console.log('Notification permission granted');
        // Start the meal reminder service
        startMealReminders();
      }
    });
  }, []);

  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
