import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

export default function ByName() {
  const [name, setName] = useState("");

  const search = () => {
    const newName = name.toLowerCase();
    console.log("The value of name is " + newName);
    try {
      router.replace({
        pathname: "/shop/inventory/lookForParts/byName/[name]",
        params: { name: newName }, 
      });
    } catch (error) {
      console.log("Error in the search function of by Name");
      console.error(error);
    }
  };

  return (
    <ImageBackground
      source={require("../../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={60} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.container}>
              <Text style={styles.title}>Search by Name</Text>
              <Text style={styles.subtitle}>Enter a part name to view results</Text>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Part Name</Text>
                <TextInput
                  placeholder="Enter the Part Name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={search}
                  style={styles.input}
                />
              </View>

              <TouchableOpacity onPress={search} activeOpacity={0.85} style={styles.searchBtn}>
                <Text style={styles.searchText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=>router.replace('/shop/inventory/InventoryMain')} activeOpacity={0.85} style={styles.cancelBtn}>
                <Text style={styles.searchText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20, textAlign: "center" },
  inputWrap: { marginBottom: 14 },
  label: { color: "#6B7280", marginBottom: 8, fontSize: 13 },
  input: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#111827",
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: "#d50000", // sharp red
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  cancelBtn: {
    backgroundColor: "#ef4444", // sharp red
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  searchText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});
