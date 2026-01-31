import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

export default function HomeScreen() {
  const sendSOS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

await axios.post("http://192.168.14.47:5000/sos", {
  latitude,
  longitude,
});


    Alert.alert("SOS Sent", "Help is on the way");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealLink SOS</Text>

      <TouchableOpacity style={styles.button} onPress={sendSOS}>
        <Text style={styles.buttonText}>SEND SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "red",
    padding: 30,
    borderRadius: 100,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
