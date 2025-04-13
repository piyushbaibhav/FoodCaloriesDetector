import React, { useState } from "react";
import {
  BarChart2,
  HeartPulse,
  Info,
  Menu,
  LogOut,
  Utensils,
  Search,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";

const Sidebar = ({ setSection }) => {
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => setOpen(!open);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const navItems = [
    { icon: <Utensils />, label: "Food Input", id: "input" },
    { icon: <BarChart2 />, label: "Calorie History", id: "calorie" },
    { icon: <HeartPulse />, label: "BMI", id: "bmi" },
    { icon: <Info />, label: "Progress Toward Daily Goal", id: "progress" },
    { icon: <Search />, label: "Nutritional Fact Finder", id: "facts" },
  ];

  return (
    <>
      {/* Hamburger Icon for Mobile */}
      <div className="md:hidden p-4 fixed top-0 left-0 z-50">
        <Menu
          onClick={toggleSidebar}
          className="w-8 h-8 text-rose-700 cursor-pointer"
        />
      </div>

      {/* Sidebar */}
      <div
        className={`bg-rose-200 text-rose-800 fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:flex md:w-64 md:flex-col md:justify-between md:min-h-screen md:p-4 hidden md:block`}
      >
        {/* Top Section */}
        <div>
          <div className="text-xl font-bold p-4 hidden md:block">🍎 FoodCal</div>
          <div className="flex flex-col gap-4 mt-4">
            {navItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSection(item.id);  // Pass the correct section ID
                  setOpen(false); // Close sidebar on mobile
                }}
                className="group hover:bg-rose-300 md:hover:translate-x-2 transition-all duration-300 p-3 rounded-lg cursor-pointer flex items-center gap-3"
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Sign Out */}
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all"
          >
            <LogOut />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
