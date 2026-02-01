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

  res.json({ success: true, sosId: newSOS.id });
});

// Send SOS list to dashboard
app.get("/alerts", (req, res) => {
  res.json(sosAlerts);
});

// Get specific SOS status
app.get("/alerts/:id", (req, res) => {
  const { id } = req.params;
  const alert = sosAlerts.find((a) => a.id == id);
  if (alert) {
    res.json(alert);
  } else {
    res.status(404).json({ error: "Alert not found" });
  }
});

// Accept SOS
// Update SOS status
app.post("/alerts/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  sosAlerts = sosAlerts.map((alert) =>
    alert.id == id ? { ...alert, status } : alert
  );

  res.json({ success: true });
});

// Get latest SOS (for user app)
app.get("/latest", (req, res) => {
  if (sosAlerts.length === 0) return res.json(null);
  res.json(sosAlerts[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});