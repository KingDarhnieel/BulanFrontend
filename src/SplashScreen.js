
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/app");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <img
        src= "/assets/forwardlion.png" // Replace with your logo path
        alt="Logo"
        className="w-40 h-40 rounded-full mb-6 animate-bounce"
      />
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-yellow-400"></div>
    </div>
  );
}

export default SplashScreen;