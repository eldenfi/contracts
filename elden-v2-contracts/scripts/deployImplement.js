const { ethers, upgrades } = require("hardhat");

async function main() {

  let stETH, caUSD, fund, cal, staking, vecal, boost, minter, helper, bond;

  
  // const Lido = await ethers.getContractFactory("Lido");
  // stETH = await Lido.deploy();
  // await stETH.deployed()
  // console.log("stETH address: ", stETH.address)
  stETH = {
    address: "0xe263d8b04f15a961d202b84c13668c1c6f2e2638"
  }

  const priceFeed = {
    address: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
  }

  // const Caelum = await ethers.getContractFactory("Caelum");
  // caUSD = await Caelum.deploy(stETH.address);
  // await caUSD.deployed()
  // console.log("caUSD address: ", caUSD.address)
  
  caUSD = {
    address: "0x3c459d7b74f2832fe843ddf7b11ed3d5fd6e8de9"
  }

  // const CaelumHelper = await ethers.getContractFactory("CaelumHelper");
  // helper = await CaelumHelper.deploy(caUSD.address, stETH.address, priceFeed.address);
  // await helper.deployed()
  // console.log("helper address: ", helper.address)

  helper = {
    address: "0xC4290C4361385e508479782Af49E2cae23f2D23b"
  }

  // const Fund = await ethers.getContractFactory("CaelumFund");
  // fund = await Fund.deploy(caUSD.address);
  // await fund.deployed()
  // console.log("fund address: ", fund.address)

  fund = {
    address: "0x6de5ece1139e6c5cb666799858714216e1349d62"
  }

  // const Bond = await ethers.getContractFactory("CaelumBond");
  // bond = await Bond.deploy();
  // await bond.deployed()
  // console.log("bond address: ", bond.address)

  bond = {
    address: "0xedc5f906e285a05032d1dd15a5b53416897e2bd9"
  }

  // const CAL = await ethers.getContractFactory("CAL");
  // cal = await CAL.deploy(fund.address, bond.address);
  // await cal.deployed()
  // console.log("cal address: ", cal.address)

  cal = {
    address: "0xC7d25E20aC05fB9C39Fe0d818F4ad8C220b8A1f4"
  }

  // const veCALBoost = await ethers.getContractFactory("veCALBoost");
  // boost = await veCALBoost.deploy();
  // await boost.deployed()
  // console.log("boost address: ", boost.address)

  boost = {
    address: "0xa4ad76975eA33BD09C1398232f053ca2c16dF34f"
  }

  // const veCAL = await ethers.getContractFactory("veCAL");
  // vecal = await veCAL.deploy(fund.address);
  // await vecal.deployed()
  // console.log("vecal address: ", vecal.address)

  vecal = {
    address: "0xebf61E01075F95Aa3c3B36eB388a854e5c479e81"
  }

  // const veCALMinerV2 = await ethers.getContractFactory("veCALMinerV2");
  // minter = await veCALMinerV2.deploy(caUSD.address, helper.address, boost.address, fund.address);
  // await minter.deployed()
  // console.log("minter address: ", minter.address)

  const lp = {
    address: "0x7de8381f39fd5841e7302d09a22a1fe98342a59b"
  }

  const StakingRewardsV2 = await ethers.getContractFactory("StakingRewardsV2");
  staking = await StakingRewardsV2.deploy(lp.address, vecal.address, boost.address, fund.address);
  await staking.deployed()
  console.log("staking address: ", staking.address)


  // /*************************
  //  * Setting caUSD Contract
  //  * **********************/
  // try {
  //   await caUSD.setVECALMinter(minter.address)
  //   await caUSD.setFund(fund.address)
  //   await caUSD.setHelper(helper.address)
  //   await caUSD.setBond(bond.address)
  // } catch (error) {
  //   console.log("Failed to caUSD setting")
  // }
  // // console.log("caUSD Setting Finished")

  
  // /*************************
  //  * Setting Fund Contract
  //  * **********************/
  // try {
  //   await fund.setTokenAddress(vecal.address, cal.address)
  // } catch (error) {
  //   console.log("Failed to Fund setting")
  // }
  // // fund.setClaimAbleTime(block timestamp)
  // // console.log("Fund Setting Finished")


  // /*************************
  //  * Setting CAL Contract
  //  * **********************/
  // ////// Nothing


  // /*************************
  //  * Setting veCALBoost Contract
  //  * **********************/
  // ////// Nothing

  // /*************************
  //  * Setting Bond Contract
  //  * **********************/
  // try {
  //   await bond.setTokenAddress(caUSD.address, cal.address, lido.address)
  //   await bond.openMarket(ethers.constants.AddressZero, 0, 86400, 10, ethers.utils.parseEther("100000"))
  // } catch (error) {
  //   console.log("Failed to Bond setting")
  // }
  // // address _quoteToken,
  // // uint256 _startTime,
  // // uint256 _vestDuration,
  // // uint256 _discount,
  // // uint256 _amountToSell

  // /*************************
  //  * Setting veCAL Contract
  //  * **********************/
  // try {
  //   await vecal.setMinter([minter.address, fund.address, staking.address], [true, true, true])
  //   await vecal.setGov(owner.address)  /// In lybra, they set a gnosis wallet as a gov
  // } catch (error) {
  //   console.log("Failed to veCAL setting")
  // }
  // // console.log("veCAL Setting Finished")
  

  // /*************************
  //  * Setting veCALMinter Contract
  //  * **********************/
  // try {
  //   await minter.setExtraRate(ethers.utils.parseEther("20"))
  //   await minter.notifyRewardAmount(ethers.utils.parseEther("1898630"))
  //   await minter.setVeCAL(vecal.address)
  // } catch (error) {
  //   console.log("Failed to veCALMinter setting")
  // }


  /*************************
   * Setting staking Contract
   * **********************/
  try {
    await staking.notifyRewardAmount(ethers.utils.parseEther("172603"))
  } catch (error) {
    console.log("Failed to staking setting")
  }
  // console.log("staking Setting Finished")
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
