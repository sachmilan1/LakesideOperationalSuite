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

export default function ByPartNumber() {
  const [number, setNumber] = useState("");

  const search = () => {
    try {
      router.replace({
        pathname: "/shop/inventory/lookForParts/partNumber/[Number]",
        params: { Number: number },
      });
    } catch (error) {
      console.log("Error in the search function of byPartNumber");
      console.error(error);
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.container}>
              <Text style={styles.title}>Search by Part Number</Text>
              <Text style={styles.subtitle}>
                Enter a part number to view results
              </Text>

              <View style={styles.inputWrap}>
                <Text style={styles.label}>Part Number</Text>
                <TextInput
                  placeholder="Enter the Part Number"
                  placeholderTextColor="#9CA3AF"
                  value={number}
                  onChangeText={setNumber}
                  style={styles.input}
                  returnKeyType="search"
                  onSubmitEditing={search}
                />
              </View>

              <TouchableOpacity
                style={styles.searchBtn}
                onPress={search}
                activeOpacity={0.85}
              >
                <Text style={styles.searchText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => router.replace('/shop/inventory/InventoryMain')}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, justifyContent: "center" },
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
  searchText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  backLink: { backgroundColor: "#ef4444", // sharp red
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6, },
  backText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2},
});
