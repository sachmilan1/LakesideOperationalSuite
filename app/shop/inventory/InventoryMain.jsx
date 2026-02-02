import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ImageBackground } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

export default function Inventory() {
  return (
    <ImageBackground
      source={require("../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.subtitle}>Browse by Category</Text>

            <View style={styles.grid}>
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.replace({
                    pathname: "/shop/inventory/search/[byType]",
                    params: { type: "Electrical" },
                  })
                }
              >
                <Text style={styles.cardText}>Electrical</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.replace({
                    pathname: "/shop/inventory/search/[byType]",
                    params: { type: "Filters" },
                  })
                }
              >
                <Text style={styles.cardText}>Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.replace({
                    pathname: "/shop/inventory/search/[byType]",
                    params: { type: "OilAndLube" },
                  })
                }
              >
                <Text style={styles.cardText}>Oil & Lube</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.replace({
                    pathname: "/shop/inventory/search/[byType]",
                    params: { type: "Shop Supplies" },
                  })
                }
              >
                <Text style={styles.cardText}>Shop Supplies</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.replace({
                    pathname: "/shop/inventory/search/[byType]",
                    params: { type: "Miscellaneous" },
                  })
                }
              >
                <Text style={styles.cardText}>Miscellaneous</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.primary]}
                onPress={() => router.replace("/shop/inventory/addInventory")}
              >
                <Text style={styles.actionTextPrimary}>Add One</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.secondary]}
                onPress={() => router.replace("/shop/inventory/searchInventory")}
              >
                <Text style={styles.actionTextSecondary}>Search</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.actionBtn, styles.back]} onPress={() => router.replace("/shop/shopMain")}>
              <Text style={styles.actionTextPrimary}>Go Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#4B5563", marginBottom: 20 },

  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)", // frosted card over blur
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    margin: "1%",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardText: { color: "#111827", fontSize: 16, fontWeight: "600" },

  actions: { marginTop: 24, gap: 12 },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    margin:5
  },
  primary: { backgroundColor: "#d50000" }, // sharp red
  back:{backgroundColor:"#ef4444"},
  secondary: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
  },
  actionTextPrimary: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  actionTextSecondary: { color: "#111827", fontSize: 16, fontWeight: "700" },

  backLink: { alignSelf: "center", paddingVertical: 20 },
  backText: { color: "#374151", fontSize: 14, textDecorationLine: "underline" },
});
