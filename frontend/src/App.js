import React, { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const [myRecord, setMyRecord] = useState(null);


  // Admin inputs
  const [adminDoctorAddress, setAdminDoctorAddress] = useState("");
  const [adminPatientAddress, setAdminPatientAddress] = useState("");

  // Doctor inputs
  const [doctorPatientAddress, setDoctorPatientAddress] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const [aiResult, setAiResult] = useState(null);

  // Roles
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);

  useEffect(() => {
    loadBlockchain();
  }, []);

  const loadBlockchain = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const contractAddress = "0x06Ed47Db4085d8Df64012B523CFe03bF7cc458a8";
    const abi = await (await fetch("/PatientRecords.json")).json();

    const deployedContract = new web3.eth.Contract(abi.abi, contractAddress);
    setContract(deployedContract);

    const admin = await deployedContract.methods.admin().call();
    setIsAdmin(admin.toLowerCase() === accounts[0].toLowerCase());

    setIsDoctor(await deployedContract.methods.doctors(accounts[0]).call());
    setIsPatient(await deployedContract.methods.patients(accounts[0]).call());
  };

  // ---------------- ADMIN ACTIONS ----------------
  const registerDoctor = async () => {
    if (!Web3.utils.isAddress(adminDoctorAddress)) {
      alert("Invalid doctor address");
      return;
    }
    await contract.methods
      .registerDoctor(adminDoctorAddress)
      .send({ from: account });
    alert("✅ Doctor registered");
  };

  const registerPatient = async () => {
    if (!Web3.utils.isAddress(adminPatientAddress)) {
      alert("Invalid patient address");
      return;
    }
    await contract.methods
      .registerPatient(adminPatientAddress)
      .send({ from: account });
    alert("✅ Patient registered");
  };

  // ---------------- DOCTOR ACTION ----------------
  const addRecord = async () => {
    if (!Web3.utils.isAddress(doctorPatientAddress)) {
      alert("Invalid patient wallet address");
      return;
    }

    if (!name || !age || !diagnosis) {
      alert("Fill all fields");
      return;
    }

    try {
      const ipfsRes = await axios.post(
        "http://127.0.0.1:5000/upload-report",
        { reportText: diagnosis }
      );

      const ipfsHash = ipfsRes.data.ipfsHash;

      await contract.methods
        .addRecord(
          doctorPatientAddress,
          name,
          parseInt(age),
          diagnosis,
          ipfsHash
        )
        .send({ from: account });

      const aiRes = await axios.post("http://127.0.0.1:5000/analyze", {
        age: parseInt(age),
        diagnosis,
      });

      setAiResult(aiRes.data);

      await axios.post("http://127.0.0.1:5000/save-record", {
        name,
        age,
        diagnosis,
        ipfsHash,
        risk_level: aiRes.data.risk_level,
        explanation: aiRes.data.explanation,
      });

      alert("✅ Record added successfully");
    } catch {
      alert("❌ Error while adding record");
    }
  };


  const getMyRecord = async () => {
  if (!contract) {
    alert("Contract not loaded");
    return;
  }

  try {
    const record = await contract.methods.getMyRecord().call({ from: account });

    setMyRecord({
      name: record[0],
      age: record[1],
      diagnosis: record[2],
      ipfsHash: record[3],
    });
  } catch (error) {
    alert("❌ No record found for this patient");
  }
};


  // ---------------- UI ----------------
  return (
    <div className="app-container">
      <h1>🏥 Secure Healthcare System</h1>

      <p><strong>Account:</strong> {account}</p>
      <p>
        <strong>Role:</strong>
        {isAdmin && " Admin"}
        {isDoctor && !isAdmin && " Doctor"}
        {isPatient && !isDoctor && " Patient"}
      </p>

      <div className="form-container">

        {/* ADMIN PORTAL */}
        {isAdmin && (
          <>
            <h3>🛡 Admin Portal</h3>

            <input
              placeholder="Doctor Wallet Address"
              value={adminDoctorAddress}
              onChange={(e) => setAdminDoctorAddress(e.target.value)}
            />
            <button onClick={registerDoctor}>Register Doctor</button>

            <input
              placeholder="Patient Wallet Address"
              value={adminPatientAddress}
              onChange={(e) => setAdminPatientAddress(e.target.value)}
            />
            <button onClick={registerPatient}>Register Patient</button>
          </>
        )}

        {/* DOCTOR PORTAL */}
        {!isAdmin && isDoctor && (
          <>
            <h3>🩺 Doctor Portal</h3>

            <input
              placeholder="Patient Wallet Address"
              value={doctorPatientAddress}
              onChange={(e) => setDoctorPatientAddress(e.target.value)}
            />
            <input placeholder="Patient Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            <input placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />

            <button onClick={addRecord}>Add Record</button>
          </>
        )}

        {/* PATIENT PORTAL */}
        {!isAdmin && !isDoctor && isPatient && (
  <>
    <h3>👤 Patient Portal</h3>
    <button onClick={getMyRecord}>View My Record</button>

    {myRecord && (
      <div className="patient-record">
        <p><strong>Name:</strong> {myRecord.name}</p>
        <p><strong>Age:</strong> {myRecord.age}</p>
        <p><strong>Diagnosis:</strong> {myRecord.diagnosis}</p>
        <p>
          <strong>IPFS Hash:</strong>{" "}
          <a
            href={`https://ipfs.io/ipfs/${myRecord.ipfsHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {myRecord.ipfsHash}
          </a>
        </p>
      </div>
    )}
  </>
)}


      </div>

      {aiResult && (
        <div className="ai-result">
          <h3>🧠 AI Risk Analysis</h3>
          <p><b>Risk:</b> {aiResult.risk_level}</p>
          <p><b>Explanation:</b> {aiResult.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
