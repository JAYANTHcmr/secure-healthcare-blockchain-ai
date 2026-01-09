import sqlite3 from "sqlite3";
import { create } from "ipfs-http-client";
import express from "express";
import cors from "cors";
import axios from "axios";

/* ===================== DATABASE ===================== */

const db = new sqlite3.Database("./healthcare.db", (err) => {
  if (err) {
    console.error("❌ Database connection error", err);
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

/* ===================== IPFS ===================== */

// const ipfs = create({
//   host: "localhost",
//   port: 5001,
//   protocol: "http",
// });
const ipfs = create({
  url: "http://127.0.0.1:5001",
});


/* ===================== EXPRESS APP ===================== */

const app = express();
app.use(cors());
app.use(express.json());

/* ===================== AI SERVICE ===================== */

app.post("/analyze", async (req, res) => {
  try {
    const { age, diagnosis } = req.body;

    const aiResponse = await axios.post(
      "http://127.0.0.1:7000/predict",
      { age, diagnosis }
    );

    res.json({
      risk_level: aiResponse.data.risk_level,
      explanation: aiResponse.data.explanation,
    });
  } catch (error) {
    console.error("❌ AI service error:", error.message);
    res.status(500).json({ error: "AI service not reachable" });
  }
});

/* ===================== IPFS UPLOAD ===================== */

app.post("/upload-report", async (req, res) => {
  try {
    const { reportText } = req.body;

    if (!reportText) {
      return res.status(400).json({ error: "reportText is required" });
    }

    console.log("📤 Uploading report to IPFS...");

    const added = await ipfs.add({
      content: reportText,
    });

    const ipfsHash = added.cid.toString();

    console.log("✅ IPFS upload successful:", ipfsHash);

    res.json({ ipfsHash });
  } catch (error) {
    console.error("❌ IPFS upload failed:", error);
    res.status(500).json({ error: "IPFS upload failed" });
  }
});

/* ===================== DATABASE SAVE ===================== */
app.post("/save-record", (req, res) => {
  const { name, age, diagnosis, ipfsHash, risk_level, explanation } = req.body;

  if (!name || !age || !diagnosis || !ipfsHash) {
    return res.status(400).json({ error: "Missing required fields" });
  }


  db.run(
    `INSERT INTO patient_records 
     (name, age, diagnosis, ipfs_hash, risk_level, explanation)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, age, diagnosis, ipfsHash, risk_level, explanation],
    function (err) {
      if (err) {
        console.error("❌ DB insert failed:", err);
        return res.status(500).json({ error: "DB insert failed" });
      }

      res.json({ message: "✅ Record saved to database" });
    }
  );
});

/* ===================== SERVER START ===================== */

const PORT = 5000;
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Backend Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
