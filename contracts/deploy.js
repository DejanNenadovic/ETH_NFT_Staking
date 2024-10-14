const { ethers } = require("hardhat");
const hre = require("hardhat");
const { verify } = require("./verify");
const fs = require('fs');
const fse = require("fs-extra");

function getAmountInWei(amount) {
  return ethers.utils.parseEther(amount.toString(), "ether")
}

async function main() {
  const deploynetwork = hre.network.name;

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:" +  deployer.address + "   network:   " + deploynetwork);

  const maxPerTx = 5
  const cost = getAmountInWei(0.01);
  
  const totalsupply = 20;
  const uriBase = "ipfs://QmeHfivPyobBjSXtVUv2VHCMmugDRfZ7Qv7QfkrG4BWLQz";

  const KryptoPunckNFT = await ethers.getContractFactory("KryptoNFT");
  const KryptoPunckNFTContract = await KryptoPunckNFT.connect(deployer).deploy(maxPerTx, cost, totalsupply);

  await KryptoPunckNFTContract.deployed();

  const set_tx = await KryptoPunckNFTContract.setUriBase(uriBase);
  await set_tx.wait();

  console.log("##### KryptoNFTContract is deployed", KryptoPunckNFTContract.address);

  const KryptoPunksToken = await ethers.getContractFactory("KryptoToken");
  const KryptoPunksTokenContract = await KryptoPunksToken.connect(deployer).deploy();

  await KryptoPunksTokenContract.deployed();

  console.log("##### KryptoTokenContract is deployed : ", KryptoPunksTokenContract.address);

  const stakingVault = await ethers.getContractFactory("KryptoVault");
  const StakingContract = await stakingVault.connect(deployer).deploy(KryptoPunckNFTContract.address, KryptoPunksTokenContract.address);

  await StakingContract.deployed();

  const stakingAddr = await StakingContract.address;

  const control_tx = await KryptoPunksTokenContract.setController(stakingAddr, true);
  await control_tx.wait();

  console.log("KryptoVaultContract is deployed at:", stakingAddr);

  /* transfer contracts addresses & ABIs to the front-end */
  if (fs.existsSync("../front-end/src")) {

    fs.rmSync("../src/artifacts", { recursive: true, force: true });

    fse.copySync("./artifacts/contracts", "../front-end/src/artifacts")

    fs.writeFileSync("../front-end/src/contracts-config.js", `
      export const stakingContractAddress = "${StakingContract.address}"
      export const nftContractAddress = "${KryptoPunckNFTContract.address}"
      export const tokenContractAddress = "${KryptoPunksTokenContract.address}"
      export const ownerAddress = "${StakingContract.signer.address}"
      export const networkDeployedTo = "${hre.network.config.chainId}"
    `)

    console.log("successfully writeFileSync!!!");
  }
  


  // const tokenaddress = await StakingContract.getAddressFromString(KryptoPunckNFTContract.address);
  // const nftaddress = await StakingContract.getAddressFromString(KryptoPunksTokenContract.address);
  // const args = [tokenaddress, nftaddress];
  await verify(stakingAddr, [KryptoPunckNFTContract.address, KryptoPunksTokenContract.address],"contracts/KryptoStaking.sol:KryptoVault");
  console.log("##### KryptoVaultContract is verified");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
