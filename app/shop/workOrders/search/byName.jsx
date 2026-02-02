import { View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ImageBackground } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { BlurView } from "expo-blur";

export default function Name() {
  const [name, setName] = useState("");
  const canSearch = name.trim().length > 0;

  const onSearch = () => {
    if (!canSearch) return;
    router.replace({
      pathname: "/shop/workOrders/search/name/[name]",
      params: { name: name.toUpperCase() },
    });
  };

  return (
    <ImageBackground
      source={require("../../../../logo.png")} // adjust if your path differs
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Search by Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />

            <TouchableOpacity
              style={[styles.button, !canSearch && { opacity: 0.6 }]}
              onPress={onSearch}
              activeOpacity={0.85}
              disabled={!canSearch}
            >
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.back]}
              onPress={() => router.replace("/shop/workOrders/searchMain")}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 20, textAlign: "center" },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "rgba(255,255,255,0.95)",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#d50000", // sharp red
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "70%",
    marginTop: 8,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  back: { backgroundColor: "#ef4444" }, // lighter red
  buttonText: { fontSize: 16, fontWeight: "800", color: "#fff" },
});
