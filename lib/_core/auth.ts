import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";

const WEB_USER_INFO_CRYPTO_PREFIX = "enc:v1:";

async function getWebUserInfoCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.digest("SHA-256", encoder.encode(USER_INFO_KEY));
  return window.crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function encryptWebUserInfo(plainText: string): Promise<string> {
  const key = await getWebUserInfoCryptoKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    encoder.encode(plainText),
  );
  const cipherBytes = new Uint8Array(cipherBuffer);
  return `${WEB_USER_INFO_CRYPTO_PREFIX}${bytesToBase64(iv)}.${bytesToBase64(cipherBytes)}`;
}

async function decryptWebUserInfo(payload: string): Promise<string> {
  if (!payload.startsWith(WEB_USER_INFO_CRYPTO_PREFIX)) {
    return payload;
  }

  const raw = payload.slice(WEB_USER_INFO_CRYPTO_PREFIX.length);
  const [ivB64, cipherB64] = raw.split(".");
  if (!ivB64 || !cipherB64) {
    throw new Error("Invalid encrypted user info payload");
  }

  const key = await getWebUserInfoCryptoKey();
  const iv = base64ToBytes(ivB64);
  const cipherBytes = base64ToBytes(cipherB64);
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    cipherBytes as unknown as BufferSource,
  );
  return new TextDecoder().decode(plainBuffer);
}

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

export async function getSessionToken(): Promise<string | null> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token retrieval");
      return null;
    }

    // Use SecureStore for native
    console.log("[Auth] Getting session token...");
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    console.log(
      "[Auth] Session token retrieved from SecureStore:",
      token ? `present (${token.substring(0, 20)}...)` : "missing",
    );
    return token;
  } catch (error) {
    console.error("[Auth] Failed to get session token:", error);
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token storage");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Setting session token...", token.substring(0, 20) + "...");
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    console.log("[Auth] Session token stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set session token:", error);
    throw error;
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    // Web platform uses cookie-based auth, logout is handled by server clearing cookie
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token removal");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Removing session token...");
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    console.log("[Auth] Session token removed from SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to remove session token:", error);
  }
}

export async function getUserInfo(): Promise<User | null> {
  try {
    console.log("[Auth] Getting user info...");

    let info: string | null = null;
    if (Platform.OS === "web") {
      // Use localStorage for web, but keep persisted payload encrypted
      const stored = window.localStorage.getItem(USER_INFO_KEY);
      info = stored ? await decryptWebUserInfo(stored) : null;
    } else {
      // Use SecureStore for native
      info = await SecureStore.getItemAsync(USER_INFO_KEY);
    }

    if (!info) {
      console.log("[Auth] No user info found");
      return null;
    }
    const parsed = JSON.parse(info);
    const user: User = Platform.OS === "web"
      ? {
          id: parsed.id,
          openId: "",
          name: parsed.name ?? null,
          email: null,
          loginMethod: null,
          lastSignedIn: new Date(parsed.lastSignedIn || Date.now()),
        }
      : {
          ...parsed,
          lastSignedIn: new Date(parsed.lastSignedIn),
        };
    console.log("[Auth] User info retrieved:", user);
    return user;
  } catch (error) {
    console.error("[Auth] Failed to get user info:", error);
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  try {
    console.log("[Auth] Setting user info...", user);

    if (Platform.OS === "web") {
      // Use localStorage for web (avoid persisting sensitive fields in clear text)
      const webSafeUser = {
        id: user.id,
        name: user.name,
        lastSignedIn: user.lastSignedIn,
      };
      const encryptedUserInfo = await encryptWebUserInfo(JSON.stringify(webSafeUser));
      window.localStorage.setItem(USER_INFO_KEY, encryptedUserInfo);
      console.log("[Auth] Sanitized user info stored in localStorage successfully");
      return;
    }

    // Use SecureStore for native
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
    console.log("[Auth] User info stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set user info:", error);
  }
}

export async function clearUserInfo(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      window.localStorage.removeItem(USER_INFO_KEY);
      return;
    }

    // Use SecureStore for native
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch (error) {
    console.error("[Auth] Failed to clear user info:", error);
  }
}
