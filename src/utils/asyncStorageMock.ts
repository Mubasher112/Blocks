const storageMap = new Map<string, string>();

const AsyncStorage = {
  getItem: async (key: string) => storageMap.get(key) || null,
  setItem: async (key: string, value: string) => {
    storageMap.set(key, value);
  },
  removeItem: async (key: string) => {
    storageMap.delete(key);
  },
};

export default AsyncStorage;
