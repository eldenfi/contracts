const { ethers, upgrades } = require("hardhat");
const {expect} = require('chai')
var colors = require('colors')
const keccak256 = require('keccak256');
const provider = waffle.provider;

require("@nomiclabs/hardhat-ethers");

describe("Test Token", async function () {
    let owner, accounts;
    let stETH, caUSD, fund, cal, staking, vecal, boost, minter, helper, lido, bond;
    before(async () => {
        [owner, ...accounts] = await ethers.getSigners();


        // const MarketplaceProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        // const marketplaceProxy = await MarketplaceProxy.deploy(marketplace.address, accounts[0].address, '0x8129fc1c');
        // await marketplaceProxy.deployed()
        // console.log("marketplace proxy address: ", marketplaceProxy.address)




        
        
        const Lido = await ethers.getContractFactory("Lido");
        stETH = await Lido.deploy();
        await stETH.deployed()
        // console.log("stETH address: ", stETH.address)

        const ethPriceFeed = await ethers.getContractFactory("ethPriceFeed");
        priceFeed = await ethPriceFeed.deploy();
        await priceFeed.deployed()
        // console.log("priceFeed address: ", priceFeed.address)

        


        
        const Caelum = await ethers.getContractFactory("Caelum");
        caUSD = await Caelum.deploy(stETH.address);
        await caUSD.deployed()
        // console.log("caUSD address: ", caUSD.address)

        const CaelumHelper = await ethers.getContractFactory("CaelumHelper");
        helper = await CaelumHelper.deploy(caUSD.address, stETH.address, priceFeed.address);
        await helper.deployed()
        // console.log("helper address: ", helper.address)

        const Fund = await ethers.getContractFactory("CaelumFund");
        fund = await Fund.deploy(caUSD.address);
        await fund.deployed()
        // console.log("fund address: ", fund.address)

        const Bond = await ethers.getContractFactory("CaelumBond");
        bond = await Bond.deploy();
        await bond.deployed()
        // console.log("bond address: ", bond.address)

        const CAL = await ethers.getContractFactory("CAL");
        cal = await CAL.deploy(fund.address, bond.address);
        await cal.deployed()
        // console.log("cal address: ", cal.address)

        const veCALBoost = await ethers.getContractFactory("veCALBoost");
        boost = await veCALBoost.deploy();
        await boost.deployed()
        // console.log("boost address: ", boost.address)

        const veCAL = await ethers.getContractFactory("veCAL");
        vecal = await veCAL.deploy(fund.address);
        await vecal.deployed()
        // console.log("vecal address: ", vecal.address)

        const veCALMinerV2 = await ethers.getContractFactory("veCALMinerV2");
        minter = await veCALMinerV2.deploy(caUSD.address, helper.address, boost.address, fund.address);
        await minter.deployed()
        // console.log("minter address: ", minter.address)

        const StakingRewardsV2 = await ethers.getContractFactory("StakingRewardsV2");
        staking = await StakingRewardsV2.deploy(cal.address, caUSD.address, boost.address, fund.address);
        await staking.deployed()
        // console.log("staking address: ", staking.address)


        /*************************
         * Setting caUSD Contract
         * **********************/
        await caUSD.setVECALMinter(minter.address)
        await caUSD.setFund(fund.address)
        await caUSD.setHelper(helper.address)
        await caUSD.setBond(bond.address)
        // console.log("caUSD Setting Finished")

        
        /*************************
         * Setting Fund Contract
         * **********************/
        await fund.setTokenAddress(vecal.address, cal.address)
        // fund.setClaimAbleTime(block timestamp)
        // console.log("Fund Setting Finished")


        /*************************
         * Setting CAL Contract
         * **********************/
        ////// Nothing


        /*************************
         * Setting veCALBoost Contract
         * **********************/
        ////// Nothing

        /*************************
         * Setting Bond Contract
         * **********************/
        await bond.setTokenAddress(caUSD.address, cal.address, stETH.address)
        await bond.openMarket(ethers.constants.AddressZero, 0, 86400, 10, ethers.utils.parseEther("100000"))
        await bond.openMarket(stETH.address, 0, 86400, 10, ethers.utils.parseEther("100000"))
        // address _quoteToken,
        // uint256 _startTime,
        // uint256 _vestDuration,
        // uint256 _discount,
        // uint256 _amountToSell

        /*************************
         * Setting veCAL Contract
         * **********************/
        await vecal.setMinter([minter.address, fund.address, staking.address], [true, true, true])
        await vecal.setGov(owner.address)  /// In lybra, they set a gnosis wallet as a gov
        // console.log("veCAL Setting Finished")
        

        /*************************
         * Setting veCALMinter Contract
         * **********************/
        await minter.setExtraRate(ethers.utils.parseEther("20"))
        await minter.notifyRewardAmount(ethers.utils.parseEther("1898630"))
        await minter.setVeCAL(vecal.address)
        // console.log("veCALMinter Setting Finished")


        /*************************
         * Setting staking Contract
         * **********************/
        await staking.notifyRewardAmount(ethers.utils.parseEther("172603"))
        // console.log("staking Setting Finished")
    });
    
    it("Deposit ETH/stETH and mint caUSD", async function () {

        await stETH.submit(accounts[9].address, {value: ethers.utils.parseEther("100")})
        // console.log("owner stETH balance: ", ethers.utils.formatEther(await stETH.balanceOf(owner.address)))

        await caUSD.depositEtherToMint(owner.address, ethers.utils.parseEther("100000"), {value: ethers.utils.parseEther("100")})
        console.log("owner caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(owner.address)))
        console.log("rewardPerTokenStored: ", await fund.rewardPerTokenStored())
        
        
        await caUSD.connect(accounts[0]).depositEtherToMint(accounts[0].address, ethers.utils.parseEther("1000"), {value: ethers.utils.parseEther("1")})
        // console.log("account 0 caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(accounts[0].address)))
        await caUSD.connect(accounts[1]).depositEtherToMint(accounts[1].address, ethers.utils.parseEther("1000"), {value: ethers.utils.parseEther("1")})
        // console.log("account 1 caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(accounts[1].address)))

        await caUSD.connect(accounts[2]).depositEtherToMint(accounts[2].address, ethers.utils.parseEther("1000"), {value: ethers.utils.parseEther("1")})
        // console.log("account 2 caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(accounts[2].address)))

        // console.log("caUSD Contract stETH balance: ", ethers.utils.formatEther(await stETH.balanceOf(caUSD.address)))


        console.log("owner caUSD mintable amount: ", ethers.utils.formatEther(await helper.getCausdMintableAmount(owner.address)))
        console.log("owner caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(owner.address)))
        await bond.connect(accounts[0]).bond(0, 0, {value: ethers.utils.parseEther("1")})

        await stETH.connect(accounts[0]).approve(bond.address, ethers.utils.parseEther("1000"))
        await bond.connect(accounts[0]).bond(1, ethers.utils.parseEther("1"))
        // console.log("owner caUSD mintable amount: ", ethers.utils.formatEther(await helper.getCausdMintableAmount(owner.address)))
        console.log("owner caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(owner.address)))

        await network.provider.send("evm_increaseTime", [86400])
        await network.provider.send("evm_mine")
        
        console.log("bond & owner address", bond.address, owner.address)


        await stETH.excessIncomeDistribution(ethers.utils.parseEther("1"))
        console.log("getExcessIncomeAmount", await helper.getExcessIncomeAmount())
        await caUSD.excessIncomeDistribution((await helper.getExcessIncomeAmount()))
        await caUSD.excessIncomeDistributionFromBond(ethers.utils.parseEther("1000"))
        console.log("#####   Income distributed   #####".yellow)

        console.log("owner caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(owner.address)))

        // await caUSD.excessIncomeDistribution((await helper.getExcessIncomeAmount()).div(2))
        // console.log("#####   Income distributed   #####".yellow)
        // console.log("owner caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(owner.address)))
        // console.log("caUSD Contract stETH balance: ", ethers.utils.formatEther(await stETH.balanceOf(caUSD.address)))
        // console.log("account 0 caUSD balance: ", ethers.utils.formatEther(await caUSD.balanceOf(accounts[0].address)))

        // console.log("account 0 veCAL rewardPerToken: ", ethers.utils.formatEther(await minter.rewardPerToken()))
        // console.log("account 0 veCAL userRewardPerTokenPaid: ", ethers.utils.formatEther(await minter.userRewardPerTokenPaid(accounts[0].address)))
        // console.log("account 0 veCAL staked: ", ethers.utils.formatEther(await minter.stakedOf(accounts[0].address)))
        // console.log("account 0 veCAL boost: ", ethers.utils.formatEther(await minter.getBoost(accounts[0].address)))
        // console.log("account 0 veCAL rewards: ", ethers.utils.formatEther(await minter.rewards(accounts[0].address)))
        // console.log("account 0 veCAL earned: ", ethers.utils.formatEther(await minter.earned(accounts[0].address)))
        // console.log("account 0 veCAL rewardRate: ", ethers.utils.formatEther(await minter.rewardRate()))
        await minter.connect(accounts[0]).getReward()
        // console.log("account 0 veCAL balance: ", ethers.utils.formatEther(await vecal.balanceOf(accounts[0].address)))
        await minter.connect(accounts[1]).getReward()
        console.log("account 1 veCAL balance: ", ethers.utils.formatEther(await vecal.balanceOf(accounts[1].address)))

        
        await network.provider.send("evm_increaseTime", [86400])
        await network.provider.send("evm_mine")

        await minter.connect(accounts[0]).getReward()
        // console.log("account 0 veCAL balance: ", ethers.utils.formatEther(await vecal.balanceOf(accounts[0].address)))

        console.log("rewardPerTokenStored: ", await fund.rewardPerTokenStored())
        console.log("account 0 reward: ", await fund.rewards(accounts[0].address))
        console.log("account 0 earned: ", await fund.earned(accounts[0].address))
        console.log("account 0 stake of: ", await fund.stakedOf(accounts[0].address))
        console.log("ve cal total supply: ", await vecal.totalSupply())

        
        await network.provider.send("evm_increaseTime", [86400])
        await network.provider.send("evm_mine")
        
        console.log("bond & owner address", bond.address, owner.address)


        await stETH.excessIncomeDistribution(ethers.utils.parseEther("1"))
        console.log("getExcessIncomeAmount", await helper.getExcessIncomeAmount())
        await caUSD.excessIncomeDistribution((await helper.getExcessIncomeAmount()))
        // await caUSD.excessIncomeDistributionFromBond(ethers.utils.parseEther("1000"))
        console.log("#####   Income distributed   #####".yellow)

        
        console.log("rewardPerTokenStored: ", await fund.rewardPerTokenStored())
        console.log("account 0 reward: ", await fund.rewards(accounts[0].address))
        console.log("account 0 earned: ", await fund.earned(accounts[0].address))
        console.log("account 0 stake of: ", await fund.stakedOf(accounts[0].address))
        console.log("ve cal total supply: ", await vecal.totalSupply())

        console.log("account 0 causd balance: ", await caUSD.balanceOf(accounts[0].address))
        await fund.connect(accounts[0]).getReward()
        console.log("account 0 causd balance: ", await caUSD.balanceOf(accounts[0].address))

    });

    it("Staking lp", async function () {
        // console.log("getRedeemableAmount", await helper.getRedeemableAmount(accounts[0].address))
        // console.log("getCollateralRate", await helper.getCollateralRate(accounts[0].address))
        // console.log("getEtherPrice", await helper.getEtherPrice())
    });

    it("Vest", async function () {

    });
});