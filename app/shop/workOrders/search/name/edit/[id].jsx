// app/shop/workOrders/search/name/edit/[id].jsx
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { db } from "../../../../../../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { BlurView } from "expo-blur";

export default function EditWorkOrder() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form fields
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [vin, setVin] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [kmsorHours, setKmsorHours] = useState("");
  const [problem, setProblem] = useState("");
  const [repair, setRepair] = useState("");
  const [description, setDescription] = useState("");
  const [completedBy, setCompletedBy] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const ref = doc(db, "maintenance_records", String(id));
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        Alert.alert("Not found", "This work order does not exist.");
        router.back();
        return;
      }
      const data = snap.data();

      setDate(data?.date ?? "");
      setLocation(data?.location ?? "");
      setVin(data?.vin ?? "");
      setPlateNumber(data?.plateNumber ?? "");
      setKmsorHours(data?.kmsorHours?.toString?.() ?? "");
      setProblem(data?.problem ?? "");
      setRepair(data?.repair ?? "");
      setDescription(data?.description ?? "");
      setCompletedBy(data?.completedBy ?? "");
    } catch (e) {
      Alert.alert("Error", e?.message ?? "Failed to load work order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!date) {
      Alert.alert("Missing date", "Please enter a date (YYYY-MM-DD).");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "workOrders", String(id)); // keeping your original target collection
      await updateDoc(ref, {
        date,
        location,
        vin,
        plateNumber,
        kmsorHours: kmsorHours === "" ? null : Number(kmsorHours),
        problem,
        repair,
        description,
        completedBy,
      });
      Alert.alert("Saved", "Work order updated.");
      router.back();
    } catch (e) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground source={require("../../../../../../logo.png")} style={{ flex: 1 }} resizeMode="cover">
        <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#d50000" />
          </View>
        </BlurView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("../../../../../../logo.png")} style={{ flex: 1 }} resizeMode="cover">
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>Edit Work Order</Text>

              <Field label="Date (YYYY-MM-DD)">
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="2025-08-08"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="Location">
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Central"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="VIN">
                <TextInput
                  value={vin}
                  onChangeText={setVin}
                  placeholder="123490088"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="Plate Number">
                <TextInput
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholder="SS13"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="KMs / Hours">
                <TextInput
                  value={kmsorHours}
                  onChangeText={setKmsorHours}
                  placeholder="1234"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="Problem">
                <TextInput
                  value={problem}
                  onChangeText={setProblem}
                  placeholder="Service"
                  style={[styles.input, styles.multiline]}
                  multiline
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="Repair">
                <TextInput
                  value={repair}
                  onChangeText={setRepair}
                  placeholder="Did Service"
                  style={[styles.input, styles.multiline]}
                  multiline
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="Description">
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Short description…"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <Field label="Completed By">
                <TextInput
                  value={completedBy}
                  onChangeText={setCompletedBy}
                  placeholder="Sachmilan"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </Field>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.primary]} onPress={save} disabled={saving} activeOpacity={0.9}>
                  <Text style={styles.btnText}>{saving ? "Saving…" : "Save"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => router.back()} disabled={saving} activeOpacity={0.9}>
                  <Text style={[styles.btnText, { color: "#111827" }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const Field = ({ label, children }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  container: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12, color: "#111827", textAlign: "center" },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: "700" },

  input: {
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#111827",
  },
  multiline: { height: 100, textAlignVertical: "top" },

  actions: { flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "center" },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primary: { backgroundColor: "#d50000" }, // sharp red
  ghost: { backgroundColor: "rgba(255,255,255,0.95)", borderWidth: 1, borderColor: "rgba(229,231,235,0.9)" },
  btnText: { color: "#fff", fontWeight: "800" },
});
