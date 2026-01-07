async function main() {
  const PatientRecords = await ethers.getContractFactory("PatientRecords");
  const contract = await PatientRecords.deploy();

  await contract.waitForDeployment();

  console.log("PatientRecords deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
