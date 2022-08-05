const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber =  require("bignumber.js");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");


describe("Testing of the Funge ERC20 Contract", function () {

    async function deployFungeFixture() {
        const [owner, otherAccount, addr1, addr2] = await ethers.getSigners();

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

        return { Funge, owner, otherAccount, _mintable, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { Funge, owner } = await loadFixture(deployFungeFixture);
            expect(await Funge.getOwner()).to.equal(owner.address);
        });
        it("Should set the mintable", async function () {
            const { Funge, owner, _mintable } = await loadFixture(deployFungeFixture);
            expect(await Funge.mintable()).to.equal(_mintable);
        });
        it("Should assign the total supply of tokens to the owner", async function () {
            const { Funge, owner } = await loadFixture(deployFungeFixture);
            const ownerBalance = await Funge.balanceOf(owner.address);
            expect(await Funge.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
          const { Funge, owner, addr1, addr2 } = await loadFixture(
            deployFungeFixture
          );
          // Transfer 50 tokens from owner to addr1
          await expect(
            Funge.transfer(addr1.address, 50)
          ).to.changeTokenBalances(Funge, [owner, addr1], [-50, 50]);
    
          // Transfer 50 tokens from addr1 to addr2
          // We use .connect(signer) to send a transaction from another account
          await expect(
            Funge.connect(addr1).transfer(addr2.address, 50)
          ).to.changeTokenBalances(Funge, [addr1, addr2], [-50, 50]);
        });
    
        it("should emit Transfer events", async function () {
          const { Funge, owner, addr1, addr2 } = await loadFixture(
            deployFungeFixture
          );
    
          // Transfer 50 tokens from owner to addr1
          await expect(Funge.transfer(addr1.address, 50))
            .to.emit(Funge, "Transfer")
            .withArgs(owner.address, addr1.address, 50);
    
          // Transfer 50 tokens from addr1 to addr2
          // We use .connect(signer) to send a transaction from another account
          await expect(Funge.connect(addr1).transfer(addr2.address, 50))
            .to.emit(Funge, "Transfer")
            .withArgs(addr1.address, addr2.address, 50);
        });
    
        it("Should fail if sender doesn't have enough tokens", async function () {
          const { Funge, owner, addr1 } = await loadFixture(
            deployFungeFixture
          );
          const initialOwnerBalance = await Funge.balanceOf(owner.address);
    
          // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
          // `require` will evaluate false and revert the transaction.
          await expect(
            Funge.connect(addr1).transfer(owner.address, 1)
          ).to.be.reverted;
    
          // Owner balance shouldn't have changed.
          expect(await Funge.balanceOf(owner.address)).to.equal(
            initialOwnerBalance
          );
        });
        it("Should update balances after transfers", async function () {
            const { Funge, owner, addr1, addr2 } = await loadFixture(
                deployFungeFixture
            );
			const initialOwnerBalance = await Funge.balanceOf(owner.address);

			// Transfer 100 tokens from owner to addr1.
			await Funge.transfer(addr1.address, 100);

			// Transfer another 50 tokens from owner to addr2.
			await Funge.transfer(addr2.address, 50);

			// Check balances.
			const finalOwnerBalance = await Funge.balanceOf(owner.address);
			expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

			const addr1Balance = await Funge.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(100);

			const addr2Balance = await Funge.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});
    });

});