"use client";
import { useEffect, useState } from "react";

const BACKEND_URL = "http://192.168.14.47:5000";
// If dashboard is on another device, use your PC IP like: http://192.168.14.47:5000

export default function Dashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);

  /* 🔄 Fetch alerts */
  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/alerts`);
      const data = await res.json();
      setAlerts(data);
    } catch (e) {
      console.log("Fetch error", e);
    }
  };

  /* 🟡 Update hospital response */
  const updateStatus = async (id: number, status: string) => {
    await fetch(`${BACKEND_URL}/alerts/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchAlerts();
  };

  /* ⏱ Auto refresh */
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>🏥 HealLink – Hospital Dashboard</h1>

      {alerts.length === 0 && <p>No SOS alerts</p>}

      {alerts.map(alert => (
        <div
          key={alert.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 20,
            marginTop: 20,
            background: "#fafafa",
          }}
        >
          <h3>🚨 Emergency Alert</h3>
          <p><b>Status:</b> {alert.status}</p>
          <p><b>Time:</b> {new Date(alert.time).toLocaleString()}</p>

          {/* 📍 Map */}
          <iframe
            width="100%"
            height="200"
            style={{ borderRadius: 10, marginTop: 10 }}
            src={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}&z=15&output=embed`}
          />

          {/* 🧾 EMR */}
          {alert.emr && (
            <div style={{ marginTop: 10 }}>
              <h4>Patient EMR</h4>
              <pre style={{ background: "#eee", padding: 10, borderRadius: 8 }}>
                {JSON.stringify(alert.emr, null, 2)}
              </pre>
            </div>
          )}

          {/* 🎛 Status buttons */}
          <div style={{ marginTop: 12 }}>
            <button onClick={() => updateStatus(alert.id, "ACCEPTED")}>
              Accept
            </button>

            <button
              onClick={() => updateStatus(alert.id, "STANDBY")}
              style={{ marginLeft: 10 }}
            >
              Standby
            </button>

            <button
              onClick={() => updateStatus(alert.id, "DECLINED")}
              style={{ marginLeft: 10 }}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}