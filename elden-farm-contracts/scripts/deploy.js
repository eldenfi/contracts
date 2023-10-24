const { ethers, upgrades } = require("hardhat");

async function main() {

  const config = {
    treasuryAddress: "0x3745dfc48dCffBCD47AD6BA3B9a3Db66787002eC",
    startTime: 1698075394
  }


  const EldenToken = await ethers.getContractFactory("EldenToken");
  const eldenToken = await EldenToken.deploy(
    ethers.utils.parseEther("2000000"), // max supply
    ethers.utils.parseEther("1000000"), // initial rate
    ethers.utils.parseEther("0.1"), // emission rate
    config.treasuryAddress // treasury address
  );
  await eldenToken.deployed()
  console.log("EldenToken address: ", eldenToken.address)

  const SEldenToken = await ethers.getContractFactory("SEldenToken");
  const sEldenToken = await SEldenToken.deploy(
    eldenToken.address // elden token address
  );
  await sEldenToken.deployed()
  console.log("SEldenToken address: ", sEldenToken.address)

  const EldenMaster = await ethers.getContractFactory("EldenMaster");
  const eldenMaster = await EldenMaster.deploy(
    eldenToken.address, // elden token address
    config.startTime // start time
  );
  await eldenMaster.deployed()
  console.log("EldenMaster address: ", eldenMaster.address)

  const NFTPoolFactory = await ethers.getContractFactory("NFTPoolFactory");
  const nftPoolFactory = await NFTPoolFactory.deploy(
    eldenMaster.address, // master
    eldenToken.address, // elden token
    sEldenToken.address // sElden token
  );
  await nftPoolFactory.deployed()
  console.log("NFTPoolFactory address: ", nftPoolFactory.address)

  const YieldBooster = await ethers.getContractFactory("YieldBooster");
  const yieldBooster = await YieldBooster.deploy(
    sEldenToken.address // sElden token
  );
  await yieldBooster.deployed()
  console.log("YieldBooster address: ", yieldBooster.address)

  const Dividends = await ethers.getContractFactory("Dividends");
  const dividends = await Dividends.deploy(
    sEldenToken.address, // sElden token
    config.startTime // start time
  );
  await dividends.deployed()
  console.log("Dividends address: ", dividends.address)

  const Launchpad = await ethers.getContractFactory("Launchpad");
  const launchpad = await Launchpad.deploy(
    sEldenToken.address, // sElden token
  );
  await launchpad.deployed()
  console.log("Launchpad address: ", launchpad.address)




  ///////////////////////////////////////////////////////////////
  //////////   Setting contracts
  //////////////////////////////////////////////////////////////
  await eldenToken.updateAllocations(67,0)
  await eldenToken.initializeEmissionStart(config.startTime)
  await eldenToken.initializeMasterAddress(eldenMaster.address)

  await sEldenToken.updateRedeemSettings(50,100,3600,86400,50)   /// for test
  await sEldenToken.updateDividendsAddress(dividends.address)
  await sEldenToken.updateDeallocationFee(dividends.address, 50)
  await sEldenToken.updateDeallocationFee(yieldBooster.address, 50)
  await sEldenToken.updateDeallocationFee(launchpad.address, 50)

  await eldenMaster.setYieldBooster(yieldBooster.address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
