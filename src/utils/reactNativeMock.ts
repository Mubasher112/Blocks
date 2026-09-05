import * as RNWeb from 'react-native-web';

export * from 'react-native-web';

export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null,
};

export const NativeModules = (RNWeb as any).NativeModules || {};

export const AssetRegistry = {
  registerAsset: (asset: any) => asset,
  getAssetByID: () => null,
};

export class EventEmitter {
  addListener() {
    return { remove: () => {} };
  }
  removeAllListeners() {}
  emit() {}
}

export const NativeEventEmitter = EventEmitter;

export const BackHandler = {
  addEventListener: (_eventName: string, _handler: () => boolean) => ({
    remove: () => {},
  }),
  removeEventListener: () => {},
  exitApp: () => {},
};

export const AppState = {
  currentState: 'active',
  addEventListener: (_type: string, _listener: (state: string) => void) => ({
    remove: () => {},
  }),
  removeEventListener: () => {},
};
