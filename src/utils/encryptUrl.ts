import CryptoJS from "crypto-js";

const SECRET_KEY =
  import.meta.env.VITE_SECRET_KEY || "your-secret-key-change-this";

export function encryptUrl(url: string): string {
  const timestamp = Date.now();
  const data = `${url}|${timestamp}`;
  const hash = CryptoJS.HmacSHA256(data, SECRET_KEY).toString();
  return btoa(data) + "." + hash;
}
