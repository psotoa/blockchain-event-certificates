import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const { ethers } = await hre.network.connect();

  const contract = await ethers.deployContract("AttendanceCertificate");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("Contrato desplegado en:", contractAddress);

  const chainIdMap = {
    localhost8546: 31337,
    amoy: 80002
  };

  const chainId = chainIdMap[hre.network.name];
  if (!chainId) {
    throw new Error(`No hay chainId configurado para la red ${hre.network.name}`);
  }

  const configPath = path.join(process.cwd(), "web", "config.json");

  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  config[String(chainId)] = {
    networkName: hre.network.name,
    contractAddress
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Configuración actualizada en ${configPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
