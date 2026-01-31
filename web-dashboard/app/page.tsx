"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchAlerts = async () => {
    const res = await fetch("http://localhost:5000/alerts");
    const data = await res.json();
    setAlerts(data);
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>🏥 HealLink – Hospital Dashboard</h1>

      {alerts.length === 0 ? (
        <p>No SOS alerts</p>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              border: "1px solid #ccc",
              padding: 20,
              marginTop: 20,
            }}
          >
            <p><b>Status:</b> {alert.status}</p>
            <p><b>Time:</b> {alert.time}</p>

            {/* MAP VIEW */}
            <iframe
              width="100%"
              height="250"
              style={{ border: 0, marginTop: 10 }}
              loading="lazy"
              src={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}&z=15&output=embed`}
            ></iframe>

            <div style={{ marginTop: 10 }}>
              <button style={{ marginRight: 10 }}>Accept</button>
              <button>Standby</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
