// app/.../LookUp.jsx
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { BlurView } from "expo-blur";
import { db } from "../../../../FirebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

const yes = (v) => String(v).trim().toLowerCase() === "yes" || v === true;

const getLoc = (item) => item?.machineLocation ?? item?.location ?? "";
const getLocKey = (item) =>
  Object.prototype.hasOwnProperty.call(item || {}, "machineLocation")
    ? "machineLocation"
    : "location";

export default function LookUp() {
  const { toSearch } = useLocalSearchParams();
  const term = String(toSearch ?? "").trim();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [stage, setStage] = useState("pin");
  const [pinInput, setPinInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [working, setWorking] = useState(false);

  const pinRef = useRef(null);
  const locRef = useRef(null);

  useEffect(() => {
    if (stage === "pin") {
      locRef.current?.blur();
      setTimeout(() => pinRef.current?.focus(), 0);
    } else {
      pinRef.current?.blur();
      setTimeout(() => locRef.current?.focus(), 0);
    }
  }, [stage]);

  const search = useCallback(async () => {
    if (!term) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const machinesRef = collection(db, "machines");

      const snapName = await getDocs(
        query(machinesRef, where("machineName", "==", term))
      );
      let rows = snapName.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (rows.length === 0) {
        const snapTags = await getDocs(
          query(machinesRef, where("tags", "array-contains", term))
        );
        rows = snapTags.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      if (rows.length === 0) {
        Alert.alert("Not found", "No matching machines in the database.");
      }
      setData(rows);
    } catch (e) {
      Alert.alert("Error", e?.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }, [term]);

  useFocusEffect(useCallback(() => { search(); }, [search]));

  const checkPinPermission = async (pin) => {
    const usersRef = collection(db, "users");
    const snap = await getDocs(query(usersRef, where("UserId", "==", String(pin))));
    if (snap.empty) return { allowed: false, user: null };
    const user = { id: snap.docs[0].id, ...snap.docs[0].data() };
    const allowed = yes(user.canEdit);
    return { allowed, user };
  };

  const openPinFlow = (item) => {
    setSelectedItem(item);
    setPinInput("");
    setLocationInput(getLoc(item));
    setStage("pin");
    setModalVisible(true);
  };

  const handleContinue = async () => {
    if (stage === "pin") {
      const pin = pinInput.trim();
      if (!pin) {
        Alert.alert("PIN required", "Please enter your PIN.");
        return;
      }
      setWorking(true);
      try {
        const { allowed } = await checkPinPermission(pin);
        if (!allowed) {
          setModalVisible(false);
          Alert.alert("Access denied", "You do not have access to change location.");
          return;
        }
        setStage("location");
      } catch (e) {
        Alert.alert("Error", e?.message ?? "PIN check failed");
      } finally {
        setWorking(false);
      }
    } else {
      const newLoc = locationInput.trim();
      if (!newLoc) {
        Alert.alert("Missing location", "Please enter a new location.");
        return;
      }
      if (!selectedItem) return;

      const locKey = getLocKey(selectedItem);

      setWorking(true);
      try {
        await updateDoc(doc(db, "machines", selectedItem.id), { [locKey]: newLoc });

        setData((prev) =>
          prev.map((m) =>
            m.id === selectedItem.id ? { ...m, [locKey]: newLoc } : m
          )
        );

        setModalVisible(false);
        Alert.alert("Updated", "Location changed.");
      } catch (e) {
        Alert.alert("Update failed", e?.message ?? "Unknown error");
      } finally {
        setWorking(false);
      }
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => openPinFlow(item)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.title}>{item.machineName ?? "(No name)"}</Text>
      <Text style={styles.meta}>Location: {getLoc(item) || "—"}</Text>
      {Array.isArray(item.tags) && item.tags.length > 0 ? (
        <Text style={styles.tags}>Tags: {item.tags.join(", ")}</Text>
      ) : null}
    </Pressable>
  );

  return (
    <ImageBackground
      source={require("../../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.header}>Results for: {term || "(empty)"} </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#d50000" />
            ) : (
              <>
                <FlatList
                  data={data}
                  keyExtractor={(it) => it.id}
                  renderItem={renderItem}
                  ListEmptyComponent={<Text style={styles.empty}>No results.</Text>}
                />
                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={() => router.replace("/main/userId")}
                >
                  <Text style={styles.homeText}>Home</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* PIN -> Location modal */}
          <Modal
            transparent
            visible={modalVisible}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>
                  {stage === "pin" ? "Enter PIN" : "Change Location"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedItem?.machineName ?? selectedItem?.id ?? ""}
                </Text>

                {stage === "pin" ? (
                  <TextInput
                    key="pin"
                    ref={pinRef}
                    placeholder="PIN"
                    value={pinInput}
                    onChangeText={setPinInput}
                    style={styles.input}
                    keyboardType="number-pad"
                    secureTextEntry
                    autoFocus
                  />
                ) : (
                  <TextInput
                    key="location"
                    ref={locRef}
                    placeholder="New location"
                    value={locationInput}
                    onChangeText={setLocationInput}
                    style={styles.input}
                    keyboardType="default"
                    inputMode="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoFocus
                  />
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.ghost]}
                    onPress={() => setModalVisible(false)}
                    disabled={working}
                  >
                    <Text style={[styles.btnText, { color: "#111" }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.primary]}
                    onPress={handleContinue}
                    disabled={working}
                  >
                    <Text style={styles.btnText}>
                      {working
                        ? stage === "pin"
                          ? "Checking…"
                          : "Saving…"
                        : stage === "pin"
                        ? "Continue"
                        : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#fff" },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "white",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  meta: { marginTop: 6, color: "#111827" },
  tags: { marginTop: 6, color: "#6b7280", fontSize: 12 },
  empty: { textAlign: "center", marginTop: 20, color: "#fff" },

  // home button
  homeButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#d50000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  homeText: { color: "white", fontWeight: "700", fontSize: 16 },

  // modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "white",
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  modalSubtitle: { marginTop: 4, color: "#6b7280" },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "white",
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  primary: { backgroundColor: "#d50000" },
  ghost: { backgroundColor: "#f3f4f6" },
  btnText: { color: "white", fontWeight: "700" },
});
