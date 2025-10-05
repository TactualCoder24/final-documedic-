// This service implements Google Sign-In using the Google Identity Services (GSI) library.
import { User } from '../types';

// Client ID from the provided credentials.
const GOOGLE_CLIENT_ID = '558634672593-u8f92f1fp92s4fbtakkit0opbsfsv9k2.apps.googleusercontent.com';

let currentUser: User | null = null;
try {
  const storedUser = localStorage.getItem('documedic-user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error('Could not parse stored user from localStorage', e);
  currentUser = null;
}

const listeners: ((user: User | null) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(currentUser));
};

// Define google on the window object for TypeScript.
declare global {
    interface Window {
        google: any;
    }
}

let tokenClient: any = null; // Will be google.accounts.oauth2.TokenClient
let gsiInitialized = false;

const initializeGsi = () => {
    if (window.google && window.google.accounts) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: () => {}, // Callback is dynamically set in signInWithGoogle.
        });
        gsiInitialized = true;
    } else {
        // Retry if the GSI script hasn't loaded yet.
        setTimeout(initializeGsi, 200);
    }
}

// Start the initialization process.
initializeGsi();

export const auth = {
  onAuthStateChanged: (listener: (user: User | null) => void) => {
    listeners.push(listener);
    // Immediately notify with the current state on subscription.
    setTimeout(() => listener(currentUser), 0);
    
    // Return an unsubscribe function.
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },

  signInWithGoogle: (): Promise<User> => {
    return new Promise((resolve, reject) => {
      if (!gsiInitialized || !tokenClient) {
        return reject(new Error("Google Identity Services is not initialized yet. Please try again in a moment."));
      }

      // Override the callback to handle the promise resolution for this specific sign-in attempt.
      tokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            // Use the access token to fetch user profile information.
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
            });

            if (!userInfoResponse.ok) {
              const errorText = await userInfoResponse.text();
              throw new Error(`Failed to fetch user info: ${userInfoResponse.status} ${errorText}`);
            }

            const data = await userInfoResponse.json();
            const user: User = {
              uid: data.sub, // 'sub' is the unique user ID from Google.
              displayName: data.name,
              email: data.email,
              photoURL: data.picture,
            };
            
            currentUser = user;
            localStorage.setItem('documedic-user', JSON.stringify(currentUser));
            notifyListeners();
            resolve(user);
          } catch (error) {
            console.error("Error fetching or processing user info:", error);
            reject(error);
          }
        } else {
          reject(new Error("Google sign-in failed. No access token was received."));
        }
      };
      
      // Trigger the Google sign-in popup.
      tokenClient.requestAccessToken();
    });
  },

  signOut: (): Promise<void> => {
    return new Promise(resolve => {
        // Revoke the token to properly sign out the user from the app.
        if (currentUser && currentUser.email && window.google && window.google.accounts) {
             window.google.accounts.id.revoke(currentUser.email, () => {
                console.log('User token has been revoked from Google.');
             });
        }
        
        currentUser = null;
        localStorage.removeItem('documedic-user');
        notifyListeners();
        resolve();
    });
  },
};
