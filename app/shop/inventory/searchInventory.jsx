import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function SearchInventory() {
  return (
    <ImageBackground
      source={require("../../../logo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={60} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Search Inventory</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/shop/inventory/lookForParts/byPartNumber')}
            >
              <Text style={styles.buttonText}>Search by Part Number</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/shop/inventory/lookForParts/name')}
            >
              <Text style={styles.buttonText}>Search by Name</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/shop/inventory/InventoryMain')}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 30,
    color: '#111827',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#d50000', // sharp red
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
