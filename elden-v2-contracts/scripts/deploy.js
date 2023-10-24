const { ethers, network, run } = require("hardhat");

const main = async () => {
  // Compile contracts
  

  // Deploy WETH
  // const WETH = await ethers.getContractFactory("WETH");
  // const weth = await WETH.deploy();
  // await weth.deployed();
  // console.log("WETH deployed to:", weth.address);


  // Deploy EldenFactory
  // console.log("Deploying EldenFactory..");
  // const EldenFactory = await ethers.getContractFactory("EldenFactory");
  // const eldenFactory = await EldenFactory.deploy(
  //   "0x3745dfc48dCffBCD47AD6BA3B9a3Db66787002eC" // fee to address
  // );
  // await eldenFactory.deployed();
  // console.log("EldenFactory deployed to:", eldenFactory.address);

  
  // // Deploy EldenRouter
  // console.log("Deploying EldenRouter..");
  // const EldenRouter = await ethers.getContractFactory("EldenRouter");
  // const eldenRouter = await EldenRouter.deploy(
  //   "0xd8864CDadba883c40d3209a1E29eEF98DcA2Ed8f",  // factory
  //   "0xBCA0C8aAFb45010cD9488Edba02D2F688c41E6eD"   // weth
  // );
  // await eldenRouter.deployed();
  // console.log("EldenFactory deployed to:", eldenRouter.address);


  // const PositionHelper = await ethers.getContractFactory("PositionHelper");
  // const positionHelper = await PositionHelper.deploy(
  //   "0xb7b008073A71D91372ab29FA63B6C9ea3e8a7409",  // router
  //   "0xBCA0C8aAFb45010cD9488Edba02D2F688c41E6eD"   // weth
  // );
  // await positionHelper.deployed();
  // console.log("PositionHelper deployed to:", positionHelper.address);

  
  // const StableSwapFactory = await ethers.getContractFactory("EldenStableSwapFactory");
  // const positionHelper = await StableSwapFactory.deploy();
  // await positionHelper.deployed();
  // console.log("StableSwapFactory deployed to:", positionHelper.address);


  
  // const EldenSmartRouter = await ethers.getContractFactory("EldenSmartRouter");
  // const eldenSmartRouter = await EldenSmartRouter.deploy(
  //   "0xBCA0C8aAFb45010cD9488Edba02D2F688c41E6eD", // weth address
  //   "0xd8864CDadba883c40d3209a1E29eEF98DcA2Ed8f", // elden factory
  //   "0x8e614bc7Fb4B4880F5f05E29322A5AF91fcE62cB"  // stableswap factory
  // );
  // await eldenSmartRouter.deployed();
  // console.log("EldenSmartRouter deployed to:", eldenSmartRouter.address);
  
  // const ScrollStandardERC20 = await ethers.getContractFactory("ScrollStandardERC20");
  // const usdt = await ScrollStandardERC20.deploy();
  // await usdt.deployed();
  // console.log("ScrollStandardERC20 deployed to:", usdt.address);
  
  // await usdt.initialize("Tether USD", "USDT", 18, "0xeeB2D64CAd9B1A640b6b0814d4b496105d544855", "0xeeB2D64CAd9B1A640b6b0814d4b496105d544855")

  
  const USDC = await ethers.getContractFactory("MockERC20");
  const usdt = await USDC.deploy("USDC", "USDC", ethers.utils.parseEther("10000000000"));
  await usdt.deployed();
  console.log("USDC deployed to:", usdt.address);
  
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
