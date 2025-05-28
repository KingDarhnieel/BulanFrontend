import React, { useState } from "react";
import { motion } from "framer-motion";
import airdrop from "../assets/airdrop.png";
import home from "../assets/home.png";
import daily from "../assets/daily.png";
import earn from "../assets/earn.png";
import refer from "../assets/refer.png";
import Daily from "../screens/Daily";
import Earn from "../screens/Earn";
import Referrals from "../screens/Referrals";
import AirDrop from "../screens/Airdrop";
import Home from "../screens/Home"

const tabs = [
  { id: 1, label: "Home", image: home },
  { id: 2, label: "Daily", image: daily },
  { id: 3, label: "Earn", image: earn },
  { id: 4, label: "Refer", image: refer },
  { id: 5, label: "Airdrop", image: airdrop },
];

// const HomePage = () => <div className="p-4 text-center text-lg">Welcome to the Home Page</div>;
// const DailyPage = () => <div className="p-4 text-center text-lg">Track your daily stats here!</div>;
// const EarnPage = () => <div className="p-4 text-center text-lg">Earn rewards by participating!</div>;
// const ReferPage = () => <div className="p-4 text-center text-lg">Refer your friends and earn more!</div>;

export default function BottomTabNavigation() {
  const [activeTab, setActiveTab] = useState(1);

  const renderPage = () => {
    switch (activeTab) {
        case 1:
            return <Home />;
        case 2:
            return <Daily />;
        case 3:
            return <Earn />;
        case 4:
            return <Referrals />;
        case 5:
            return <AirDrop />;
        default:
            return <Home />;
    }
  };

  return (
    <div className="relative min-h-screen pb-20 bg-gray-100">
      {renderPage()}
      <div className="fixed bottom-0 w-full bg-black shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex flex-col items-center justify-center cursor-pointer"
              onClick={() => setActiveTab(tab.id)}
            >
              <motion.img
                src={tab.image}
                alt={tab.label}
                className="w-6 h-6 mb-1"
                initial={{ scale: 1 }}
                animate={{ scale: activeTab === tab.id ? 1.3 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <span
                className={`text-xs ${
                  activeTab === tab.id ? "text-blue-600 font-semibold" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
