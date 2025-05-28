import React from "react";
import blockchain from "../assets/blockchain.png";

function AirDrop(){
    return (
        <div className="text-black">
            <div className="flex items-center justify-center pt-28 pb-10">
                <div className="rounded-full p-4">
                    <img className="w-28 h-28 object-contain" src={blockchain} alt="M" />
                </div>
            </div>
            <p className="text-center font-bold text-3xl">Airdrop</p>
            <p className="text-center text-lg mt-2">Coming very soon!</p>
        </div>
    );
}

export default AirDrop;