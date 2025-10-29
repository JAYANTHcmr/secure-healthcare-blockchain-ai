const express = require("express");
const Web3 = require("web3");
const cors = require("cors");
const bodyParser = require("body-parser");
const contract = require("../blockchain/build/contracts/PatientRecords.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to Ganache local blockchain
const web3 = new Web3("http://127.0.0.1:7545");

// Replace with your deployed contract address
const contractAddress = "0x4a9E0E403d984AcDeE55C01FC08eeD2068e59B50";
const contractInstance = new web3.eth.Contract(contract.abi, contractAddress);

// Get available accounts
let account;
web3.eth.getAccounts().then((acc) => {
  account = acc[0];
  console.log("✅ Connected account:", account);
});

// API to add patient record
app.post("/addRecord", async (req, res) => {
  const { name, age, diagnosis } = req.body;

  try {
    await contractInstance.methods
      .addRecord(name, age, diagnosis)
      .send({ from: account, gas: 3000000 });

    res.json({ success: true, message: "Record added successfully!" });
  } catch (error) {
    console.error("❌ Error adding record:", error);
    res.status(500).json({ success: false, message: "Failed to add record" });
  }
});

// API to fetch patient record by address
app.get("/getRecord/:address", async (req, res) => {
  try {
    const record = await contractInstance.methods
      .getRecord(req.params.address)
      .call();

    res.json({
      name: record[0],
      age: record[1],
      diagnosis: record[2],
    });
  } catch (error) {
    console.error("❌ Error fetching record:", error);
    res.status(500).json({ success: false, message: "Failed to fetch record" });
  }
});

// Start the server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
