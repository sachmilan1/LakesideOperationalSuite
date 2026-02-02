import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

export default function MainShop() {
  return (
    <ImageBackground
      source={require("../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={60} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Shop Menu</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.replace("/shop/inventory/InventoryMain");
              }}
            >
              <Text style={styles.buttonText}>Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.replace("/shop/workOrders/WorkOrderMain");
              }}
            >
              <Text style={styles.buttonText}>Work Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.buttonHome}
              onPress={() => {
                router.replace("/main/userId");
              }}
            >
              <Text style={styles.buttonText}>Home</Text>
            </TouchableOpacity>
            
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#d50000", // sharp red
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonHome: {
    backgroundColor: "#ef4444", // sharp red
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
