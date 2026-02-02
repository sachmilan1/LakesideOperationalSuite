import { View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ImageBackground, KeyboardAvoidingView, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState } from "react";

export default function LookUP() {
  const [toSearch, setToSearch] = useState("");

  const handleSearch = () => {
    if (!toSearch.trim()) return;
    router.replace({
      pathname: "/main/machineLookUp/search/[toSearch]",
      params: {
        toSearch: toSearch.toUpperCase(),
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../../logo.png")}
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
              <View style={styles.card}>
                <Text style={styles.title}>Machine Lookup</Text>
                <Text style={styles.subtitle}>
                  Enter machine's Name to see its location
                </Text>

                <TextInput
                  placeholder="Name or Description"
                  placeholderTextColor="#9CA3AF"
                  value={toSearch}
                  onChangeText={setToSearch}
                  style={styles.input}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSearch}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={styles.buttonCancel}
                onPress={()=>router.replace('/main/userId')}
                activeOpacity={0.9}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#d50000", // sharp red
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    margin:5
  },
  buttonCancel:{
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    margin:5
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
});
