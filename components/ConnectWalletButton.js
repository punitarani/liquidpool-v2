import { ethers } from "ethers";
import { useEffect } from "react";
import Image from "next/image";

export default function ConnectWalletButton({ connectedAddress, setAddress }) {
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      if (connectedAddress) {
        setAddress(connectedAddress);
      } else {
        if (typeof window.ethereum !== "undefined") {
          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const chainId = await provider
              .getNetwork()
              .then((network) => network.chainId);
            if (chainId === 1) {
              await provider.send("eth_requestAccounts", []);
              const signer = provider.getSigner();
              const address = await signer.getAddress();
              setAddress(address);
            } else {
              alert("Please switch wallet to mainnet");
            }
          } catch (error) {
            console.error(error);
            alert("Failed to connect to wallet");
          }
        } else {
          alert("Please install MetaMask to use this feature");
        }
      }
    } else {
      alert("Please install MetaMask to use this feature");
    }
  };

  useEffect((setAddress) => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAddress(await signer.getAddress());
        } else {
          setAddress(null);
        }
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-center rounded-lg bg-blue-600 h-8 w-40">
      {connectedAddress ? (
        <div className="text-white text-sm font-semibold px-4">
          {connectedAddress.substring(0, 5) +
            "..." +
            connectedAddress.substring(38)}
        </div>
      ) : (
        <div
          onClick={connectWallet}
          className="flex flex-row items-center px-2 h-8 cursor-pointer"
        >
          <Image
            src="/metamask.svg"
            height={20}
            width={20}
            className="w-5 h-5 mx-1"
            alt="MetaMask"
          />
          <button className="text-white text-sm font-semibold mx-2">
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}
