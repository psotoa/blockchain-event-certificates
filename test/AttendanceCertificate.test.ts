import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("AttendanceCertificate", function () {
  let contract: any;
  let owner: any;
  let attendee1: any;
  let attendee2: any;

  beforeEach(async function () {
    [owner, attendee1, attendee2] = await ethers.getSigners();
    contract = await ethers.deployContract("AttendanceCertificate");
    await contract.waitForDeployment();
  });

  it("crea un evento", async function () {
    await contract.createEvent("Blockchain Meetup");
    const eventData = await contract.eventsData(0);

    expect(eventData.name).to.equal("Blockchain Meetup");
    expect(eventData.active).to.equal(true);
  });

  it("permite agregar un claim code y reclamar NFT", async function () {
    await contract.createEvent("Blockchain Meetup");

    const code = "CODIGO-123";
    const codeHash = ethers.keccak256(ethers.toUtf8Bytes(code));

    await contract.addClaimCode(0, codeHash);

    await contract.connect(attendee1).claimCertificate(0, code, "ipfs://token-1");

    expect(await contract.ownerOf(0)).to.equal(attendee1.address);
    expect(await contract.hasClaimed(0, attendee1.address)).to.equal(true);
  });

  it("rechaza un codigo invalido", async function () {
    await contract.createEvent("Blockchain Meetup");

    await expect(
      contract.connect(attendee1).claimCertificate(0, "CODIGO-MALO", "ipfs://token-1")
    ).to.be.revertedWith("Codigo invalido");
  });

  it("rechaza reutilizar el mismo codigo", async function () {
    await contract.createEvent("Blockchain Meetup");

    const code = "CODIGO-123";
    const codeHash = ethers.keccak256(ethers.toUtf8Bytes(code));

    await contract.addClaimCode(0, codeHash);

    await contract.connect(attendee1).claimCertificate(0, code, "ipfs://token-1");

    await expect(
      contract.connect(attendee2).claimCertificate(0, code, "ipfs://token-2")
    ).to.be.revertedWith("Codigo ya usado");
  });

  it("rechaza que la misma wallet reclame dos veces para el mismo evento", async function () {
    await contract.createEvent("Blockchain Meetup");

    const code1 = "CODIGO-123";
    const code2 = "CODIGO-456";

    const hash1 = ethers.keccak256(ethers.toUtf8Bytes(code1));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes(code2));

    await contract.addClaimCodes(0, [hash1, hash2]);

    await contract.connect(attendee1).claimCertificate(0, code1, "ipfs://token-1");

    await expect(
      contract.connect(attendee1).claimCertificate(0, code2, "ipfs://token-2")
    ).to.be.revertedWith("Wallet ya reclamo");
  });

  it("rechaza reclamar si el evento fue cerrado", async function () {
    await contract.createEvent("Blockchain Meetup");

    const code = "CODIGO-123";
    const codeHash = ethers.keccak256(ethers.toUtf8Bytes(code));

    await contract.addClaimCode(0, codeHash);
    await contract.closeEvent(0);

    await expect(
      contract.connect(attendee1).claimCertificate(0, code, "ipfs://token-1")
    ).to.be.revertedWith("Evento inactivo");
  });
});
