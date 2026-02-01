import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// TEMP in-memory SOS store
let sosAlerts = [];

// Health check
app.get("/", (req, res) => {
  res.send("HealLink backend running 🚑");
});

// Receive SOS
app.post("/sos", (req, res) => {
  const { latitude, longitude } = req.body;

  const newSOS = {
    id: Date.now(),
    latitude,
    longitude,
    status: "NEW",
    time: new Date().toISOString(),
  };

  sosAlerts.unshift(newSOS); // latest first

  console.log("SOS received:", latitude, longitude);

  res.json({ success: true });
});

// Send SOS list to dashboard
app.get("/alerts", (req, res) => {
  res.json(sosAlerts);
});

// Accept SOS
app.post("/alerts/:id/accept", (req, res) => {
  const { id } = req.params;

  sosAlerts = sosAlerts.map((alert) =>
    alert.id == id ? { ...alert, status: "ACCEPTED" } : alert
  );

  res.json({ success: true });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
