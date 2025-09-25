import CryptoJS from "crypto-js";

export function encryptNote(plainText, password) {
  if (!plainText || !password) {
    throw new Error("Both plainText and password are required for encryption");
  }
  
  try {
    const encrypted = CryptoJS.AES.encrypt(plainText, password).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
}

export function decryptNote(cipherText, password) {
  if (!cipherText || !password) {
    throw new Error("Both cipherText and password are required for decryption");
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    // Check if decryption was successful
    if (!decryptedText || decryptedText.length === 0) {
      throw new Error("Invalid password - decryption failed");
    }
    
    // Additional check: if the result contains mostly non-printable characters, it's likely wrong
    const printableCount = decryptedText.split('').filter(char => {
      const code = char.charCodeAt(0);
      return code >= 32 && code <= 126 || code === 10 || code === 13; // printable ASCII + newline/carriage return
    }).length;
    
    if (printableCount < decryptedText.length * 0.7) { // If less than 70% are printable characters
      throw new Error("Invalid password - decryption failed");
    }
    
    return decryptedText;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Invalid password - decryption failed");
  }
}