import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from "react-native";
import { useState } from "react";
import { db } from "../../../../FirebaseConfig";
import {
  collection,
  addDoc
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";

export default function AddWorkOrder(){

    const {collectionName} = useLocalSearchParams();
    console.log(collectionName+"qwer");
    const workOrderCollectionRef = collection(db, collectionName);

    const[date,setDate] = useState("");
    const[location, setLocation] = useState("");
    const[description, setDescription] = useState("");
    const[plateNumber, setPlateNumber] = useState("");
    const[vin, setVin] = useState("");
    const[kmsorHours, setkmsOrHours] = useState(0.0);
    const[completedBy, setCompletedBy] = useState("");
    const[problem, setProblem] = useState("");
    

    const submit= async()=>{
        if(date.trim()=="" || location.trim()==""|| description.trim()==""|| plateNumber.trim() == ""&& !kmsorHours && isNaN(kmsorHours)&& completedBy.trim()==""){
            Alert.error("Error","Please fill in the required fiels");
            return;
        }
        try{
            await addDoc(workOrderCollectionRef,{
                //here i am using short Hand referencing,
                //if the key value pair in firsbase are named same
                //then we can simply use the key for value as well
            date,
            location,
            description,
            plateNumber,
            vin,
            kmsorHours,
            completedBy
            });
            
            Alert.alert("Success", "WorkOrder added successfully");
        }
        catch(error){
            Alert.alert("Error","Failed to add workOrder");
        }
    }


    return(
        <View style={{backgroundColor:'rgb(255,255,255)'}}>
            <Text>Please fill in the required fields</Text>

            <View>
                <Text>Date*</Text>
                <TextInput
                placeholder="Date"
                value={date}
                onChangeText={setDate}></TextInput>

                <Text>Repair Location*</Text>
                <TextInput
                placeholder="Repair Location*"
                value={location}
                onChangeText={setLocation}></TextInput>
            
                <Text>Equipment Description*</Text>
                <TextInput
                placeholder="Equipment Description"
                value={description}
                onChangeText={setDescription}></TextInput>
            
                <Text>Plate Number*</Text>
                <TextInput
                placeholder="Plate Number"
                value={plateNumber}
                onChangeText={setPlateNumber}></TextInput>
            
                <Text>Vin/ Serial Number</Text>
                <TextInput
                placeholder="Vin/ Serial Number"
                value={vin}
                onChangeText={setVin}></TextInput>

                <Text>Kms/ Machine Hours*</Text>
                <TextInput
                placeholder="Kms/ Machine Hours"
                value={kmsorHours}
                onChangeText={setkmsOrHours}
                ></TextInput>

                <Text>Completed By*</Text>

                <TextInput
                placeholder="Completed By"
                value={completedBy}
                onChangeText={setCompletedBy}></TextInput>

                <TouchableOpacity
                onPress={()=>{submit()}}
                >
                    <Text>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}