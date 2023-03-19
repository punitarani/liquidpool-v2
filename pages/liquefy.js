import React from "react";

export default function Liquefy({ connectedAddress }) {
  return (
    <div className="py-5">
      {connectedAddress ? (
        <div className="mx-auto w-90/100 bg-white shadow-lg rounded-lg p-4 ">
          <div>
            <p className="text-center text-lg">You own no NFTs</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-2xl m-10">
          Connect wallet to view your NFTs
        </p>
      )}
    </div>
  );
}
