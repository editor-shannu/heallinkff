import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { useRef, useState } from "react";

const BACKEND_URL = "http://192.168.14.47:5000";

export default function HomeScreen() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const pollingRef = useRef<any>(null);

  const emrData = {
    bloodGroup: "O+",
    allergies: "Penicillin",
    conditions: "Diabetes",
  };

  // ===== SOS LOGIC =====
  const sendSOS = async () => {
    try {
      setLoading(true);
      setShowConfirm(false);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const res = await axios.post(`${BACKEND_URL}/sos`, {
        latitude,
        longitude,
        emr: emrData,
      });

      setStatusText("Waiting for hospital response...");
      startPolling(res.data.sosId);
    } catch {
      Alert.alert("Error", "Unable to send SOS");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (sosId: number) => {
    pollingRef.current = setInterval(async () => {
      const res = await axios.get(`${BACKEND_URL}/alerts/${sosId}`);
      if (!res.data) return;

      if (res.data.status === "ACCEPTED") {
        clearInterval(pollingRef.current);
        setStatusText("Hospital Accepted – Help is on the way 🚑");
      }

      if (res.data.status === "STANDBY") {
        setStatusText("Hospital on Standby 🕒");
      }

      if (res.data.status === "DECLINED") {
        clearInterval(pollingRef.current);
        setStatusText("Hospital Declined – Searching another hospital");
      }
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello MEDISETTY SHANMUKHA S.S.K</Text>
          <Text style={styles.subGreeting}>How are you feeling today?</Text>
        </View>

        {/* BANNER */}
        <View style={styles.banner}>
          <Text style={styles.bannerTag}>Diabetes Association</Text>
          <Text style={styles.bannerTitle}>
            Diabetes Prevention: Lifestyle Changes That Work
          </Text>
          <Text style={styles.bannerDesc}>
            Simple dietary and exercise changes can reduce diabetes risk by 60%
          </Text>
        </View>

        {/* STATUS */}
        {statusText !== "" && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        )}

        {/* HEALTH INSIGHTS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Health Insights</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.listItem}>✔ Drink Water (6/8 glasses)</Text>
          <Text style={styles.listItem}>○ Daily Walk (3200 / 10000 steps)</Text>
          <Text style={styles.listItem}>✔ Sleep Schedule (8 hrs)</Text>
          <Text style={styles.listItem}>○ Healthy Diet (2/5 servings)</Text>

          <Text style={styles.tip}>
            💡 Tip: Complete your walk before 6 PM for better sleep quality
          </Text>
        </View>

        {/* UPCOMING APPOINTMENT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Appointment</Text>
          <Text style={styles.muted}>No upcoming appointments</Text>
        </View>

        {/* TOP HOSPITALS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Hospitals</Text>
          <Text style={styles.hospital}>
            🏥 Government General Hospital Amalapuram ⭐ 4.2
          </Text>
          <Text style={styles.hospital}>
            🏥 City General Hospital ⭐ 4.9
          </Text>
        </View>
      </ScrollView>

      {/* FLOATING SOS BUTTON */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => setShowConfirm(true)}
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* CONFIRMATION MODAL */}
      <Modal transparent visible={showConfirm} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Emergency SOS</Text>
            <Text style={styles.modalText}>
              This will notify nearby hospitals with your live location.
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#e53935" />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowConfirm(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={sendSOS}
                >
                  <Text style={{ color: "#fff" }}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb" },

  header: { padding: 20 },
  greeting: { fontSize: 20, fontWeight: "bold" },
  subGreeting: { color: "#555" },

  banner: {
    backgroundColor: "#4c8bf5",
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  bannerTag: { color: "#dbe6ff", fontSize: 12 },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  bannerDesc: { color: "#eaf0ff", fontSize: 13 },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#4c8bf5",
    borderRadius: 10,
  },

  listItem: { fontSize: 14, marginBottom: 6 },
  tip: { marginTop: 10, fontSize: 12, color: "#4c8bf5" },
  muted: { color: "#777", fontSize: 13 },
  hospital: { fontSize: 14, marginBottom: 8 },

  statusBox: {
    backgroundColor: "#fff3cd",
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },
  statusText: { textAlign: "center", fontWeight: "600" },

  sosButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  sosText: { color: "#fff", fontWeight: "bold", fontSize: 18 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { color: "#555", marginBottom: 20 },

  modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { padding: 10, marginRight: 10 },
  confirmBtn: {
    padding: 10,
    backgroundColor: "#e53935",
    borderRadius: 8,
  },
});