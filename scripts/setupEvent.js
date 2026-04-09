import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const { ethers } = await hre.network.connect();

  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  const configPath = path.join(process.cwd(), "web", "config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("No existe web/config.json. Primero haga el deploy.");
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const deployment = config[String(chainId)];

  if (!deployment?.contractAddress) {
    throw new Error(`No hay contractAddress en config.json para chainId ${chainId}`);
  }

  const inputPath = path.join(process.cwd(), "scripts", "admin", "event-input.json");
  if (!fs.existsSync(inputPath)) {
    throw new Error("No existe scripts/admin/event-input.json");
  }

  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const eventName = input.eventName?.trim();
  const claimCodes = Array.isArray(input.claimCodes) ? input.claimCodes : [];

  if (!eventName) {
    throw new Error("El campo eventName es obligatorio");
  }

  if (claimCodes.length === 0) {
    throw new Error("Debe existir al menos un claim code en event-input.json");
  }

  const sanitizedCodes = claimCodes
    .map((code) => String(code).trim())
    .filter((code) => code.length > 0);

  if (sanitizedCodes.length === 0) {
    throw new Error("Todos los claim codes están vacíos");
  }

  const codeHashes = sanitizedCodes.map((code) =>
    ethers.keccak256(ethers.toUtf8Bytes(code))
  );

  const contract = await ethers.getContractAt(
    "AttendanceCertificate",
    deployment.contractAddress
  );

  console.log("Usando contrato:", deployment.contractAddress);
  console.log("Chain ID:", chainId);
  console.log("Creando evento:", eventName);

  const tx1 = await contract.createEvent(eventName);
  const receipt1 = await tx1.wait();

  let eventId = null;

  if (receipt1?.logs?.length) {
    for (const log of receipt1.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === "EventCreated") {
          eventId = Number(parsed.args.eventId);
          break;
        }
      } catch (_) {
      }
    }
  }

  if (eventId === null) {
    throw new Error("No se pudo obtener el eventId desde los logs de createEvent");
  }

  console.log(`Evento creado con ID ${eventId}`);
  console.log("Tx createEvent:", receipt1.hash);

  const tx2 = await contract.addClaimCodes(eventId, codeHashes);
  const receipt2 = await tx2.wait();

  console.log("Claim codes cargados correctamente");
  console.log("Tx addClaimCodes:", receipt2.hash);
  console.log("Claim codes disponibles:");
  sanitizedCodes.forEach((code, index) => {
    console.log(`- [${index + 1}] ${code}`);
  });

  console.log(`\nUse este eventId en la Dapp: ${eventId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
