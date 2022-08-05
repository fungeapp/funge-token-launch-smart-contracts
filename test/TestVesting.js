const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber =  require("bignumber.js");
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
        

        const FungeVestingFactory = await ethers.getContractFactory("FungeVesting");
        const FungeVesting = await FungeVestingFactory.deploy();

        await Funge.initialize(_name, _symbol, _decimals, _initialSupply, _mintable, FungeVesting.address);
        await FungeVesting.initialize(FungeAddress);

        

        // console.log("FungeVesting contract address:", FungeVesting.address);
        // console.log("Balance of the FungeVesting:", await Funge.balanceOf(FungeVesting.address));

        return { FungeVesting, owner, otherAccount, FungeAddress };
    }

    describe("Deployment", function () {
        it("Should set the right Funge ERC20 token", async function () {
            const { FungeVesting, owner, otherAccount, FungeAddress } = await loadFixture(deployFungeVestingFixture);

            expect(await FungeVesting.getToken()).to.equal(FungeAddress);
        });

        it("Should set the right owner", async function () {
            const { FungeVesting, owner } = await loadFixture(deployFungeVestingFixture);
      
            expect(await FungeVesting.owner()).to.equal(owner.address);
        });
    });

    describe("Create Vesting Schdule", function () {
        it("Owner can only add the vesting schedule data", async function () {

            const _beneficiary = ethers.utils.getAddress("0x1155E6509bBd1EB643800681C264F03a0De6AfdE");
            const _start = ethers.BigNumber.from(1659460043);
            const _cliff = 10;
            const _duration = ethers.BigNumber.from(31556926);
            const _slicePeriodSeconds = 10;
            const _revocable = true;
            const _amount = ethers.BigNumber.from("10000000000000000000");
            const { FungeVesting, owner, otherAccount, FungeAddress } = await loadFixture(deployFungeVestingFixture);

            await expect(FungeVesting.connect(otherAccount)
            .createVestingSchedule(_beneficiary, _start, _cliff, _duration, _slicePeriodSeconds, _revocable, _amount)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Release Vesting Schdule", function () {
        it("Owner can only release the vesting schedule to each users", async function () {

            const { FungeVesting, owner, otherAccount, FungeAddress } = await loadFixture(deployFungeVestingFixture);

            // const vestingSchduleId = await FungeVesting.
            

            await expect(FungeVesting.connect(otherAccount)
            .createVestingSchedule(_beneficiary, _start, _cliff, _duration, _slicePeriodSeconds, _revocable, _amount)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    
});