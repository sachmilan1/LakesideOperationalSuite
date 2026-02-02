import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

export default function SearchMain() {
  return (
    <ImageBackground
      source={require("../../../logo.png")} // <-- adjust if needed
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Search Work Orders</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/shop/workOrders/search/byName")}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Search By Name</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/shop/workOrders/search/byVin")}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Search By Vin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.back]}
              onPress={() => router.replace("/shop/workOrders/WorkOrderMain")}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#111827", marginBottom: 32, textAlign: "center" },
  button: {
    backgroundColor: "#d50000",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "75%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  back: { backgroundColor: "#ef4444" },
  buttonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
