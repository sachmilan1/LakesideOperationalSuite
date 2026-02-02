import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../../FirebaseConfig";
import { ImageRef } from "expo-image";

export default function AddPicture() {
  const [fileUpload, setFileUpload] = useState(null);
  const [image, setImage] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.assets && result.assets.length > 0) {
        setFileUpload(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const uploadFile = async () => {
    if (!fileUpload) return;

    const fileRef = ref(storage, `projectFiles/${fileUpload.name}`);

    try {
      const response = await fetch(fileUpload.uri);
      const blob = await response.blob();
      await uploadBytes(fileRef, blob);
      alert("Upload successful!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed.");
    }
  };

  const pickImage = async()=>{
    try{
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(!permission.granted){
            Alert.alert("Permission denied", "We need to access your photos");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowMultipleSelection:false,
            quality:1,
            mediaTypes:"Images",
        });

        if(!result.canceled){
            setImage(result.assets[0]);
        }
    }
    catch(error){
        Alert.alert("Error", "Unable to pick image");
        console.error('Unable to pick image');
    }
  };

  const uploadImage = async()=>{
    if(!image) return;

    const response = await fetch(image.uri);
    const blob = await response.blob();

    const imageRef = ref(storage,`projectImages/${image.fileName|| Date.now()}`);

    try{
        await uploadBytes(imageRef, blob);
        Alert.alert("Success", "Image Uploaded");

    }
    catch(error){
        console.error("Error in uploading", error);
        Alert.alert("Error", "Error in uploading");
    }
  };


  return (
    <View style={{ backgroundColor: "white", padding: 20 }}>
      <TouchableOpacity onPress={pickDocument}>
        <Text>Select File</Text>
      </TouchableOpacity>

      {fileUpload && <Text>Selected: {fileUpload.name}</Text>}

      <TouchableOpacity onPress={uploadFile}>
        <Text>Upload File</Text>
      </TouchableOpacity>
    </View>
  );
}
