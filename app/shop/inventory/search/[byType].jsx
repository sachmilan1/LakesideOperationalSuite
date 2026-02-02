import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Pressable, FlatList, SafeAreaView, ImageBackground } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { db } from "../../../../FirebaseConfig";

import {
  collection,
  getDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  deleteDoc, // <-- added
} from "firebase/firestore";
import { BlurView } from "expo-blur";

export default function ShowByType() {
  const { type } = useLocalSearchParams();
  const [filteredData, setFilteredData] = useState([]);

  const getData = async () => {
    const inventoryReference = collection(db, "inventory");
    const q = query(inventoryReference, where("type", "==", type));
    try {
      const data = await getDocs(q);
      const tempData = data.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setFilteredData(tempData);
    } catch (error) {
      console.error("Error in getData function of [byType].jsx of inventory");
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [type])
  );

  const updateStock = async (docId, newStock) => {
    try {
      const docRef = doc(db, "inventory", docId);
      await updateDoc(docRef, { inStock: newStock });
      getData();
      Alert.alert("Success", "Stock updated successfully");
    } catch (error) {
      console.error("Error updating stock:", error);
      Alert.alert("Error", "Failed to update stock");
    }
  };

  const deleteItem = async (docId) => {
    try {
      const docRef = doc(db, "inventory", docId);
      await deleteDoc(docRef);
      getData();
      Alert.alert("Success", "Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  return (
    <ImageBackground
      source={require("../../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Fixed header with Go Back button */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#d50000",
                padding: 10,
                borderRadius: 8,
                marginRight: 15,
              }}
              onPress={() => {
                router.replace("/shop/inventory/InventoryMain");
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Go Back</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>
              {type} Parts
            </Text>
          </View>

          <View style={styles.container}>
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.docId}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.itemContainer}
                  onPress={() => {
                    Alert.alert("Select Action", "What would you like to do?", [
                      {
                        text: "Edit",
                        onPress: () => {
                          router.push({
                            pathname: "/shop/inventory/edit/[docId]",
                            params: { docId: item.docId },
                          });
                        },
                      },
                      {
                        text: "Take One Out",
                        onPress: () => {
                          if (item.inStock > 0) {
                            updateStock(item.docId, item.inStock - 1);
                          } else {
                            Alert.alert("Error", "No items in stock");
                          }
                        },
                      },
                      {
                        text: "Add One In",
                        onPress: () => {
                          updateStock(item.docId, item.inStock + 1);
                        },
                      },
                      {
                        text: "Delete",
                        onPress: () => {
                          Alert.alert("Confirm", "Are You Sure", [
                            { text: "Yes", onPress: () => deleteItem(item.docId) },
                            { text: "No", style: "cancel" },
                          ]);
                        },
                        style: "destructive",
                      },
                      { text: "Cancel", style: "cancel" },
                    ]);
                  }}
                >
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemText}>
                      Name: <Text style={styles.itemValue}>{item.name}</Text>
                    </Text>

                    <Text style={styles.itemText}>
                      Part Number:{" "}
                      <Text style={styles.itemValue}>{item.partNumber}</Text>
                    </Text>

                    <Text style={styles.itemText}>
                      In Stock: <Text style={styles.itemValue}>{item.inStock}</Text>
                    </Text>

                    <Text style={styles.itemText}>
                      Location: <Text style={styles.itemValue}>{item.location}</Text>
                    </Text>
                  </View>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  itemDetails: {
    gap: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
  },
  itemValue: {
    fontWeight: "400",
    color: "#374151",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(229,231,235,0.8)",
    marginVertical: 5,
  },
});
