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
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x539" }], // Ganache (1337)
    });

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      // Paste your deployed contract address here 👇
      const contractAddress = "0x4a9E0E403d984AcDeE55C01FC08eeD2068e59B50";
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
    // 1️⃣ Save record to blockchain
    await contract.methods
      .addRecord(records.name, parseInt(records.age), records.diagnosis)
      .send({ from: account });

    // 2️⃣ Send data to backend → AI
    const aiResponse = await axios.post("http://127.0.0.1:5000/analyze", {
      age: parseInt(records.age),
      diagnosis: records.diagnosis,
    });

    setAiResult(aiResponse.data);

    alert("✅ Record added successfully to blockchain!");
  } catch (error) {
    alert("❌ Error while adding record");
    console.error(error);
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
