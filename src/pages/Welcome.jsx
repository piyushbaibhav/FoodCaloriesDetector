import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import DarkModeToggle from "../components/DarkModeToggle";
import Spline from '@splinetool/react-spline';

// Nutrition-Focused SVG Icons
const NutritionFactsIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z"/>
  </svg>
);

const ProgressIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 20c4.41 0 8-3.59 8-8s-3.59-8-8-8v8l-4-4 4-4v2c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>
  </svg>
);

const ImagePredictionIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
    <path d="M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
);

const FoodDatabaseIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
  </svg>
);

// Main Logo Icon
const NutritionLogo = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
  </svg>
);

// Decorative SVG Vector
const WaveVector = () => (
  <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" opacity="0.1"></path>
    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.47,89.67-39.8V0Z" fill="currentColor" opacity="0.1"></path>
  </svg>
);

const FeatureCard = ({ icon, title, bg, text, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${bg} dark:bg-dark-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-40 relative overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`transition-all duration-300 ${isHovered ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <div className={`${text} dark:text-green-400 mb-3 flex justify-center`}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-700 dark:text-gray-200">{title}</h3>
      </div>
      <div className={`absolute inset-0 p-5 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </div>
  );
};

export default function Welcome() {
  const splineRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const onLoad = (splineApp) => {
    splineRef.current = splineApp;
    
    // Update object position based on mouse movement
    const animate = () => {
      if (splineRef.current) {
        const object = splineRef.current.findObjectByName('Object');
        if (object) {
          // Smoothly move the object towards the mouse position
          object.position.x += (mousePosition.x * 2 - object.position.x) * 0.1;
          object.position.y += (mousePosition.y * 2 - object.position.y) * 0.1;
        }
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  const features = [
    { 
      icon: <NutritionFactsIcon />, 
      title: "Nutrition Facts", 
      bg: "bg-green-50 dark:bg-green-900/20", 
      text: "text-green-600",
      description: "Get detailed nutritional information for all your meals and track your daily intake."
    },
    { 
      icon: <ProgressIcon />, 
      title: "Daily Progress", 
      bg: "bg-blue-50 dark:bg-blue-900/20", 
      text: "text-blue-600",
      description: "Monitor your progress towards health goals with intuitive charts and metrics."
    },
    { 
      icon: <ImagePredictionIcon />, 
      title: "Image Prediction", 
      bg: "bg-purple-50 dark:bg-purple-900/20", 
      text: "text-purple-600",
      description: "Simply take a photo of your meal and get instant nutritional analysis."
    },
    { 
      icon: <FoodDatabaseIcon />, 
      title: "Food Database", 
      bg: "bg-amber-50 dark:bg-amber-900/20", 
      text: "text-amber-600",
      description: "Access our comprehensive database of foods with accurate nutritional values."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc] dark:bg-dark-bg text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Decorative SVG Vectors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#e0f2fe] dark:bg-gray-800 opacity-20 -rotate-12 transform origin-bottom-right"></div>
        <WaveVector />
      </div>

      {/* Spline Animation */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <Spline
          scene="https://prod.spline.design/U6ugXkhxuIuAgLWc/scene.splinecode"
          className="w-full h-full"
          onLoad={onLoad}
        />
      </div>

      {/* Main Content */}
      <div className="z-10 text-center px-4 max-w-4xl">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center shadow-sm">
            <NutritionLogo className="text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Welcome to <span className="text-green-600 dark:text-green-400">NutriTrack</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl mb-10 text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto">
          Track your nutrition, achieve your goals, and build healthier habits with our intelligent food analysis platform.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/signup">
            <button className="px-8 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700 dark:hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium text-lg">
              Get Started - It's Free
            </button>
          </Link>
          <Link to="/login">
            <button className="px-8 py-3 bg-white dark:bg-dark-card text-green-600 dark:text-green-400 border border-green-100 dark:border-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-gray-800 transition-all duration-300 font-medium text-lg shadow-sm">
              Existing User? Login
            </button>
          </Link>
        </div>

        {/* App Features Preview with slide-up animation */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              bg={feature.bg}
              text={feature.text}
              description={feature.description}
            />
          ))}
        </div>
      </div>
      <DarkModeToggle />
    </div>
  );
}