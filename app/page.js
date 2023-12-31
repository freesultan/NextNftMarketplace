"use client";

import { ethers } from "ethers";
import { nftMarketplaceAddress } from "@/config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
     const account = ethers.getAddress(accounts[0]);
     setAccount(account);
     console.log(' account: ' + account)


    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log(' signer: ' +  await provider.getSigner());
    setProvider(provider);
    const contract = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarketplace.abi,
      provider
    );
    const data = await contract.fetchMarketItems();

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        console.log("tokenuir> " + tokenUri);
        console.log("tokenId i > " + i.tokenId);
        const name = tokenUri.substring(tokenUri.lastIndexOf("/") + 1);
        let price = ethers.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: tokenUri,
          name: name,
        };
        return item;
      })
    );

    setNfts(items);
    setLoadingState("loaded");
    console.log(items);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
       const account = ethers.getAddress(accounts[0]);
       setAccount(account);
       console.log('new account: ' + account)
    });
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();
    console.log('singer: ' + signer)
    const contract = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarketplace.abi,
      signer
    );

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.parseUnits(nft.price.toString(), "ether");
    console.log("price> " + price);
    console.log("tokenId> " + nft.tokenId);
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} />
              <div className="p-4">
                <p
                  style={{ height: "64px" }}
                  className="text-2xl font-semibold"
                >
                  {nft.name}
                </p>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                <button
                  className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
