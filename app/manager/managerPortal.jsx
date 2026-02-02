import {View,Text,TouchableOpacity} from 'react-native';
import { router } from 'expo-router';

export default function Portal(){
    return(
        <View style={{backgroundColor:"rgb(255, 255, 255)"}}>
        <Text>What would you like to do today</Text>
        <TouchableOpacity
        onPress={()=>{
            router.replace("/manager/createUser")
        }}>
            <Text>Add a user</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={()=>{
            router.replace("/manager/seeAllUsers")
        }}>
            <Text>
                See all users
            </Text>
        </TouchableOpacity>

        <TouchableOpacity 
        onPress={()=>{
            router.replace("/manager/equipment/machines/machineMain")
        }}>
            <Text>Machines</Text>
        </TouchableOpacity>

        <TouchableOpacity
        onPress={()=>{
            router.replace("../shop/shopMain")
        }}
        >
            <Text>Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
        onPress={()=>{
            router.push("/manager/addAPicture")
        }}>
            <Text>Upload Picture</Text>
        </TouchableOpacity>
        </View>
        
    )
}