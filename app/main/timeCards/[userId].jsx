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
  Alert,
  ImageBackground,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

export default function TimeCardSearchUser() {
  const [userId, setUserId] = useState("");

  const onSearch = () => {
    const uid = userId.trim();
    if (!uid) {
      Alert.alert("Missing User ID", "Please enter a User ID.");
      return;
    }
    router.push({
      pathname: "/main/timeCards/cards/[userId]",
      params: { userId: uid },
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
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.card}>
                <Text style={styles.title}>Time Cards</Text>
                <Text style={styles.subtitle}>
                  Enter a User ID to view this week’s time card
                </Text>

                <Text style={styles.label}>User ID</Text>
                <TextInput
                  value={userId}
                  onChangeText={setUserId}
                  placeholder="e.g. 11111"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default" // preserve leading zeros
                  style={styles.input}
                  returnKeyType="search"
                  onSubmitEditing={onSearch}
                />

                <TouchableOpacity style={styles.button} onPress={onSearch} activeOpacity={0.9}>
                  <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/main/userId')}>
                  <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
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
  title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 6 },
  subtitle: { color: "#6B7280", marginBottom: 16 },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#d50000", // sharp red
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  backLink: { marginTop: 16,
    backgroundColor: "#ef4444", // sharp red
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center", },
});
