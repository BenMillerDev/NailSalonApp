// Mock implementation of Google Sign-In for Expo Go
// The real package requires a custom build and won't load in Expo Go
interface GoogleSignInConfig {
  webClientId?: string;
  [key: string]: unknown;
}

export const GoogleSignin = {
  configure: (_config?: GoogleSignInConfig) => {},
  hasPlayServices: async () => true,
  signIn: async () => ({ idToken: null }),
};
