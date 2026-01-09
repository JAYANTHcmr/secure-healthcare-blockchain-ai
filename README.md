# Secure Blockchain-Based Healthcare System with AI

## 📌 Project Overview
This project is a **patient-centric healthcare system** that securely stores medical records using **Blockchain** and **IPFS**, while providing **AI-driven health risk analysis**.  
The system ensures **data integrity, decentralization, and privacy**, with separate roles for patients and doctors (to be enhanced).

---

## 🛠 Tech Stack

### 🔗 Blockchain
- Ethereum (Local)
- Hardhat
- Ganache
- MetaMask
- Solidity

### 📦 Decentralized Storage
- IPFS Desktop

### 🧠 AI
- Python
- Flask
- Scikit-learn (rule-based / ML upgrade planned)

### 🖥 Backend
- Node.js
- Express.js
- SQLite
- Axios

### 🌐 Frontend
- React.js
- Web3.js
- MetaMask

---

## 📁 Project Structure

secure-healthcare-blockchain-ai/
│
├── hardhat/ # Smart contracts & deployment
│ ├── contracts/
│ ├── scripts/
│ └── hardhat.config.js
│
├── backend/ # Express backend + IPFS + DB
│ └── server.js
│
├── ai_service/ # AI microservice
│ └── app.py
│
├── frontend/ # React frontend
│ ├── src/
│ └── public/
│
└── README.md



---

## ⚙️ Prerequisites

Make sure the following are installed:

- Node.js (v18+ recommended)
- Python (3.8+)
- MetaMask browser extension
- Ganache
- IPFS Desktop

---

## 🚀 How to Run the Project (Step-by-Step)

### 1️⃣ Start Ganache
- Open Ganache GUI
- RPC: `http://127.0.0.1:7545`
- Chain ID: `1337`

---

### 2️⃣ Start IPFS
- Open **IPFS Desktop**
- Ensure status shows **Running**
- API should be available at `http://127.0.0.1:5001`

---

### 3️⃣ Deploy Smart Contract (Hardhat)

```bash
cd hardhat
npx hardhat compile
npx hardhat run scripts/deploy.js --network ganache


📌 Copy the deployed contract address and update it in:
frontend/src/App.js



4️⃣ Start AI Service

cd ai_service
venv\Scripts\activate
python app.py

✅ You should see:
Running on http://127.0.0.1:7000


5️⃣ Start Backend Server
cd backend
node server.js

✅ You should see:
Server running on port 5000

6️⃣ Start Frontend
cd frontend
npm start

The application will open at:
http://localhost:3000


🔁 Application Flow

User enters patient details in frontend

Medical report is uploaded to IPFS

IPFS hash is stored on blockchain

AI service analyzes health risk

Data is saved in SQLite database

MetaMask signs blockchain transaction



✅ Features Implemented

Blockchain-based patient record storage

IPFS medical report storage

AI-driven risk analysis

MetaMask wallet integration

SQLite database persistence

End-to-end working system



🔮 Future Enhancements

Doctor & Patient role-based portals

Smart contract access control

Advanced ML-based AI model

Enhanced error handling

Cloud deployment




🧑‍💻 Author

KADIRA_JAYANTH_REDDY
B.Tech CSE – Major Project