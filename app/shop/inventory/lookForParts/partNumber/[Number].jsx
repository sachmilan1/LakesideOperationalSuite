import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Pressable, ImageBackground } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { db } from "../../../../../FirebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { BlurView } from "expo-blur";

export default function Search() {
  const { Number } = useLocalSearchParams();
  const [data, setData] = useState([]);

  const look = async () => {
    try {
      const inventoryReference = collection(db, "inventory");
      const q = query(inventoryReference, where("partNumber", "==", Number));
      const snap = await getDocs(q);
      const retrievedData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(retrievedData);
    } catch (error) {
      console.log("Error in look function of [Number].jsx in inventory");
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      look();
    }, [Number])
  );

  const updateStock = async (docId, newStock) => {
    try {
      const docRef = doc(db, "inventory", docId);
      await updateDoc(docRef, { inStock: newStock });
      look();
      alert("Item Stock updated successfully");
    } catch (error) {
      console.log("Error in updateStock function of [Number].jsx");
      console.error(error);
      alert("Failed to update stock");
    }
  };

  const deleteItem = async (docId) => {
    try {
      const docRef = doc(db, "inventory", docId);
      await deleteDoc(docRef);
      router.replace("/shop/inventory/searchInventory");
      alert("Item deleted successfully");
    } catch (error) {
      console.log("Error in delete function of [Number].jsx");
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        // native Alert is fine, keeping your flow
        // (If you want custom action sheet later, say the word!)
        alert("Tap the three-dot menu in your OS alert to proceed.");
      }}
      onLongPress={() => {
        // Long-press to show actions (keeps single-tap smooth)
        // Use native Alert with actions
        // NOTE: Some platforms show only OK/Cancel — your previous pattern is retained
        // If you want a custom modal for iOS/Android parity, I can wire that up.
        global?.Alert?.alert?.(
          "Select an Action",
          "What would you like to do?",
          [
            {
              text: "Take one out",
              onPress: () => {
                if (item.inStock > 0) {
                  updateStock(item.id, item.inStock - 1);
                } else {
                  alert("Item is already out of stock");
                }
              },
            },
            { text: "Add one in", onPress: () => updateStock(item.id, item.inStock + 1) },
            {
              text: "Edit",
              onPress: () =>
                router.replace({
                  pathname: "/shop/inventory/edit/[docId]",
                  params: { docId: item.id },
                }),
            },
            {
              text: "Delete",
              onPress: () =>
                global?.Alert?.alert?.("Confirm", "Do you really want to delete this item?", [
                  { text: "Yes", onPress: () => deleteItem(item.id) },
                  { text: "No" },
                ]),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{item.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{item.location}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>In Stock</Text>
        <Text style={styles.value}>{item.inStock}</Text>
      </View>
      <View style={styles.rowNoBorder}>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{item.type}</Text>
      </View>
    </Pressable>
  );

  return (
    <ImageBackground
      source={require("../../../../../logo.png")}  // adjust path if needed
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            <Text style={styles.title}>Results</Text>
            <Text style={styles.subtitle}>
              Part Number: <Text style={styles.highlight}>{Number ?? "-"}</Text>
            </Text>

            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.listContent, data.length === 0 && { flex: 1 }]}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>No items found</Text>
                  <Text style={styles.emptyText}>Try a different part number or check your spelling.</Text>
                </View>
              }
              renderItem={renderItem}
            />

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => router.replace("/shop/inventory/searchInventory")}
              activeOpacity={0.85}
            >
              <Text style={styles.homeText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.homeBtn, { backgroundColor: '#ef4444' }]}
              onPress={() => router.replace("/main/userId")}
              activeOpacity={0.85}
            >
              <Text style={styles.homeText}>Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  highlight: { color: "#d50000", fontWeight: "800" },

  listContent: { paddingVertical: 8, gap: 12 },

  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    borderRadius: 14,
    padding: 14,
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,231,235,0.9)",
  },
  rowNoBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: { color: "#6B7280", fontSize: 13 },
  value: { color: "#111827", fontSize: 16, fontWeight: "700", maxWidth: "60%", textAlign: "right" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { color: "#111827", fontSize: 18, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "#6B7280", textAlign: "center" },

  homeBtn: {
    marginTop: 16,
    // alignSelf: "center",
    alignItems:"center",
    backgroundColor: "#d50000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  homeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
