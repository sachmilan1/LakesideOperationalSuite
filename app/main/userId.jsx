import { 
    View, 
    Text, 
    TouchableOpacity, 
    Alert, 
    StyleSheet, 
    ImageBackground 
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { db } from "../../FirebaseConfig";
import {
    collection,
    query,        
    where,        
    getDocs       
} from "firebase/firestore";
import { BlurView } from "expo-blur";

export default function User(){
    // const {userId} = useLocalSearchParams();
    
    const [canEdit, setCanEdit] = useState(false);
    const [canSee, setCanSee] = useState(false);
    
    // const getUserData = async () => {
    //     try {
    //         const userCollectionReference = collection(db,"users");
    //         const q = query(userCollectionReference, where("UserId","==",userId));
    //         const filteredData = await getDocs(q);
            
    //         if (!filteredData.empty) {
    //             const userDoc = filteredData.docs[0]; 
    //             const userData = userDoc.data();
                
    //             setCanEdit(userData.canEdit === "Yes");
    //             setCanSee(userData.canSee === "Yes");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching user data:", error);
    //         Alert.alert("Error", "Failed to load user permissions");
    //     }
    // };
    
    useFocusEffect(
        useCallback(()=>{
            // getUserData();
        }, )
    );
    
    return (
        <ImageBackground
            source={require("../../logo.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                <View style={styles.container}>
                    {/* Always visible buttons */}
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={()=> router.replace('/main/receipts/uploadReceipt')}
                    >
                        <Text style={styles.buttonText}>Submit Receipt</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={()=> router.replace('/main/timeCards/[userId]')}
                    >
                        <Text style={styles.buttonText}>Submit Time Card</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={()=> router.replace('/main/machineLookUp/lookUpMain')}
                    >
                        <Text style={styles.buttonText}>Look for a Machine</Text>
                    </TouchableOpacity>
                    
                    {/* Conditional buttons based on permissions */}
                    {/* {canSee && ( */}
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={()=> router.replace("../../shop/shopMain")}
                        >
                            <Text style={styles.buttonText}>Shop</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={()=> router.replace("/")}
                        >
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    {/* )} */}
                    
                    
                </View>
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
    container: {
        flex: 1,
        padding: 20,
        gap: 15,
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#d50000", // Sharp red
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButton: {
        backgroundColor: "#c98026ff", // Sharp red
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
