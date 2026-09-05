import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, './src/utils/dummyCodegen.ts'),
      'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, './src/utils/dummyCodegen.ts'),
      '@react-native/assets-registry/registry': path.resolve(__dirname, './src/utils/assetsRegistryMock.ts'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, './src/utils/asyncStorageMock.ts'),
      'react-native-safe-area-context': path.resolve(__dirname, './src/utils/safeAreaMock.tsx'),
      'expo-status-bar': path.resolve(__dirname, './src/utils/statusBarMock.tsx'),
      'lucide-react-native': path.resolve(__dirname, './src/utils/lucideMock.ts'),
      'react-native': path.resolve(__dirname, './src/utils/reactNativeMock.ts'),
    },
  },
});
