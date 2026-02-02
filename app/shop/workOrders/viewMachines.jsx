import { View, Text, TouchableOpacity, Alert, StyleSheet, FlatList, Pressable, SafeAreaView } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";
import { db } from "../../../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function ViewMachines() {
  const [machineList, setMachineList] = useState([]);
  const machineCollectionRef = collection(db, "machines");

  const getMachineList = async () => {
    try {
      const data = await getDocs(machineCollectionRef);
      const retrievedData = data.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      }));
      setMachineList(retrievedData);
    } catch (error) {
      Alert.alert("Error", "Error in fetching machine's data");
      console.error("error in viewMachine file");
    }
  };

  useFocusEffect(useCallback(() => { getMachineList(); }, []));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>All Machines</Text>

        <FlatList
          data={machineList}
          keyExtractor={(item) => item.docId}
          contentContainerStyle={[styles.listContent, machineList.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No machines found</Text>
              <Text style={styles.emptyText}>Add a machine to see it here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                Alert.alert("Select Action", "What would you like to do?", [
                  {
                    text: "Edit Machine",
                    onPress: () => {
                      router.push({
                        pathname: "/shop/workOrders/[edit]/[editMachine]",
                        params: {
                          collectionName: "machines",
                          machineId: item.docId,
                        },
                      });
                    },
                  },
                  {
                    text: "Add work order",
                    onPress: () => {
                      router.push({
                        pathname: "/shop/workOrders/makeWorkOrder/[createWorkOrder]",
                        params: {
                          collectionName: item.machineName,
                        },
                      });
                    },
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{item.machineName}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>VIN / Serial</Text>
                <Text style={styles.value}>{item.machineVin}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>{item.machineDescription}</Text>
              </View>

              <View style={styles.rowNoBorder}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{item.machineLocation}</Text>
              </View>
            </Pressable>
          )}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#FFFFFF",          // keep it white
  text: "#111111",
  subtext: "#666666",
  card: "#F7F7F8",
  border: "#E6E6E8",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: COLORS.bg },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  list: { paddingHorizontal: 2 },
  listContent: { paddingBottom: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowNoBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: { color: COLORS.subtext, fontSize: 13 },
  value: { color: COLORS.text, fontSize: 16, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptyText: { color: COLORS.subtext, textAlign: "center" },
});
