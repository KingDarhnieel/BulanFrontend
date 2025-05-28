import React, { useState } from "react";
import { selectUser } from "../features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { selectCalculated } from "../features/calculateSlice";
import { setShowMessage } from "../features/messageSlice";
import { setCoinShow } from "../features/coinShowSlice";

function MiningButton(){
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const calculate = useSelector(selectCalculated);

    const [showUpgrade, setShowUpgrade] = useState(false);
    const [claimDisabled, setClaimDisabled] = useState(false);

    const MAX_MINE_RATE = 100.0;

    const caculateMinedValue = (miningStartedTime, mineRate) => {
        if(!miningStartedTime || !mineRate) return 0;

        const now = Date.now();
        const totalMiningTime = 6 * 60 * 60 * 1000;
        let elaspedTime = now - miningStartedTime;

        elaspedTime = Math.round(elaspedTime / 1000) * 1000;

        if(elaspedTime >= totalMiningTime){
            // MINING IS COMPLETE, RETURN MAXIMUM POSSIBLE MINED VALUE
            return mineRate * (totalMiningTime / 1000);
        }

        //CALCULATE MINED VALUE BASED ON ELASPED TIME
        const minedValue = mineRate * (elaspedTime / 1000);

        //ROUND TO 3 DECIMAL VALUES TO AVOID FLOATING POINT PRECISION
        return Math.round(minedValue * 1000) / 1000;
    };

    //START FARMING FUNCTION
    const startFarming = async() => {
        try{
            dispatch(
                setShowMessage({
                    message: "Mining process is starting now!",
                    color: "blue",
                })
            );
            await updateDoc(
                doc(db, "members", user.uid), {
                    isMining: true,
                    miningStartedTime: serverTimestamp(),
                }
            );
        } catch (error){
            console.error("Error while starting the farming process", error);
            dispatch(
                setShowMessage({
                    message: "An error occurred, Please try again!",
                    color: "red",
                })
            );
        }
    };

    const claimRewards = async () => {
        try{
            dispatch(
                setShowMessage({
                    message: "Your claim is in progress",
                    color: "green",
                })
            );
            setClaimDisabled(true);
            //GET THE CURRENT SERVER TIMELINE
            const getServerTime = async (db, userId) => {
                await updateDoc(
                    doc(db, "members", userId), {
                        time: serverTimestamp(),
                    }
                );

                const checkTime = async () => {
                    const docSnap = await getDoc(doc(db, "members", userId));
                    const serverTime = docSnap.data()?.time;

                    if(serverTime){
                        return serverTime;
                    } else{
                        return new Promise((resolve) => {
                            setTimeout(() => resolve(checkTime()), 1000);
                        });
                    }
                };
                return checkTime();
            };

            // USAGE
            const serverNow = await getServerTime(db, user.uid);

            // CALCULATE THE TIME IFFERENCE IN MILLISECONDS
            const timeDifference = serverNow.toMillis() - user.miningStartedTime;

            // CHECK IF 6 HOURS (21600000 MILLISECONDS) HAS PASSED
            if(timeDifference >= 21600000){
                dispatch(setCoinShow(true));

                const minedAmount = caculateMinedValue(
                    user.miningStartedTime,
                    user.mineRate,
                    serverNow
                );
                console.log("Mined Coins:", minedAmount);

                const newBalance = Number((user.balance + minedAmount).toFixed(2));

                await updateDoc(doc(db, "members", user.uid), {
                    balance: newBalance,
                    isMining: false,
                    miningStartedTime: null,
                });

                if(user.referredBy){
                    const referralBonus = Number((minedAmount * 0.1).toFixed(2));
                    const referrerDoc = doc(db, "members", user.referredBy);
                    const referrerSnapshot = await getDoc(referrerDoc);

                    if(referrerSnapshot.exists()){
                        const referrerBalance = referrerSnapshot.data().balance;
                        const referrerAddedValue = referrerSnapshot.data().referrals[user.uid].addedValue;
                        const updatedBalance = Number((referrerBalance + referralBonus).toFixed(2));
                        const updatedAddedValue = Number((referrerAddedValue + referralBonus).toFixed(2));

                        await setDoc(
                            referrerDoc,
                            {
                                referrals: {
                                    [user.uid]: {
                                        addedValue: updatedAddedValue,
                                    },
                                },
                                balance: updatedBalance,
                            },
                            { merge: true }
                        );
                    }
                }
                setClaimDisabled(false);
            } else{
                console.log("Not enough time has passed to claim rewards");
                // OPTIONALLY, YOU CAN SHOW A MESSAGE TO THE USER
                dispatch(
                    setShowMessage({
                        message: "Error, Please try again!",
                        color: "red",
                    })
                );
            }
        } catch(error){
            console.error("Error claiming rewards:", error);
            dispatch(
                setShowMessage({
                    message: "Error, Please try again!",
                    color: "red",
                })
            );
            dispatch(setCoinShow(false));
            setClaimDisabled(false);
        }
    };

    const addPrecise = (a, b) => {
        return parseFloat((a + b).toFixed(3));
    };

    const getUpgradeStep = (rate) => {
        if (rate < 0.01) return 0.001;
        if (rate < 0.1) return 0.01;
        if (rate < 1) return 0.1; 
        return Math.pow(10, Math.floor(Math.log10(rate)));
    };

    const getNextUpgradeRate = () => {
        const step = getUpgradeStep(user.mineRate);
        return Math.min(addPrecise(user.mineRate, step), MAX_MINE_RATE);
    };

    const upgradeMineRate = async () => {
        try{
            dispatch(
                setShowMessage({
                    message: "Upgrading in progress!...",
                    color: "blue",
                })
            );

            const nextRate = Math.min(
                addPrecise(user.mineRate, getUpgradeStep(user.mineRate)),
                MAX_MINE_RATE
            );
            const price = getUpgradePrice(getNextUpgradeRate());
            const newBalance = Number((user.balance - price).toFixed(2));
            setShowUpgrade(false);
            
            if(user.balance >= price){
                await updateDoc(doc(db, "members", user.uid), {
                    balance: newBalance,
                    mineRate: nextRate,
                });
            }
        } catch(error){
            console.error("Error occurred while upgrading mine rate:", error);
            dispatch(
                setShowMessage({
                    message: "Error, Please try again!...",
                    color: "red",
                })
            );
        }
    };

    const formatNumber = (num) => {
        //CONVERT THE NUMBER TO A STRING WITH A FIXED NUMBER OF DECIMAL PLACES
        let numStr = num.toFixed(3);

        //SPLIT THE NUMBER INTO INTEGER AND DECIMAL PARTS
        let [intPart, decPart] = numStr.split(".");

        //ADD THOUSAND SEPERATORS TO THE INTEGER PARTS
        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        //IF THE NUMBER IS LESS THAN 0.01, KEEP 3 DECIMAL PLACES
        if(num < 0.01){
            return `${intPart},${decPart}`;
        }

        //FOR OTHER NUMBERS, KEEP 2 DECIMAL PLACES
        decPart = decPart.slice(0, 2);

        //ALWAYS RETURN THE FORMATTED NUMBER WITH 2 DECIMAL PLACES
        return `${intPart},${decPart}`;
    };

    

    const getUpgradePrice =(nextRate)=> {
        return nextRate * 100000;
    }

    


    return (
        <div className="relative w-full mx-4">
        <div className="absolute -top-12 left-0 text-white text-lg bg-gray-800 p-2 rounded">
            Balance: B {formatNumber(user.balance)}
        </div>

        {!showUpgrade && !user.isMining && (
            <button
                onClick={() => setShowUpgrade(true)}
                className={`absolute -top-3 right-0 text-xs text-black font-bold py-1 px-2 rounded ${
                    calculate.canUpgrade
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!calculate.canUpgrade}
            >
                {user.mineRate < MAX_MINE_RATE ? "Upgrade" : "Max Upgraded"}
            </button>
        )}

        {showUpgrade && (
            <div
                className="absolute -bottom-[130px] left-0 w-full bg-gray-900 p-4 rounded-lg transform transition-all duration-300 ease-in-out"
                style={{transform: "translateY(-100%)" }}
            >
                {user.mineRate < MAX_MINE_RATE ? (
                    <div>
                        <p className="text-white mb-2 -mt-2 text-center">
                            Upgrade to {formatNumber(getNextUpgradeRate())} B/s
                        </p>
                        <button
                            onClick={upgradeMineRate}
                            className="w-full bg-yellow-700 hover:bg-yellow-800 text-black font-bold py-2 px-4 rounded"
                        >
                        Cost: B {formatNumber(getUpgradePrice(getUpgradeRate()))}
                        </button>
                    </div>
                ) : (
                    <div className="text-white text-center font-bold py-2">
                        Maximum upgrade reached!
                    </div>
                )}
            <button
                onClick={() => setShowUpgrade(false)}
                className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
                Close
            </button>
        </div>
        )}

        <div className="bg-gray-800 p-4 rounded-lg w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-white text-lg">
                    {(user.isMining && "Activated") || "Deactivated"}
                </span>
                <div className="text-white">
                    <span className="text-sm">{formatNumber(user.mineRate)} B/s</span>
                </div>
            </div>
            <div className="bg-gray-700 h-2 rounded-full mb-2">
                <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${calculate.progress}%`}}
                ></div>
            </div>
            <div className="flex justify-between items-center mb-4">
                <span className="text-white text-2xl font-bold">
                    B {formatNumber(calculate.mined)}
                </span>
                <span className="text-white">
                    {String(calculate.remainingTime.hours).padStart(2, "0")}h{" "}
                    {String(calculate.remainingTime.minutes).padStart(2, "0")}m{" "}
                    {String(calculate.remainingTime.seconds).padStart(2, "0")}s

                </span>
            </div>
            {!user.isMining && !calculate.canClaim && (
                <button
                    onClick={startFarming}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Start Mining
                </button>
            )}
            {calculate.canClaim && (
                <button
                    disabled={claimDisabled}
                    onClick={claimRewards}
                    className={`w-full ${
                        claimDisabled ? "bg-gray-500" : "bg-green-500 hover:bg-green-700"
                    } text-white font-bold py-2 px-4 rounded`}
                >
                    Claim Rewards
                </button>
            )}
        </div>
    </div>
    );
}

export default MiningButton;