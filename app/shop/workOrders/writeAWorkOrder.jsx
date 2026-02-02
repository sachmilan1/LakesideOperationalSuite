import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform, SafeAreaView, ImageBackground } from "react-native";
import { useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { db } from "../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";

export default function Write() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vin, setVin] = useState("");
  const [kmsorHours, setkmsOrHours] = useState("");
  const [completedBy, setCompletedBy] = useState("");
  const [problem, setProblem] = useState("");
  const [repair, setRepair] = useState("");

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const formatDate = (d) => d.toISOString().split("T")[0]; // YYYY-MM-DD

  const submitForm = async () => {
    try {
      const formData = {
        date: formatDate(date),
        location: location.trim(),
        description: description.trim(),
        plateNumber: plateNumber.trim().toUpperCase(),
        vin: vin.trim().toUpperCase(),
        kmsorHours: parseFloat(kmsorHours) || 0,
        completedBy: completedBy.trim(),
        problem: problem.trim(),
        repair: repair.trim(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "maintenance_records"), formData);
      Alert.alert("Success", "Record saved successfully!");
      clearForm();
      // router.back();
    } catch (error) {
      console.log("Error in submitForm function of Write.jsx");
      console.error(error);
      Alert.alert("Error", "Failed to save record. Please try again.");
    }
  };

  const clearForm = () => {
    setDate(new Date());
    setLocation("");
    setDescription("");
    setPlateNumber("");
    setVin("");
    setkmsOrHours("");
    setCompletedBy("");
    setProblem("");
    setRepair("");
  };

  return (
    <ImageBackground
      source={require("../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.formContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.heading}>Write a Work Order</Text>

            <Text style={styles.label}>Date*</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
              />
            )}

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} placeholderTextColor="#9CA3AF" />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Plate Number</Text>
            <TextInput style={styles.input} placeholder="Plate Number" value={plateNumber} onChangeText={setPlateNumber} placeholderTextColor="#9CA3AF" />

            <Text style={styles.label}>VIN</Text>
            <TextInput style={styles.input} placeholder="Vehicle Identification Number" value={vin} onChangeText={setVin} placeholderTextColor="#9CA3AF" />

            <Text style={styles.label}>KMs or Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              value={kmsorHours}
              onChangeText={setkmsOrHours}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Completed By</Text>
            <TextInput
              style={styles.input}
              placeholder="Name of person who completed work"
              value={completedBy}
              onChangeText={setCompletedBy}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Problem</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Describe the problem"
              value={problem}
              onChangeText={setProblem}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Repair</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Describe the repair performed"
              value={repair}
              onChangeText={setRepair}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={submitForm}>
                <Text style={styles.primaryText}>Submit Record</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={clearForm}>
                <Text style={styles.primaryText}>Clear Form</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.primaryBtn,styles.back]} onPress={() => router.replace("/shop/workOrders/WorkOrderMain")}>
                <Text style={styles.primaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  formContainer: { padding: 20, paddingBottom: 36 },
  heading: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 12, color: "#111827" },
  label: { fontSize: 14, fontWeight: "700", marginTop: 14, marginBottom: 6, color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#111827",
  },
  multiline: { height: 100, textAlignVertical: "top" },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  dateText: { color: "#111827", fontSize: 16 },

  buttonRow: { marginTop: 24, gap: 12 },
  primaryBtn: {
    backgroundColor: "#d50000", // sharp red
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },  back:{backgroundColor:"#ef4444"},

  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
