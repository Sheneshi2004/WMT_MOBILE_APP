import { Platform } from "react-native";

const YOUR_PC_IP = "10.205.126.53";
const ANDROID_EMULATOR_API = "http://10.0.2.2:5000/api";
const PHYSICAL_PHONE_API = `http://${YOUR_PC_IP}:5000/api`;
const WEB_API = "http://localhost:5000/api";

// true = emulator, false = physical phone
const USE_EMULATOR = false; 
export const API_BASE_URL = (() => {
    if (Platform.OS === "android") {
        return USE_EMULATOR ? ANDROID_EMULATOR_API : PHYSICAL_PHONE_API;
    }
    return WEB_API;
})();
export const API_TIMEOUT_MS = 15000;
