// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {initializeAuth,getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore }  from "firebase/firestore";
import {getStorage} from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyBqAOC-_yw23jOGRKuYpKKxqzoPrNTIGsg",
  authDomain: "lakesidetemp-6953b.firebaseapp.com",
  projectId: "lakesidetemp-6953b",
  storageBucket: "lakesidetemp-6953b.firebasestorage.app",
  messagingSenderId: "842569186615",
  appId: "1:842569186615:web:ddefeae2e8be64bc166eb2"
};


export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app,{
    persistence:getReactNativePersistence(ReactNativeAsyncStorage)
});

// the above is to store the user token and its cache.



// export const auth = getAuth(app);

// the above is to just simply authenticate the user

export const db = getFirestore(app);
export const storage = getStorage(app);

