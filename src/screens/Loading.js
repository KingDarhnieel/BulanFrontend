import React from "react";
import LoadingModul from "../components/LoadingModul";
import backgroundImage from "../assets/backwardlion.png";

function Loading() {
    return (
        <div
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
            }}
            className="h-screen-relative"
        >
            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    bottom: "14%"
                }}
            >
            <LoadingModul size={60} />
            </div>
        </div>
    );
}

export default Loading;