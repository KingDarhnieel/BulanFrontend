import React, { useEffect, useState } from "react";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { faker } from "@faker-js/faker";

export default function GenerateTopUsers() {
  const [users, setUsers] = useState([]);
  const db = getFirestore();
  //const randomId = Math.random() * 100000


  // Function to generate and store a random user
    function generateRandomNumber(){
        return Math.floor(Math.random() * (2000000 - 1000000 + 1)) + 1000000;
    }
    const randomNum = generateRandomNumber();
    const randomUserId = `MEM_${generateRandomNumber()}`;
  const generateAndSaveUser = async () => {
    const randomUser = {
        memberId: randomUserId,
        image: faker.image.avatar(),
        firstName:faker.person.firstName(),
        lastName:faker.person.lastName(),
        username: faker.person.middleName(),
        languageCode: "en",
        referrals: null,
        referredBy: null,
        isPremium: false,
        balance: randomNum,
        mineRate: 0.001,
        isMining: false,
        miningStartedTime: null,
        lastCheckIn: new Date(),
        links: null,
        rank: Math.floor(Math.random() * 1000) + 1,
    };
    await setDoc(doc(db, "members", randomUserId), randomUser);
  };

  // Fetch top users by rank
  const fetchTopUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "members"));
    const userList = [];
    querySnapshot.forEach((doc) => {
      userList.push(doc.data());
    });
    userList.sort((a, b) => a.rank - b.rank); // ascending order
    setUsers(userList.slice(0, 10)); // top 10
  };

  useEffect(() => {
    const initialize = async () => {
      await generateAndSaveUser();
      await fetchTopUsers();
    };
    initialize();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🏆 Top Miners Leaderboard</h2>
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm uppercase text-yellow-100">
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="bg-white/20 rounded-md">
              <td className="px-3 py-2">{index + 1}</td>
              <td className="px-3 py-2">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-yellow-200"
                />
              </td>
              <td className="px-3 py-2">{user.name}</td>
              <td className="px-3 py-2 font-semibold">{user.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
