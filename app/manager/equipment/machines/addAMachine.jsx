import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useState } from "react";
import { db } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

export default function Add() {
  const machineCollectionRef = collection(db, "machines");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vin, setVin] = useState("");
  const [location, setLocation] = useState("");
  const [assigned, setAssigned] = useState("");
  const [type, setType] = useState("");
  const [safety, setSafety] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const submitMachine = async () => {
    try {
      await addDoc(machineCollectionRef, {
        machineName: name.toUpperCase(),
        machineDescription: description,
        machineVin: vin,
        machineLocation: location,
        machineAssigned: assigned,
        machineType: type,
        machineSafetyDate: safety
      });
      Alert.alert("Success", "Machine added successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could Not add machine");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fill the information below</Text>

      <Text style={styles.label}>Name*</Text>
      <TextInput
        style={styles.input}
        placeholder="Name*"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description*</Text>
      <TextInput
        style={styles.input}
        placeholder="Description*"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Serial Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Serial Number"
        value={vin}
        onChangeText={setVin}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Assigned To</Text>
      <TextInput
        style={styles.input}
        placeholder="Assigned To"
        value={assigned}
        onChangeText={setAssigned}
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
          onValueChange={(value) => {
            setType(value);
            setShowPicker(false);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Type..." value="" enabled={false} />
          <Picker.Item label="Light" value="Light" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Heavy" value="Heavy" />
          <Picker.Item label="Personal" value="Personal" />
          <Picker.Item label="Dump Trucks" value="Dump Trucks" />
          <Picker.Item label="Trailers" value="Trailers" />
          <Picker.Item label="Construction" value="Construction" />
        </Picker>
      )}

      <Text style={styles.label}>Safety Done on:</Text>
      <TextInput
        style={styles.input}
        placeholder="Safety Done on"
        value={safety}
        onChangeText={setSafety}
      />

      <TouchableOpacity
        onPress={() => {
          if (name.trim() !== "" && description.trim() !== "") {
            submitMachine();
          } else {
            Alert.alert("Error", "Please fill the required fields");
          }
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: "#fff",
      padding: 20,
      flex: 1
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center"
    },
    label: {
      fontSize: 16,
      marginTop: 10,
      marginBottom: 4
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 10,
      borderRadius: 6,
      marginBottom: 8
    },
    pickerToggle: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 10,
      borderRadius: 6,
      marginBottom: 8,
      backgroundColor: "#f0f0f0"
    },
    pickerToggleText: {
      color: "#333"
    },
    picker: {
      backgroundColor: "#f9f9f9",
      borderRadius: 6,
      marginBottom: 8
    },
    button: {
      backgroundColor: "#007bff",
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16
    }
  });
  