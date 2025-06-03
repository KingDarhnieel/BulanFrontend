import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import App from './App';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(<App />);
    }, 5000); // 5 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white">
      <h1 className="text-4xl font-extrabold mb-4 animate-pulse">🔥 Welcome to Bulan World</h1>
      <p className="text-lg font-light">Mining & Rewards, All in One Place!</p>
    </div>
  );
}