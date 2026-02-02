import { View, Text, TextInput, TouchableOpacity, Alert, Switch } from "react-native";
import { useState } from "react";
import { db } from "../../FirebaseConfig";
import {
  collection,
  addDoc
} from "firebase/firestore";

export default function Create() {
  const usersCollectionRef = collection(db, "users");

  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [canUserEdit, setCanUserEdit] = useState(false);

  const submitUser = async () => {
    try {
      await addDoc(usersCollectionRef, {
        name: userName,
        UserId: parseInt(userId), // cast to number
        canEdit: canUserEdit
      });

      Alert.alert("Success", "User created");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not create user");
    }
  };

  return (
    <View style={{ padding: 20 ,backgroundColor:'rgb(255, 255, 255)'}}>
      <Text>Name</Text>
      <TextInput
        placeholder="Name"
        value={userName}
        onChangeText={setUserName}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>User ID</Text>
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Can Edit?</Text>
      <Switch
        value={canUserEdit}
        onValueChange={setCanUserEdit}
        style={{ marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={submitUser}
        style={{ backgroundColor: "blue", padding: 10 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
