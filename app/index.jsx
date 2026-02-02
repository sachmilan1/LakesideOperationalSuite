import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    Alert, 
    TextInput, 
    TouchableOpacity, 
    ImageBackground 
  } from 'react-native';
  import { BlurView } from 'expo-blur';
  import AppStyles from './AppStyles';
  import { auth, db } from '../FirebaseConfig';
  import { useState } from 'react';
  import { router } from 'expo-router';
  import { collection, getDocs, where, query } from 'firebase/firestore';
  
  export default function Index() {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
  
    const login = async () => {
      if (!pin.trim()) {
        Alert.alert("Error", "Please enter your PIN");
        return;
      }
  
      setLoading(true);
      const userReference = collection(db, "users");
      
      try {
        const q = query(userReference, where("UserId", "==", pin));
        const userData = await getDocs(q);
  
        if (!userData.empty) {
          const userDoc = userData.docs[0];
          const user = { id: userDoc.id, ...userDoc.data() };
          
          Alert.alert("Success", `Welcome back, ${user.name}!`);
          
          router.push({
            pathname: '/main/userId',
            // params: { userId: pin }
          });
        } else {
          Alert.alert("Error", "Invalid PIN. Please try again.");
        }
      } catch (error) {
        console.error("Error in login function of index.js:", error);
        Alert.alert("Error", "Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <ImageBackground
        source={require('../logo.png')}   // logo as background
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView intensity={40} tint="light" style={styles.blurContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loginContainer}>
              <Text style={styles.welcomeText}>
                Welcome to Lakeside Contracting Management Portal
              </Text>
              <Text style={styles.title}>Login</Text>
  
              <TextInput
                style={styles.input}
                placeholder="Enter your PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                maxLength={6}
              />
  
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={login}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </BlurView>
      </ImageBackground>
    );
  }
  
  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    blurContainer: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    loginContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    welcomeText: {
      fontSize: 16,
      color: '#fff',
      marginBottom: 10,
      textAlign: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#fff',
    },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: '#fff',
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      marginBottom: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: '#d50000', // Sharp red
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: '#ff8a80', // Lighter red
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  