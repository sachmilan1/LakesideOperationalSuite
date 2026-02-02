import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function WorkOrder() {
  return (
    <ImageBackground
      source={require("../../../logo.png")} // adjust if your file is deeper
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Work Orders</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/shop/workOrders/writeAWorkOrder')}
            >
              <Text style={styles.buttonText}>Write a Work Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/shop/workOrders/searchMain')}
            >
              <Text style={styles.buttonText}>Search a Work Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button,styles.back]}
              onPress={() => router.replace('/shop/shopMain')}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#d50000', // sharp red
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '75%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },  back:{backgroundColor:"#ef4444"},

});
