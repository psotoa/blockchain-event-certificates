import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();
  const contract = await ethers.deployContract("AttendanceRegistry");
  await contract.waitForDeployment();

  console.log("Contrato desplegado en:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
