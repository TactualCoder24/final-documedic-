import { User } from '../types';
import { findUserByEmail, createUser } from './data';

const GOOGLE_CLIENT_ID = '354302826671-b75pmk7i5i3qplj93hbkmb6jt7jqssdl.apps.googleusercontent.com';

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

const persistUser = (user: User) => {
    currentUser = user;
    localStorage.setItem('documedic-user', JSON.stringify(currentUser));
    notifyListeners();
}

const clearUser = () => {
    currentUser = null;
    localStorage.removeItem('documedic-user');
    notifyListeners();
}


// --- Google Auth ---
declare global {
    interface Window {
        google: any;
    }
}

let tokenClient: any = null;
let gsiInitialized = false;

const initializeGsi = () => {
    if (window.google && window.google.accounts) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: () => {},
        });
        gsiInitialized = true;
    } else {
        setTimeout(initializeGsi, 200);
    }
}
initializeGsi();


// --- Main Auth Service ---
export const auth = {
  onAuthStateChanged: (listener: (user: User | null) => void) => {
    listeners.push(listener);
    setTimeout(() => listener(currentUser), 0);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  signInWithGoogle: (): Promise<User> => {
    return new Promise((resolve, reject) => {
      if (!gsiInitialized || !tokenClient) {
        return reject(new Error("Google Identity Services not initialized."));
      }
      tokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
            });
            if (!userInfoResponse.ok) throw new Error('Failed to fetch user info.');
            
            const data = await userInfoResponse.json();
            const user: User = {
              uid: data.sub,
              displayName: data.name,
              email: data.email,
              photoURL: data.picture,
            };
            
            persistUser(user);
            resolve(user);
          } catch (error) { reject(error); }
        } else { reject(new Error("Google sign-in failed.")); }
      };
      tokenClient.requestAccessToken();
    });
  },

  signUpWithEmailPassword: async (email: string, password: string): Promise<User> => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }
    // WARNING: Storing plain text passwords is a major security risk.
    // This is for demonstration purposes only. In a real app, always hash passwords.
    await createUser(email, password);
    const user: User = {
        uid: email, // Use email as UID for simplicity
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
    };
    persistUser(user);
    return user;
  },

  signInWithEmailPassword: async (email: string, password: string): Promise<User> => {
    const userRecord = await findUserByEmail(email);
    if (!userRecord || userRecord.userData.password !== password) {
        throw new Error("Invalid email or password.");
    }
    const user: User = {
        uid: userRecord.userId,
        email: userRecord.userId,
        displayName: userRecord.userId.split('@')[0],
        photoURL: null,
    };
    persistUser(user);
    return user;
  },

  signOut: (): Promise<void> => {
    return new Promise(resolve => {
        if (currentUser && currentUser.email && window.google && window.google.accounts) {
             window.google.accounts.id.revoke(currentUser.email, () => {});
        }
        clearUser();
        resolve();
    });
  },
};