import React from "react";
import MiningButton from "../components/MiningButton";

function Home(){
    return(
        <div classname="flex flex-col h-screen relative">
            <div classname="flex items-center justify-center mt-16">
                <MiningButton />
            </div>
        </div>
    );
}

export default Home;

// import React from "react";

// function Home(){
//     return <div>Home</div>;
// }

// export default Home;