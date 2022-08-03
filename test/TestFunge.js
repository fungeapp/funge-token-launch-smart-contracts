const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber =  require("bignumber.js");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");


describe("Testing of the Funge ERC20 Contract", function () {

    async function deployFungeFixture() {
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

        await Funge.initialize(_name, _symbol, _decimals, _initialSupply, _mintable, owner.address);
        // console.log("Funge contract address:", Funge.address);

        return { Funge, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { Funge, owner } = await loadFixture(deployFungeFixture);
            expect(await Funge.getOwner()).to.equal(owner.address);
        });
    });

});