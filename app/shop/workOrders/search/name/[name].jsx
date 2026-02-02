import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useCallback, useState } from "react";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { db } from "../../../../../FirebaseConfig";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { BlurView } from "expo-blur";

export default function WorkOrdersByName() {
  const { name } = useLocalSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!name) return;
    setLoading(true);
    try {
      const q = query(collection(db, "maintenance_records"), where("plateNumber", "==", name));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(data);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to load work orders");
    } finally {
      setLoading(false);
    }
  }, [name]);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete work order?",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "maintenance_records", id));
              await fetchOrders();
              Alert.alert("Deleted", "Work order removed.");
            } catch (e) {
              Alert.alert("Delete failed", e?.message ?? "Unknown error");
            }
          },
        },
      ]
    );
  };

  const onCardPress = (item) => {
    Alert.alert(
      "Choose an action",
      `What do you want to do with "${item.plateNumber}"?`,
      [
        {
          text: "See",
          onPress: () =>
            router.push({
              pathname: "/shop/workOrders/search/name/see/[id]",
              params: { id: item.id },
            }),
        },
        {
          text: "Edit",
          onPress: () =>
            router.push({
              pathname: "/shop/workOrders/search/name/edit/[id]",
              params: { id: item.id },
            }),
        },
        { text: "Delete", style: "destructive", onPress: () => confirmDelete(item.id) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => onCardPress(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.date || "(No date)"}</Text>
        {item.plateNumber ? <Text style={styles.badge}>{item.plateNumber}</Text> : null}
      </View>
      <Text style={styles.subtitle}>Completed By: {item.completedBy || "Unknown"}</Text>
      {item.location ? <Text style={styles.meta}>Location: {item.location}</Text> : null}
    </Pressable>
  );

  return (
    <ImageBackground
      source={require("../../../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            {/* Header with search chip and count */}
            <View style={styles.headerRow}>
              <Text style={styles.header}>Work Orders</Text>
              <View style={styles.chips}>
                <Text style={styles.chipQuery}>{String(name || "").toUpperCase()}</Text>
                <Text style={styles.chipCount}>{orders.length}</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#d50000" />
            ) : (
              <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                  <Text style={styles.empty}>No work orders found for "{String(name || "").toUpperCase()}".</Text>
                }
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            )}

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.replace("/shop/workOrders/searchMain")}
              activeOpacity={0.85}
            >
              <Text style={styles.backText}>Back to Search</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  header: { fontSize: 20, fontWeight: "800", color: "#111827" },
  chips: { flexDirection: "row", alignItems: "center", gap: 8 },
  chipQuery: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(213,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(213,0,0,0.35)",
    color: "#b00020",
    borderRadius: 999,
    fontWeight: "800",
    overflow: "hidden",
  },
  chipCount: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(17,24,39,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.12)",
    color: "#111827",
    borderRadius: 999,
    fontWeight: "800",
    overflow: "hidden",
  },

  card: {
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardPressed: { opacity: 0.6 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "800", color: "#111827" },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#ef4444",
    color: "#fff",
    fontWeight: "800",
    overflow: "hidden",
  },
  subtitle: { fontSize: 14, color: "#374151", marginTop: 6 },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  empty: { textAlign: "center", marginTop: 20, color: "#6B7280" },

  backBtn: {
    marginTop: 12,
    alignSelf: "center",
    backgroundColor: "#d50000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  backText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
