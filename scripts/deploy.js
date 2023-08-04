const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  const nftMarketplaceAddress = await nftMarketplace.getAddress();
  console.log("nftMarketplace deployed to:", nftMarketplaceAddress);

  fs.writeFileSync(
    "./config.js",
    `export const nftMarketplaceAddress ="${nftMarketplaceAddress}"`
  );

  let listing_price = await nftMarketplace.getListingPrice();
  listing_price = listing_price.toString();
  console.log("listing price> " + listing_price);

  const auction_price = ethers.parseUnits("1", "ether");

//   /* create two tokens */
//   await nftMarketplace.createToken(
//     "https://www.mytokenlocation.com",
//     auction_price,
//     {
//       value: listing_price,
//     }
//   );
//   await nftMarketplace.createToken(
//     "https://www.mytokenlocation2.com",
//     auction_price,
//     { value: listing_price }
//   );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
