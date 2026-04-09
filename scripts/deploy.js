import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const { ethers } = await hre.network.connect();

  const contract = await ethers.deployContract("AttendanceCertificate");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("Contrato desplegado en:", contractAddress);

  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  let networkName = "desconocida";
  if (chainId === 31337) {
    networkName = "localhost8546";
  } else if (chainId === 80002) {
    networkName = "amoy";
  }

  const configPath = path.join(process.cwd(), "web", "config.json");

  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  config[String(chainId)] = {
    networkName,
    contractAddress
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Configuración actualizada en ${configPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
