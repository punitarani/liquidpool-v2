import React from "react";
import {ethers} from "ethers";
import poolContract from "./poolcontract.json";

const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType } = require ('@uniswap/sdk');


const Liquefy = ({ connectedAddress }) => {
  const handleLiquefy = async ({
    nftID,
    pool,
    poolsDetail,
    percent,
    amount,
  }) => {
    let nftCollectionContract;
    let nftPoolContract;

    // Build NFT collection contract instance
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      nftCollectionContract = new ethers.Contract(
        pool.collectionAddress,
        poolContract.erc721.abi,
        signer
      );

      nftPoolContract = new ethers.Contract(
        pool.poolAddress,
        poolContract.poolContract.abi,
        signer
      );
    } catch (error) {
      console.log(error);
      alert("Error approving NFT collection to transfer NFTs");
      return;
    }

    // Approve Deposit
    try {
      // Approve pool contract to transfer NFTs
      const tx = await nftCollectionContract.setApprovalForAll(
        pool.poolAddress,
        true
      );
      const receipt = await tx.wait();
    } catch (error) {
      console.log(error);
      alert("Error approving NFT collection to deposit NFTs");
      return;
    }

    // Deposit
    try {
      const tx = await nftPoolContract.deposit(nftID);
      const receipt = await tx.wait();
      // alert("NFT deposited, refresh wallet to see the changes");
    } catch (err) {
      console.log(err);
      if (err.message === "Internal JSON-RPC error.") {
        alert("Metamask Error: please try again");
        return;
      }
    }

    // Trade on Uniswap
    const customHttpProvider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

    const chainId = ChainId.MAINNET;
    const tokenAddress = pool.poolAddress;

    const dai = await Fetcher.fetchTokenData(chainId, tokenAddress, customHttpProvider);
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai, weth, customHttpProvider);
    const route = new Route([pair], weth);
    const trade = new Trade(route, new TokenAmount(weth, '100000000000000000'), TradeType.EXACT_INPUT);
  };

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
};

export default Liquefy;
