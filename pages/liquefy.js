import React from "react";
import { ethers } from "ethers";
import poolContract from "./poolcontract.json";
import { getExistingPools } from "./existingpools";
import { Multicall } from "ethereum-multicall";
import { v4 as uuidv4 } from "uuid";

const {
  ChainId,
  Fetcher,
  WETH,
  Route,
  Trade,
  TokenAmount,
  TradeType,
} = require("@uniswap/sdk");

const Liquefy = ({ connectedAddress }) => {
  const getExistingPoolsDetails = async (existingPools) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const multicall = new Multicall({
      ethersProvider: provider,
      tryAggregate: true,
    });
    const contractCallContext = [];

    existingPools.map((pool) => {
      contractCallContext.push({
        reference: `${pool}`,
        contractAddress: pool,
        abi: poolContract.poolContract.abi,
        calls: [
          { reference: `${pool}`, methodName: "name", methodParameters: [] },
          { reference: `${pool}`, methodName: "symbol", methodParameters: [] },
          { reference: `${pool}`, methodName: "asset", methodParameters: [] },
          {
            reference: `${pool}`,
            methodName: "holdingsLength",
            methodParameters: [],
          },
          {
            reference: `${pool}`,
            methodName: "balanceOf",
            methodParameters: [connectedAddress],
          },
          {
            reference: `${pool}`,
            methodName: "decimals",
            methodParameters: [],
          },
          {
            reference: `${pool}`,
            methodName: "allowance",
            methodParameters: [connectedAddress, pool],
          },
        ],
      });
    });

    try {
      const callResults = (await multicall.call(contractCallContext)).results;
      const poolDetail = Object.keys(callResults)
        .map((key) => callResults[key])
        .map((e) => {
          const poolTokenDecimals = ethers.BigNumber.from(
            e.callsReturnContext[5].returnValues[0]
          );
          const poolTokenWalletBalance = ethers.utils.formatUnits(
            ethers.BigNumber.from(
              e.callsReturnContext[4].returnValues[0].hex
            ).toString(),
            poolTokenDecimals
          );
          const poolTokenApproved =
            ethers.utils.formatUnits(
              ethers.BigNumber.from(
                e.callsReturnContext[6].returnValues[0].hex
              ).toString(),
              poolTokenDecimals
            ) > 1;

          return {
            name: e.callsReturnContext[0].returnValues[0],
            symbol: e.callsReturnContext[1].returnValues[0],
            poolAddress: e.callsReturnContext[0].reference,
            collectionAddress: e.callsReturnContext[2].returnValues[0],
            holdingsLength: ethers.BigNumber.from(
              e.callsReturnContext[3].returnValues[0].hex
            ).toNumber(),
            poolTokenWalletBalance,
            poolTokenDecimals,
            poolTokenApproved,
            poolTokens: [],
            walletTokens: [],
          };
        });

      const contractCallContextURI = poolDetail.map((e) => {
        return {
          reference: `${e.collectionAddress}`,
          contractAddress: e.collectionAddress,
          abi: poolContract.erc721.abi,
          calls: [
            {
              reference: `${e.collectionAddress}`,
              methodName: "tokenURI",
              methodParameters: [1],
            },
            {
              reference: `${e.collectionAddress}`,
              methodName: "name",
              methodParameters: [],
            },
            {
              reference: `${e.collectionAddress}`,
              methodName: "balanceOf",
              methodParameters: [connectedAddress],
            },
            {
              reference: `${e.collectionAddress}`,
              methodName: "isApprovedForAll",
              methodParameters: [connectedAddress, e.poolAddress],
            },
            {
              reference: `${e.collectionAddress}`,
              methodName: "isApprovedForAll",
              methodParameters: [
                connectedAddress,
                poolContract.swapContract.address,
              ],
            },
          ],
        };
      });

      const callResultsURI = (await multicall.call(contractCallContextURI))
        .results;
      const poolDetailwithURI = Object.keys(callResultsURI)
        .map((key) => callResultsURI[key])
        .map((e, i) => {
          const tokenURI = e.callsReturnContext[0].returnValues[0];
          const collectionName = e.callsReturnContext[1].returnValues[0];
          const nftTokenWalletBalance = ethers.BigNumber.from(
            e.callsReturnContext[2].returnValues[0].hex
          ).toNumber();
          const isDepositApproved = e.callsReturnContext[3].returnValues[0];
          const isSwapApproved = e.callsReturnContext[4].returnValues[0];
          return {
            ...poolDetail[i],
            tokenURI,
            collectionName,
            uuid: uuidv4(),
            isDepositApproved,
            isSwapApproved,
            nftTokenWalletBalance,
          };
        });

      return poolDetailwithURI;
    } catch (err) {
      console.log(err);
    }
  };

  const getNftBalance = async (nftCollection, walletAddress) => {
    const request_url = `/api/getWalletNft?walletAddress=${walletAddress}&nftCollection=${nftCollection}`;
    const response = await fetch(request_url);
    const data = await response.json();
    return data;
  };

  const getPoolTokenBalance = async (poolAddress, walletAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const multicall = new Multicall({
      ethersProvider: provider,
      tryAggregate: true,
    });
    const contractCallContext = [
      {
        reference: poolAddress,
        contractAddress: poolAddress,
        abi: poolContract.poolContract.abi,
        calls: [
          {
            reference: poolAddress,
            methodName: "balanceOf",
            methodParameters: [connectedAddress],
          },
          {
            reference: poolAddress,
            methodName: "decimals",
            methodParameters: [],
          },
        ],
      },
    ];

    try {
      const callResults = (await multicall.call(contractCallContext)).results;
      const poolTokenBalance = Object.keys(callResults)
        .map((key) => callResults[key])
        .map((e) => {
          const poolTokenDecimals = ethers.BigNumber.from(
            e.callsReturnContext[1].returnValues[0]
          );
          const balance = ethers.utils.formatUnits(
            ethers.BigNumber.from(
              e.callsReturnContext[0].returnValues[0].hex
            ).toString(),
            poolTokenDecimals
          );
          return balance;
        });

      return poolTokenBalance[0];
    } catch (err) {
      console.log(err);
    }
  };

  const loadPools = async () => {
    // Get addresses of existing collection pools
    let collectionPools = [];
    try {
      collectionPools = await getExistingPools();
    } catch (e) {
      console.log(e);
    }

    console.log({ collectionPools });

    // Get the details of the collection pools
    let poolsDetails = [];
    try {
      poolsDetails = await getExistingPoolsDetails(collectionPools);
    } catch (e) {
      console.log(e);
    }

    console.log({ poolsDetails });
    // TODO
    // Data model sent in seperate text file
    // Get tokens from each pool into a seperate array
    // Display tokens in a scrollable section that can be clicked
    // Can be same as the one that is used in existingpools.js

    // Iterate through the poolsDetails array and get the NFTs for each collection
    let walletBalance = null;
    let poolBalance = null;
    for (let i = 0; i < poolsDetails.length; i++) {
      const poolAddress = poolsDetails[i].poolAddress;
      const nftCollection = poolsDetails[i].collectionAddress;

      // Check if the connectedAddress owns any NFTs in the collection
      walletBalance = await getNftBalance(nftCollection, connectedAddress);
      poolBalance = await getNftBalance(nftCollection, poolAddress);
      console.log({ nftCollection, walletBalance, poolBalance });
    }

    return poolsDetails;
  };

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
    const customHttpProvider = new ethers.providers.JsonRpcProvider(
      process.env.INFURA_URL
    );

    const chainId = ChainId.MAINNET;
    const tokenAddress = pool.poolAddress;

    const dai = await Fetcher.fetchTokenData(
      chainId,
      tokenAddress,
      customHttpProvider
    );
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai, weth, customHttpProvider);
    const route = new Route([pair], weth);
    const trade = new Trade(
      route,
      new TokenAmount(weth, "100000000000000000"),
      TradeType.EXACT_INPUT
    );
  };

  return (
    <div className="py-5">
      {connectedAddress ? (
        <div className="mx-auto w-90/100 bg-white shadow-lg rounded-lg p-4 ">
          <div className="flex flex-col">
            <div className="flex flex-row">
              <label>NFT Collection Address: </label>
              <input placeholder="Enter NFT Collection Address"></input>
            </div>
            <div className="flex flex-row">
              <label>NFT ID: </label>
              <input placeholder="Enter NFT Collection Address"></input>
            </div>
            <div className="flex flex-row">
              <input placeholder="Tokens"></input>
              <input placeholder="Enter Amount"></input>
              <button>Liquefy</button>
            </div>
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
