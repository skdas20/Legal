import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy LegalDocument contract
  const LegalDocument = await ethers.getContractFactory("LegalDocument");
  const legalDocument = await LegalDocument.deploy();
  await legalDocument.waitForDeployment();
  const legalDocumentAddress = await legalDocument.getAddress();
  console.log(`LegalDocument deployed to: ${legalDocumentAddress}`);

  // Deploy DAOFactory contract
  const DAOFactory = await ethers.getContractFactory("DAOFactory");
  const daoFactory = await DAOFactory.deploy();
  await daoFactory.waitForDeployment();
  const daoFactoryAddress = await daoFactory.getAddress();
  console.log(`DAOFactory deployed to: ${daoFactoryAddress}`);

  // Deploy LegalAssistantToken contract
  const LegalAssistantToken = await ethers.getContractFactory("LegalAssistantToken");
  const legalAssistantToken = await LegalAssistantToken.deploy();
  await legalAssistantToken.waitForDeployment();
  const legalAssistantTokenAddress = await legalAssistantToken.getAddress();
  console.log(`LegalAssistantToken deployed to: ${legalAssistantTokenAddress}`);

  console.log("Deployment completed!");
  console.log({
    legalDocumentAddress,
    daoFactoryAddress,
    legalAssistantTokenAddress
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 