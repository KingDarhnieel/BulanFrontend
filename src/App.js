import React, { useEffect, useState } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { faker } from "@faker-js/faker";
import SplashScreen from "./SplashScreen";
import BottomNavigation from "./components/BottomNavigation";

const firebaseConfig = {
  apiKey: "AIzaSyBSjwCSKMPMG3LSWIkqdaYCncOwfJlzZzo",
  authDomain: "keke-dbbb4.firebaseapp.com",
  projectId: "keke-dbbb4",
  storageBucket: "keke-dbbb4.appspot.com",
  messagingSenderId: "287672612429",
  appId: "1:287672612429:web:3bd26efc24ce543193ce04",
  measurementId: "G-D8ETPX7RH8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);

  const fetchTelegramUser = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
    return null;
  };

  const registerUserInFirebase = async (telegramUser) => {
    const uid = `tg_${telegramUser.id}`;
    const userRef = doc(db, "members", uid);
    const userSnap = await getDoc(userRef);

    const profile = {
      memberId: uid,
      name: telegramUser.first_name + " " + (telegramUser.last_name || ""),
      username: telegramUser.username || "",
      image: telegramUser.photo_url || "",
      languageCode: telegramUser.languageCode,
      referrals: {},
      referredBy: null,
      balance: 0,
      token: 0,
      mineRate: 0.001,
      isMining: false,
      miningStartedTime: null,
      lastCheckIn: new Date(),
      links: null,
    };

    if (!userSnap.exists()) {
      await setDoc(userRef, profile);
    }
    setUser(profile);
  };

  const registerFakeUser = async () => {
    const fakeId = faker.string.uuid();
    const userRef = doc(db, "members", uid);
    const userSnap = await getDoc(userRef);

    const profile = {
      memberId: fakeId,
      image: faker.image.avatar(),
      firstName:faker.person.firstName(),
      lastName:faker.person.lastName(),
      username: faker.person.middleName,
      languageCode: "en",
      referrals: {},
      referredBy: null,
      balance: 0,
      token: 0,
      mineRate: 0.001,
      isMining: false,
      miningStartedTime: null,
      lastCheckIn: new Date(),
      links: null,
    };

    if (!userSnap.exists()) {
      await setDoc(userRef, profile);
    }
    setUser(profile);
  };

  useEffect(() => {
    const initializeUser = async () => {
      const telegramUser = fetchTelegramUser();
      if (telegramUser) {
        await registerUserInFirebase(telegramUser);
      } else {
        await registerFakeUser();
      }
    };

    initializeUser();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/app" element={<BottomNavigation />} />
      </Routes>
    </Router>
  );
}

export default App;
