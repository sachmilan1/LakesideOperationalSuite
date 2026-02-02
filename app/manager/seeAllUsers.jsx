import { Text, View, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function SeeAll() {
  const [userList, setUserList] = useState([]);
  const usersCollectionRef = collection(db, "users");

  const getUserList = async () => {
    try {
      const data = await getDocs(usersCollectionRef);
      const retrievedData = data.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      }));
      setUserList(retrievedData);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserList();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Users</Text>

      <FlatList
        data={userList}
        keyExtractor={(item) => item.docId}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>Name: <Text style={styles.value}>{item.name}</Text></Text>
            <Text style={styles.label}>User ID: <Text style={styles.value}>{item.id}</Text></Text>
            <Text style={styles.label}>Can Edit: <Text style={styles.value}>{item.canEdit ? "Yes" : "No"}</Text></Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f2f2f2",
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#4e8cff",
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    fontWeight: "normal",
    color: "#000",
  },
});
