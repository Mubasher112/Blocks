declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const Modal: any;
  export const StyleSheet: any;
  export const BackHandler: any;
  export const AppState: any;
  export type AppStateStatus = any;
  export const PanResponder: any;
  export type PanResponderInstance = any;
  export type GestureResponderEvent = any;
  export type LayoutChangeEvent = any;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: any;
  export const SafeAreaView: any;
  export const useSafeAreaInsets: any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
  export default AsyncStorage;
}

declare module 'lucide-react-native' {
  export const Play: any;
  export const Trophy: any;
  export const Flame: any;
  export const Grid: any;
  export const Map: any;
  export const Lock: any;
  export const Volume2: any;
  export const VolumeX: any;
  export const Pause: any;
  export const RefreshCw: any;
  export const RotateCcw: any;
  export const Home: any;
  export const Award: any;
  export const Star: any;
  export const ArrowLeft: any;
  export const ArrowRight: any;
  export const X: any;
  export const Target: any;
}

declare module 'react-native-web';
