import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";

export default function MiningButton() {
  const [userCoins, setUserCoins] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const fetchUserCoins = async () => {
    if (!user) return;
    const userRef = doc(db, "members", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserCoins(data.balance || 0);
      const lastCheckIn = data.lastCheckIn?.toDate?.() || new Date(0);
      const now = new Date();
      const isToday = lastCheckIn.toDateString() === now.toDateString();
      setCheckedIn(isToday);
    } else {
      await setDoc(userRef, { balance: 0 });
      setUserCoins(0);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!user || checkedIn) return;
    const reward = Math.floor(Math.random() * 100) + 1;
    const userRef = doc(db, "members", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const newTotal = (data.balance || 0) + reward;
      await updateDoc(userRef, {
        balance: newTotal,
        lastCheckIn: new Date()
      });
      setUserCoins(newTotal);
      setCheckedIn(true);
      setMessage(`🎉 You earned ${reward} coins today!`);
    }
  };

  useEffect(() => {
    fetchUserCoins();
  }, [user]);

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white min-h-screen text-center rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">🔥 Welcome to Daily Mining!</h1>
      <div className="mb-8">
        <p className="text-xl">You have:</p>
        <motion.p
          className="text-5xl font-extrabold mt-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? "..." : `${userCoins} Coins`}
        </motion.p>
      </div>
      <div className="mb-6">
        <button
          disabled={checkedIn || loading}
          onClick={handleCheckIn}
          className={`px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-300 ${
            checkedIn
              ? "bg-gray-300 cursor-not-allowed text-gray-700"
              : "bg-white text-yellow-700 hover:bg-yellow-200"
          }`}
        >
          {checkedIn ? "✅ Already Checked In Today" : "⛏️ Check In to Mine Coins"}
        </button>
        {message && <p className="mt-4 text-white font-semibold">{message}</p>}
      </div>
    </div>
  );
}
