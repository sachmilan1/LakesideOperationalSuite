import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { db } from "../../../../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { BlurView } from "expo-blur";

export default function EditInventory() {
  const { docId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [inStock, setInStock] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const [showPickerType, setShowPickerType] = useState(false);
  const [showPickerLocation, setShowPickerLocation] = useState(false);

  const fetchItem = useCallback(async () => {
    try {
      if (!docId) return;
      const ref = doc(db, "inventory", String(docId));
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        Alert.alert("Not found", "This inventory item does not exist.");
        return;
      }
      const data = snap.data();
      setName(data?.name ?? "");
      setPartNumber(data?.partNumber ?? "");
      setInStock(
        data?.inStock !== undefined && data?.inStock !== null
          ? String(data.inStock)
          : ""
      );
      setLocation(data?.location ?? "");
      setType(data?.type ?? "");
    } catch (err) {
      console.error("Failed to fetch inventory item:", err);
      Alert.alert("Error", "Failed to load inventory item.");
    }
  }, [docId]);

  useFocusEffect(
    useCallback(() => {
      fetchItem();
    }, [fetchItem])
  );

  const submitUpdate = async () => {
    try {
      if (!name.trim()) {
        Alert.alert("Missing name", "Please enter a name.");
        return;
      }
      const ref = doc(db, "inventory", String(docId));
      const tags = name.trim().toLowerCase().split(" ");

      await updateDoc(ref, {
        name,
        partNumber,
        inStock: parseInt(inStock || "0", 10) || 0,
        location,
        type,
        tags,
      });

      Alert.alert("Success", "Inventory updated successfully");
      router.replace('/shop/inventory/InventoryMain');
    } catch (err) {
      console.error("Failed to update inventory:", err);
      Alert.alert("Error", "Failed to update inventory");
    }
  };

  return (
    <ImageBackground
      source={require("../../../../logo.png")} // adjust if your path differs
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>Edit Inventory</Text>

            <Text style={styles.label}>Name*</Text>
            <TextInput
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Part Number</Text>
            <TextInput
              placeholder="Enter part number"
              value={partNumber}
              onChangeText={setPartNumber}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>In Stock</Text>
            <TextInput
              placeholder="Enter quantity"
              value={inStock}
              onChangeText={setInStock}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />

            {/* TYPE PICKER */}
            <TouchableOpacity onPress={() => setShowPickerType(!showPickerType)} style={styles.pickerToggle}>
              <Text style={styles.pickerToggleText}>{type ? type : "Select Type"}</Text>
            </TouchableOpacity>

            {showPickerType && (
              <Picker
                selectedValue={type}
                onValueChange={(val) => {
                  setType(val);
                  setShowPickerType(false);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select type..." value="" enabled={false} />
                <Picker.Item label="Electrical" value="Electrical" />
                <Picker.Item label="Filters" value="Filters" />
                <Picker.Item label="Oil & Lube" value="OilAndLube" />
                <Picker.Item label="Miscellaneous" value="Miscellaneous" />
                <Picker.Item label="Shop Supplies" value="Shop Supplies" />
              </Picker>
            )}

            {/* LOCATION PICKER */}
            <TouchableOpacity onPress={() => setShowPickerLocation(!showPickerLocation)} style={styles.pickerToggle}>
              <Text style={styles.pickerToggleText}>{location ? location : "Location"}</Text>
            </TouchableOpacity>

            {showPickerLocation && (
              <Picker
                selectedValue={location}
                onValueChange={(val) => {
                  setLocation(val);
                  setShowPickerLocation(false);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select location..." value="" enabled={false} />
                {["A", "B", "C", "D"].flatMap((row) =>
                  [1, 2, 3, 4].map((num) => (
                    <Picker.Item key={`${row}${num}`} label={`${row}${num}`} value={`${row.toLowerCase()}${num}`} />
                  ))
                )}
                <Picker.Item label="Front Room Table" value="frontRoomTable" />
                <Picker.Item label="Shop Back Wall" value="shopBackWall" />
                <Picker.Item label="Seacan" value="seacan" />
              </Picker>
            )}

            <TouchableOpacity style={styles.button} onPress={submitUpdate}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/shop/inventory/InventoryMain")} style={[styles.button,styles.back]}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#111827" },
  label: { fontSize: 16, marginTop: 10, marginBottom: 4, color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#111827",
  },
  pickerToggle: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: "100%",
    borderColor: "#E5E7EB",
  },
  pickerToggleText: { color: "#111827" },
  picker: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.95)",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#d50000", // sharp red
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
    back:{backgroundColor:"#ef4444"},

  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
