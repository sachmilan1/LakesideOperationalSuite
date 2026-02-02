// app/shop/workOrders/search/name/see/[id].jsx
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView, ImageBackground } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { db } from "../../../../../../FirebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { BlurView } from "expo-blur";

export default function SeeWorkOrder() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ref = doc(db, "maintenance_records", String(id));
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        Alert.alert("Not found", "This work order does not exist.");
        router.back();
        return;
      }
      setItem({ id: snap.id, ...snap.data() });
    } catch (e) {
      Alert.alert("Error", e?.message ?? "Failed to load work order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = () => {
    Alert.alert(
      "Delete work order?",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // NOTE: Keeping collection name as in your original code.
              // If your records live in "maintenance_records", switch this to that collection.
              await deleteDoc(doc(db, "workOrders", String(id)));
              Alert.alert("Deleted", "Work order removed.");
              router.back();
            } catch (e) {
              Alert.alert("Delete failed", e?.message ?? "Unknown error");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ImageBackground source={require("../../../../../../logo.png")} style={{ flex: 1 }} resizeMode="cover">
        <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#d50000" />
          </View>
        </BlurView>
      </ImageBackground>
    );
  }

  if (!item) return null;

  const fmtDate = (d) => {
    if (!d) return "—";
    if (typeof d?.toDate === "function") return d.toDate().toDateString();
    try { return new Date(d).toDateString(); } catch { return String(d); }
  };

  const Row = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? "—"}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../../../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Work Order</Text>

            <Row label="Date" value={item.date || fmtDate(item.createdAt)} />
            <Row label="Location" value={item.location} />
            <Row label="VIN" value={item.vin} />
            <Row label="Plate Number" value={item.plateNumber} />
            <Row label="KMs / Hours" value={item.kmsorHours} />
            <Row label="Problem" value={item.problem} />
            <Row label="Repair" value={item.repair} />
            <Row label="Description" value={item.description} />
            <Row label="Completed By" value={item.completedBy} />
            <Row label="Created At" value={fmtDate(item.createdAt)} />

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.primary]}
                onPress={() =>
                  router.push({
                    pathname: "/shop/workOrders/search/name/edit/[id]",
                    params: { id: item.id },
                  })
                }
                activeOpacity={0.9}
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.danger]} onPress={onDelete} activeOpacity={0.9}>
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => router.back()} activeOpacity={0.9}>
                <Text style={[styles.btnText, { color: "#111827" }]}>Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  container: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 4, color: "#111827", textAlign: "center" },

  row: {
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 4, fontWeight: "700" },
  value: { fontSize: 16, color: "#111827" },

  actions: { flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "center" },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primary: { backgroundColor: "#d50000" },     // sharp red
  danger: { backgroundColor: "#b00020" },      // deeper red for destructive
  ghost: { backgroundColor: "rgba(255,255,255,0.95)", borderWidth: 1, borderColor: "rgba(229,231,235,0.9)" },
  btnText: { color: "#fff", fontWeight: "800" },
});
