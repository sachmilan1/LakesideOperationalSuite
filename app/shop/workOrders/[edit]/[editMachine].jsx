import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, FlatList, Pressable, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { db } from "../../../../FirebaseConfig";
import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  doc
} from "firebase/firestore";

export default function EditMachine(){
    const {collectionName, machineId} = useLocalSearchParams();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [vin, setVin] = useState("");
    const [location, setLocation] = useState("");

    const updateMachineData = async()=>{
      console.log("here1")
      console.log("updatedName:", name);
      console.log("updatedDescription:", description);
      console.log("updatedVin:", vin);
      console.log("updatedLocation:", location);

      if(name==""|| description==""||vin==""|| location==""){
          Alert.alert("Error","Fill all of the required fields");
          return;
      }

      const updateMachineCollectionRef = doc(db, collectionName, machineId);
      try{
        await updateDoc(updateMachineCollectionRef, {
          machineName: name,
          machineVin: vin,
          machineLocation: location,
          machineDescription: description
        })
        Alert.alert("Success", "Machine info added successfully");
      }catch(error){
        Alert.alert("Error","Error in updating machine info");
        console.error("Error in editing machine in update data function");
      }
    }

    const fetchData = async()=>{
      try{
        const machineCollectionRef = doc(db, collectionName, machineId);
        const fetchedData = await getDoc(machineCollectionRef);
        const data = fetchedData.data();
        setName(data.machineName);
        setDescription(data.machineDescription);
        setVin(data.machineVin);
        setLocation(data.machineLocation);
      }
      catch(error){
        Alert.alert("Error", "Failed to retrieve data");
        console.log("collection name: "+collectionName+" and machine id :" +machineId);
        console.error("error in edit machine file, failed to retrieve data",error)
      }
    }

    useFocusEffect(
      useCallback(()=>{
        fetchData()
      },[
        collectionName, machineId
      ])
    )

    return(
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Updating {name || "machine"} information</Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Name*</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. CAT 305E CR"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Vin*</Text>
                <TextInput
                  value={vin}
                  onChangeText={setVin}
                  placeholder="e.g. CAT0305ECXXXXX"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description*</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Short description"
                  placeholderTextColor="#999"
                  style={[styles.input, styles.multiline]}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Location*</Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Yard A — Bay 3"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.updateBtn} onPress={()=>{updateMachineData()}} activeOpacity={0.85}>
              <Text style={styles.updateText}>Update</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" }, // keep white
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 16 },
  form: { gap: 14 },
  field: { gap: 8 },
  label: { color: "#444", fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
  },
  multiline: { minHeight: 90 },
  updateBtn: {
    marginTop: 20,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  updateText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
