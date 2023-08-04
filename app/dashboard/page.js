"use client";

import { ethers } from "ethers";
import { nftMarketplaceAddress } from "@/config";
import NFTMarketplace from "@/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CreateNFT = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const router = useRouter();

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.getAddress(accounts[0]);
    setAccount(account);
    console.log(" account: " + account);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setProvider(provider);
    const contract = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    const data = await contract.fetchItemsListed();

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
      console.log("new account: " + account);

      loadNFTs();
    });
  }

  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="px-20 py-10 text-3xl">
        ` the account {account.slice(0,6)} ... {account.slice(36,42)} hasnt listed any NFT`
      </h1>
    );

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} />

              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} ETH
                </p>
               
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
