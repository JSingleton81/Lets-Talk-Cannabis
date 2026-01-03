import { auth } from "../firebase";

/**
 * Get a fresh Firebase ID token with all claims (including "kid")
 * @returns {Promise<string|null>} The Firebase ID token or null if no user is logged in
 */
export const getFreshToken = async () => {
  if (!auth.currentUser) return null;
  
  try {
    // 🔄 Passing 'true' ensures the token includes the "kid" claim
    const token = await auth.currentUser.getIdToken(true); 
    return token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};
