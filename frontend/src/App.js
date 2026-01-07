import React, { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [records, setRecords] = useState({ name: "", age: "", diagnosis: "" });
  const [aiResult, setAiResult] = useState(null);


  useEffect(() => {
    loadBlockchain();
  }, []);

  // Connect to blockchain and smart contract
  const loadBlockchain = async () => {
    if (window.ethereum) {
// 🔴 FORCE MetaMask to Ganache

    // await window.ethereum.request({
    //   method: "wallet_switchEthereumChain",
    //   params: [{ chainId: "0x539" }], // Ganache (1337)
    // });

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      // Paste your deployed contract address here 👇
      const contractAddress = "0x4B6f3190c22E9ee14fCF73e05621765EBf19735d";

      const abi = await (await fetch("/PatientRecords.json")).json();
      const deployedContract = new web3.eth.Contract(abi.abi, contractAddress);
      setContract(deployedContract);
    } else {
      alert("Please install MetaMask to use this feature!");
    }
  };

  // Function to add new patient record
const addRecord = async () => {
  if (!contract) {
    alert("Contract not loaded properly.");
    return;
  }

  try {
    // 1️⃣ Upload report to IPFS via backend
    const ipfsResponse = await axios.post(
      "http://127.0.0.1:5000/upload-report",
      {
        reportText: records.diagnosis,
      }
    );

    const ipfsHash = ipfsResponse.data.ipfsHash;

    // 2️⃣ Save data + IPFS hash on blockchain
    await contract.methods
      .addRecord(
        records.name,
        parseInt(records.age),
        records.diagnosis,
        ipfsHash
      )
      .send({ from: account });

    // 3️⃣ AI analysis
    const aiResponse = await axios.post(
      "http://127.0.0.1:5000/analyze",
      {
        age: parseInt(records.age),
        diagnosis: records.diagnosis,
      }
    );

    setAiResult(aiResponse.data);

    // 4️⃣ Save record into database
await axios.post("http://127.0.0.1:5000/save-record", {
  name: records.name,
  age: parseInt(records.age),
  diagnosis: records.diagnosis,
  ipfsHash: ipfsHash,
  risk_level: aiResponse.data.risk_level,
  explanation: aiResponse.data.explanation,
});


    alert("✅ Record added with IPFS + AI + Blockchain!");
  } catch (error) {
    console.error(error);
    alert("❌ Error while processing record");
  }
};



  return (
    <div className="app-container">
      <h1>🏥 Secure Healthcare System</h1>
      <p>Connected Account: {account}</p>

      <div className="form-container">
        <input
          type="text"
          placeholder="Patient Name"
          value={records.name}
          onChange={(e) => setRecords({ ...records, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Age"
          value={records.age}
          onChange={(e) => setRecords({ ...records, age: e.target.value })}
        />
        <input
          type="text"
          placeholder="Diagnosis"
          value={records.diagnosis}
          onChange={(e) => setRecords({ ...records, diagnosis: e.target.value })}
        />
        <button onClick={addRecord}>Add Record</button>
      </div>
      {aiResult && (
  <div className="ai-result">
    <h3>🧠 AI Risk Analysis</h3>
    <p><strong>Risk Level:</strong> {aiResult.risk_level}</p>
    <p><strong>Explanation:</strong> {aiResult.explanation}</p>
  </div>
)}

    </div>
    
  );
}

export default App;
