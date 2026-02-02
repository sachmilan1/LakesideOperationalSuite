import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, SafeAreaView, ImageBackground } from "react-native";
import { useState } from "react";
import { db } from "../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

export default function Add() {
  const inventoryCollectionRef = collection(db, "inventory");

  const [name, setName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [inStock, setInStock] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState([]);

  const [showPicker, setShowPicker] = useState(false);
  const [showPicker2, setShowPicker2] = useState(false);

  const submit = async () => {
    const temp = name.trim().toLowerCase().split(" ");
    try {
      await addDoc(inventoryCollectionRef, {
        name,
        partNumber,
        inStock: parseInt(inStock),
        location,
        type,
        tags: temp,
      });
      Alert.alert("Success", "Part added successfully");
      setName("");
      setPartNumber("");
      setInStock("");
      setLocation("");
      setType("");
      setTags([]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add part");
    }
  };

  return (
    <ImageBackground
      source={require("../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Add Inventory</Text>

            <Text style={styles.label}>Name*</Text>
            <TextInput
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.label}>Part Number</Text>
            <TextInput
              placeholder="Enter part number"
              value={partNumber}
              onChangeText={setPartNumber}
              style={styles.input}
            />

            <Text style={styles.label}>In Stock</Text>
            <TextInput
              placeholder="Enter quantity"
              value={inStock}
              onChangeText={setInStock}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              onPress={() => setShowPicker(!showPicker)}
              style={styles.pickerToggle}
            >
              <Text style={styles.pickerToggleText}>{type ? type : "Select Type"}</Text>
            </TouchableOpacity>

            {showPicker && (
              <Picker
                selectedValue={type}
                onValueChange={(itemValue) => {
                  setType(itemValue);
                  setShowPicker(false);
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

            <TouchableOpacity
              onPress={() => setShowPicker2(!showPicker2)}
              style={styles.pickerToggle}
            >
              <Text style={styles.pickerToggleText}>{location ? location : "Location"}</Text>
            </TouchableOpacity>

            {showPicker2 && (
              <Picker
                selectedValue={location}
                onValueChange={(itemValue) => {
                  setLocation(itemValue);
                  setShowPicker2(false);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select location..." value="" enabled={false} />
                {["A", "B", "C", "D"].flatMap((row) =>
                  [1, 2, 3, 4].map((num) => (
                    <Picker.Item
                      key={`${row}${num}`}
                      label={`${row}${num}`}
                      value={`${row.toLowerCase()}${num}`}
                    />
                  ))
                )}
                <Picker.Item label="Front Room Table" value="frontRoomTable" />
                <Picker.Item label="Shop Back Wall" value="shopBackWall" />
                <Picker.Item label="Seacan" value="seacan" />
              </Picker>
            )}

            <TouchableOpacity style={styles.button} onPress={submit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.replace("/shop/inventory/InventoryMain");
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#111827",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#111827",
  },
  pickerToggle: {
    borderWidth: 1,
    padding: 30,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: "100%",
  },
  pickerToggleText: {
    color: "rgb(0,0,0)",
  },
  picker: {
    width: "100%",
    backgroundColor: "rgb(126, 109, 109)",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#d50000", // sharp red
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
