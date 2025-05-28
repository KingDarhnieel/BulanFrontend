import './App.css';
import {BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Daily from "./screens/Daily";
import Earn from "./screens/Earn";
import Referrals from "./screens/Referrals";
import AirDrop from "./screens/AirDrop";
import Home from "./screens/Home"
import BottomNavigation from "./components/BottomNavigation";
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { setDoc } from 'firebase/firestore';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from './features/userSlice';
import CalculateNums from "./components/CalculateNums";
import CoinAnimation from "./components/CoinAnimation";
import { selectShowMessage, setShowMessage } from './features/messageSlice';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { selectCoinShow } from './features/coinShowSlice';
import { setTopUsers } from "./features/topUsersSlice";
import Loading from "./screens/Loading";
import { selectCalculated } from './features/calculateSlice';
import GenerateTopUsers from './components/GenerateTopUsers';

function App() {

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const calculate = useSelector(selectCalculated);
  const message = useSelector(selectShowMessage);
  const coinShow = useSelector(selectCoinShow);

  const [webApp, setWebApp] = useState(null);

  const processLinks = (links) => {
    if(!links) return {};
    return Object.entries(links).reduce((acc, [key, value]) => {
      acc[key] = {
        ...value,
        time: value.time ? value.time.toMillis() : null,
      };
      return acc;
    }, {});
  };

  useEffect(() => {
    GenerateTopUsers(1);
  }, []);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    if(tg?.initDataUnsafe?.user?.id){
      const userId = tg.initDataUnsafe.user.id;
      const userIdString = userId.toString();

      setWebApp({
        id: userIdString,
        firstName: tg.initDataUnsafe?.user?.first_name,
        lastName: tg.initDataUnsafe?.user?.last_name,
        username: tg.initDataUnsafe?.user?.username,
        languageCode: tg.initDataUnsafe?.user?.language_code,
      });

      tg.expand();
      tg.setBackgroundColor("#0b0b0b");
      tg.setHeaderColor("#0b0b0b");
    }
    else{
      setWebApp({
        id: "823jkss294hw",
        firstName: "Damon",
        lastName: "Salvatore",
        username: "Damie",
        languageCode: "en"
      });
    }
  }, []);

  useEffect (() => {
    //LISTENING TO USER
    const getUser = () => {
      const unsub = onSnapshot(doc(db, "members", webApp.id), async (docSnap) => {
        if (docSnap.exists()){
          dispatch(
            setUser({
              uid: webApp.id,
              userImage: docSnap.data().userImage,
              firstName: docSnap.data().firstName,
              lastName: docSnap.data().lastName,
              username: docSnap.data().username,
              languageCode: docSnap.data().languageCode,
              referrals: docSnap.data().referrals,
              referredBy: docSnap.data().referredBy,
              isPremium: docSnap.data().isPremium,
              balance: docSnap.data().balance,
              token: docSnap.data().token,
              mineRate: docSnap.data().mineRate,
              isMining: docSnap.data().isMining,
              miningStartedTime: docSnap.data().miningStartedTime
                ? docSnap.data().miningStartedTime.toMillis() : null,
              daily: {
                claimedTime: docSnap.data().daily.claimedTime
                ? docSnap.data().daily.claimedTime.toMillis() : null,
                claimedDay: docSnap.data().daily.claimedDay
                ? docSnap.data().daily.claimedDay.toMillis() : null,
              },
              links: processLinks(docSnap.data().links),
            })
          );
          console.log(docSnap.data());
        }
        else{
          await setDoc(doc(db, "members", webApp.id), {
            firstName: webApp.firstName,
            lastName: webApp.lastName || null,
            username: webApp.username || null,
            languageCode: webApp.languageCode,
            referrals: {},
            referredBy: null,
            balance: 0,
            token: 0,
            mineRate: 0.001,
            isMining: false,
            miningStartedTime: null,
            daily: {
              claimedTime: null,
              claimedDay: 0,
            },
            links: null,
          });
        }
      });

      return () => {
        unsub();
      };
    };

    if(webApp) {
      getUser();
    }
  }, [dispatch, webApp]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try{
        const usersRef = collection(db, "members");
        const q = query(usersRef, orderBy("balance", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        const topUsers = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          balance: docSnap.data().balance,
          userImage: docSnap.data().userImage,
          firstName: docSnap.data().firstName,
          lastName: docSnap.data().lastName,
        }));
        dispatch(setTopUsers(topUsers));
      } catch (error){
        console.error("Error fetching top users:", error);
      }
    };

    fetchTopUsers();
  }, [dispatch]);

  useEffect(() => {
    if(message){
      toast(message.message, {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: false,
      });
      dispatch(setShowMessage(null));
    }
  }, [message, dispatch]);

  return (
    <Router>
      {user && calculate && <BottomNavigation />}
      {user && (
        <>
        <CalculateNums />
        <ToastContainer
          style={{
            width: "calc(100% -40px)",
            maxWidth: "none",
            left: "20px",
            right: "20px",
            top: "20px",
            height: "20px",
          }}
          toastStyle={{
            minHeight: "21px", // ADJUST THIS VALUE TO CHANGE THE HEIGHT
            padding: "0px 10px", // ADJUST PADDING TO FURTHER CONTROL SIZE
            paddingBottom: "4px",
            backgroundColor:
              message?.color === "green"
               ? "#996515"
               : message?.color === "blue"
               ? "#1d4ed8"
               : "red",
            color: "white",
            borderRadius: "6px",
            marginBottom: "4px",
          }}
          />
          <CoinAnimation showAnimation={coinShow} />
        </>
      )}
      <Routes>
        <Route path="*" element={<Loading />}  />
        <Route path="/" element={<Home />}  />
        {user && calculate && <Route path="/daily" element={<Daily />} />}
        {user && calculate && <Route path="/earn" element={<Earn />} />}
        {user && calculate && <Route path="/shares" element={<Referrals />} />}
        {user && calculate && <Route path="/airdrop" element={<AirDrop />} />}
      </Routes>
    </Router>
  );
}

export default App;
