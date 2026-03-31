import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("AttendanceRegistry", function () {
  let contract: any;
  let owner: any;
  let attendee1: any;

  beforeEach(async function () {
    [owner, attendee1] = await ethers.getSigners();
    contract = await ethers.deployContract("AttendanceRegistry");
    await contract.waitForDeployment();
  });

  it("crea un evento", async function () {
    await contract.createEvent("Charla Blockchain");
    const eventData = await contract.eventsData(0);

    expect(eventData.name).to.equal("Charla Blockchain");
    expect(eventData.active).to.equal(true);
  });

  it("registra asistencia", async function () {
    await contract.createEvent("Charla Blockchain");
    await contract.registerAttendance(0, attendee1.address);

    expect(await contract.verifyAttendance(0, attendee1.address)).to.equal(true);
  });

  it("evita asistencia duplicada", async function () {
    await contract.createEvent("Charla Blockchain");
    await contract.registerAttendance(0, attendee1.address);

    await expect(
      contract.registerAttendance(0, attendee1.address)
    ).to.be.revertedWith("Asistencia ya registrada");
  });

  it("no registra asistencia si el evento está cerrado", async function () {
    await contract.createEvent("Charla Blockchain");
    await contract.closeEvent(0);

    await expect(
      contract.registerAttendance(0, attendee1.address)
    ).to.be.revertedWith("Evento inactivo");
  });
});
