import { View, Text, FlatList, Pressable, Alert, StyleSheet, SafeAreaView, ImageBackground,TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { db } from "../../../../../FirebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function Name() {
  const { name } = useLocalSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    setLoading(true);
    try {
      const inventoryReference = collection(db, "inventory");
      const q = query(inventoryReference, where("tags", "array-contains", name));
      const dataSnap = await getDocs(q);
      const filteredData = dataSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setData(filteredData);
    } catch (error) {
      console.log("Error in getData function of [name].jsx");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (name) getData();
    }, [name])
  );

  const updateStock = async (docId, newStock) => {
    try {
      const docRef = doc(db, "inventory", docId);
      await updateDoc(docRef, { inStock: newStock });
      getData();
      Alert.alert("Success", "Item Stock updated successfully");
    } catch (error) {
      console.log("Error in updateStock function of [name].jsx");
      console.error(error);
      Alert.alert("Error", "Failed to update stock");
    }
  };

  const deleteItem = async (docId) => {
    try {
      const docRef = doc(db, "inventory", docId);
      await deleteDoc(docRef);
      router.replace("/shop/inventory/searchInventory");
      Alert.alert("Success", "Item deleted successfully");
    } catch (error) {
      console.log("Error in delete function of [name].jsx");
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        Alert.alert("Select an Action", "What would you like to do?", [
          {
            text: "Take one out",
            onPress: () => {
              if (item.inStock > 0) {
                updateStock(item.id, item.inStock - 1);
              } else {
                Alert.alert("Error", "Item is already out of stock");
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
              Alert.alert("Confirm", "Do you really want to delete this item?", [
                { text: "Yes", onPress: () => deleteItem(item.id) },
                { text: "No" },
              ]),
          },
          { text: "Cancel",
            onPress:()=>{
                
            }
          },
        ]);
      }}
    >
      <View>
        <Text style={styles.rowText}>
          Name: <Text style={styles.value}>{item.name}</Text>
        </Text>
        <Text style={styles.rowText}>
          Location: <Text style={styles.value}>{item.location}</Text>
        </Text>
        <Text style={styles.rowText}>
          In Stock: <Text style={styles.value}>{item.inStock}</Text>
        </Text>
        <Text style={styles.rowText}>
          Type: <Text style={styles.value}>{item.type}</Text>
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ImageBackground
      source={require("../../../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={40} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.center}>
              <Text style={styles.centerText}>Loading...</Text>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.centerText}>No items found with tag: {name}</Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={{ paddingVertical: 12 }}
              />

              <TouchableOpacity
              onPress={()=>{
                router.replace('/shop/inventory/InventoryMain')
              }}
              style={[styles.actionBtn,styles.primary]}>
                <Text style={styles.actionTextPrimary}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
              onPress={()=>{
                router.replace('/main/userId')
              }}
              style={[styles.actionBtn,styles.back]}>
                <Text style={styles.actionTextPrimary}>Home</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  listWrap: { flex: 1, paddingHorizontal: 12 },
  card: {
    padding: 16,
    marginHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  rowText: { fontSize: 16, marginBottom: 5, color: "#111827", fontWeight: "700" },
  value: { fontWeight: "400", color: "#374151" },
  separator: { height: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  centerText: { color: "#ffffff", fontSize: 16, textAlign: "center" },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    margin:5
  },
  primary: { backgroundColor: "#d50000" },
  actionTextPrimary: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  back:{backgroundColor:"#ef4444"},

});
