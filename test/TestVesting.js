const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");


describe("Testing of the Funge Vesting Contract", function () {

    async function deployFungeVestingFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const _mintable = true;
        const _name = "Funge";
        const _symbol = "FNG";
        const _decimals = 18;
        const _initialSupply = 100_000_000;

    
        // console.log("Deploying contracts with the accounts:", owner.address, otherAccount.address);
        // console.log("Account balance:", (await owner.getBalance()).toString());
        
        const gas = await ethers.provider.getGasPrice();
        // console.log("Gas Price:", ethers.utils.formatEther(gas));

        const FungeFactory = await ethers.getContractFactory("FungeToken");
        const Funge = await FungeFactory.deploy();
        const FungeAddress = Funge.address;
        await Funge.initialize(_name, _symbol, _decimals, _initialSupply, _mintable, owner.address);

        const FungeVestingFactory = await ethers.getContractFactory("FungeVesting");
        const FungeVesting = await FungeVestingFactory.deploy();
        await FungeVesting.initialize(FungeAddress);
        // console.log("FungeVesting contract address:", FungeVesting.address);

        return { FungeVesting, owner, otherAccount, FungeAddress };
    }

    describe("Deployment", function () {
        it("Should set the right Funge ERC20 token", async function () {
            const { FungeVesting, owner, otherAccount, FungeAddress } = await loadFixture(deployFungeVestingFixture);

            expect(await FungeVesting.getToken()).to.equal(FungeAddress);
        });
    });

});