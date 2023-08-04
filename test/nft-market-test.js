const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  it("should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarketplace");
    const market = await Market.deploy();
    // await market.deployed();

    let listing_price = await market.getListingPrice();
    listing_price = listing_price.toString();
    console.log("listing price> " + listing_price);

    const auction_price = ethers.parseUnits("1", "ether");

    /* create two tokens */
    await market.createToken("https://www.mytokenlocation.com", auction_price, {
      value: listing_price,
    });
    await market.createToken(
      "https://www.mytokenlocation2.com",
      auction_price,
      { value: listing_price }
    );

    const [_, buyerAddress] = await ethers.getSigners();

    /* execute sale of token to another user */
    await market
      .connect(buyerAddress)
      .createMarketSale(1, { value: auction_price });

    /* resell a token */
    await market
      .connect(buyerAddress)
      .resellToken(1, auction_price, { value: listing_price });

    /* query for and return the unsold items */
    items = await market.fetchMarketItems();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenUri = await market.tokenURI(i.tokenId);
        console.log("tokenUri", tokenUri);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
        };
        return item;
      })
    );
    console.log("items: ", items);
  });
});
