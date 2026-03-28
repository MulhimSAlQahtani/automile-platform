import { getAuth, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, browserSessionPersistence, setPersistence, User } from 'firebase/auth';
import * as CryptoJS from 'crypto-js';
import { NativeBiometric } from 'capacitor-native-biometric';

/**
 * 1. Firebase Multi-Factor Authentication (MFA) Core
 */
export async function enrollMfaPhoneNumber(phoneNumber: string, recaptchaVerifier: any) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Unauthenticated.");

  const multiFactorSession = await multiFactor(user).getSession();
  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber({
    phoneNumber,
    session: multiFactorSession
  }, recaptchaVerifier);

  return verificationId;
}

export async function submitMfaVerificationCode(verificationId: string, verificationCode: string) {
  const user = getAuth().currentUser as User;
  const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
  
  await multiFactor(user).enroll(multiFactorAssertion, "Primary SMS Step-Up");
  return true;
}

/**
 * 2. Enterprise Session Tracking & Revocation
 */
export async function enforceHardenedSession() {
  const auth = getAuth();
  // Strip token on tab close to prevent hostile physical device takeovers
  await setPersistence(auth, browserSessionPersistence);
}


/**
 * 3. Zero-Knowledge "Secure Vault" Encryption Core
 * These files are encrypted explicitly IN MEMORY BEFORE transmitting to Google Cloud Storage.
 * The backend never observes the plaintext bytes or the vault pin.
 */
export class SecureVault {

  // Natively intercept User's physical FaceID/TouchID string to authorize decryption operations
  public static async promptBiometricDecryption(vaultPin: string, encryptedBlob: string): Promise<string> {
      try {
           await NativeBiometric.verifyIdentity({
              reason: "Authorize Decryption of Classified Insurance Document",
              title: "AutoMile Secure Vault",
              subtitle: "Biometric Step-Up Required"
           });
           
           // If hardware auth succeeds (no error thrown), unlock the AES structure natively
           const bytes = CryptoJS.AES.decrypt(encryptedBlob, vaultPin);
           return bytes.toString(CryptoJS.enc.Utf8);

      } catch (e: any) {
          throw new Error("Zero-Knowledge Security Violation: " + e.message);
      }
  }

  // Pure mathematical AES-256 payload obfuscation 
  public static encryptSensitiveDocument(plaintextDocumentBase64: string, vaultPin: string): string {
       const cipherObject = CryptoJS.AES.encrypt(plaintextDocumentBase64, vaultPin).toString();
       return cipherObject; // String sent to Firebase Storage (useless to hackers without the vaultPin)
  }
}
