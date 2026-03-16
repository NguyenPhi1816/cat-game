import NativeAsyncStorage from "@react-native-async-storage/async-storage";

type NullableString = string | null;

class FallbackStorage {
  private map = new Map<string, string>();

  async getItem(key: string): Promise<NullableString> {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.map.delete(key);
  }
}

const fallback = new FallbackStorage();

const Storage = {
  async getItem(key: string): Promise<NullableString> {
    try {
      const res = await NativeAsyncStorage.getItem(key);
      return res;
    } catch (err) {
      console.warn(
        "Storage: native AsyncStorage unavailable, using fallback",
        err,
      );
      return fallback.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await NativeAsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn(
        "Storage: native AsyncStorage unavailable, using fallback",
        err,
      );
      await fallback.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await NativeAsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(
        "Storage: native AsyncStorage unavailable, using fallback",
        err,
      );
      await fallback.removeItem(key);
    }
  },
};

export default Storage;
