import { View,Text,TouchableOpacity} from "react-native";
import { router } from "expo-router";

export default function Main(){
    return(
        <View style={{backgroundColor:"rgb(255,255,255)"}}>
            <Text>What would you like to do today</Text>
            <TouchableOpacity
                onPress={()=>{
                    router.replace("/manager/equipment/machines/addAMachine")
                }}
            >
                <Text>Add a Machine</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
            onPress={()=>{
                router.replace("/machines/viewAll")
            }}>
                <Text>
                    View All Machines
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
            onPress={()=>{
                router.replace("/machines/search")
            }}>
                <Text>
                    Search a Machine
                </Text>
            </TouchableOpacity> */}
        </View>
    )
}