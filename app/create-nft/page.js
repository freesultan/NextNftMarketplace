"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import NFTMarketplace from "@/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import { nftMarketplaceAddress } from "@/config";

const CreateNFT = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
  });
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      var bodyFormData = new FormData();
      bodyFormData.append("image", file);
      console.log("key: " + process.env.NEXT_PUBLIC_MGBB_API_KEY);
      const response = await axios({
        url: `https://api.imgbb.com/1/upload?name=${formInput.name}&key=${process.env.NEXT_PUBLIC_MGBB_API_KEY}`,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        data: bodyFormData,
      });

      const data = response.data;
      const url = data.data.url;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function listNFTForSale() {
    const url = fileUrl;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    /* next, create the item */
    const price = ethers.parseUnits(formInput.price, "ether");
    let contract = new ethers.Contract(
      nftMarketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    console.log("listing price > " + listingPrice);
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push("/");
  }
  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />

        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          onClick={listNFTForSale}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create NFT
        </button>
      </div>
    </div>
  );
};

export default CreateNFT;
