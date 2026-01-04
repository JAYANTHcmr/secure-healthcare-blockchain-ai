import sqlite3 from "sqlite3";
import { create } from "ipfs-http-client";
import express from "express";
import cors from "cors";
import axios from "axios";
import Web3 from "web3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const db = new sqlite3.Database("./healthcare.db", (err) => {
  if (err) {
    console.error("Database connection error", err);
  } else {
    console.log("✅ SQLite database connected");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS patient_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    diagnosis TEXT,
    ipfs_hash TEXT,
    risk_level TEXT,
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);


const ipfs = create({
  host: "localhost",
  port: 5001,
  protocol: "http",
});


const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const { age, diagnosis } = req.body;

    const aiResponse = await axios.post(
      "http://127.0.0.1:7000/predict",
      {
        age: age,
        diagnosis: diagnosis,
      }
    );

    res.json({
      risk_level: aiResponse.data.risk_level,
      explanation: aiResponse.data.explanation,
    });
  } catch (error) {
    res.status(500).json({ error: "AI service not reachable" });
  }
});


// Needed for ES module path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Ganache (blockchain)
const web3 = new Web3("http://127.0.0.1:7545");

// Load the compiled contract
const contractPath = path.resolve(__dirname, "../blockchain/build/contracts/PatientRecords.json");
const contractJSON = JSON.parse(fs.readFileSync(contractPath));
const contractAddress = "0x4a9E0E403d984AcDeE55C01FC08eeD2068e59B50"; // your contract address here
const contract = new web3.eth.Contract(contractJSON.abi, contractAddress);

let accounts = [];
(async () => {
  accounts = await web3.eth.getAccounts();
  console.log("✅ Connected account:", accounts[0]);
})();

// ===================== Blockchain API =====================
app.post("/api/addRecord", async (req, res) => {
  try {
    const { name, age, diagnosis } = req.body;
    const result = await contract.methods.addRecord(name, age, diagnosis).send({ from: accounts[0], gas: 3000000 });
    res.json({ message: "Record added successfully", transaction: result.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Transaction failed" });
  }
});

app.post("/upload-report", async (req, res) => {
  try {
    const { reportText } = req.body;

    const result = await ipfs.add(reportText);

    res.json({
      ipfsHash: result.path,
    });
  } catch (error) {
    res.status(500).json({ error: "IPFS upload failed" });
  }
});


// ===================== AI Service Integration =====================
app.post("/api/analyze", async (req, res) => {
  try {
    const { age, diagnosis } = req.body;

    const aiResponse = await axios.post("http://127.0.0.1:7000/predict", {
      age,
      diagnosis,
    });

    res.json({
      message: "AI analysis successful",
      prediction: aiResponse.data,
    });
  } catch (error) {
    console.error("Error calling AI service:", error.message);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

app.post("/save-record", (req, res) => {
  const {
    name,
    age,
    diagnosis,
    ipfsHash,
    risk_level,
    explanation,
  } = req.body;

  db.run(
    `INSERT INTO patient_records 
     (name, age, diagnosis, ipfs_hash, risk_level, explanation)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, age, diagnosis, ipfsHash, risk_level, explanation],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "DB insert failed" });
      }
      res.json({ message: "Record saved to database" });
    }
  );
});


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
