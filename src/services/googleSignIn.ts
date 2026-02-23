import Constants from "expo-constants";
import { GoogleSignin as MockGoogleSignin } from "./googleSignInMock";

// In Expo Go, use the mock to avoid the native module error
// In a custom build, use the real package
const isExpoGo = Constants.appOwnership === "expo";

let GoogleSignin: typeof MockGoogleSignin;

if (isExpoGo) {
  GoogleSignin = MockGoogleSignin;
} else {
  // Dynamic import only runs in custom builds where the native module exists

  // We need require() here because this native module only exists in custom builds
  // A regular import would crash Expo Go before the condition is even checked

  GoogleSignin =
    require("@react-native-google-signin/google-signin").GoogleSignin;
}

export { GoogleSignin };
