import { create } from "zustand";
import { sync } from "@tonk/keepsync";

export interface UserProfile {
  id: string;
  name: string;
  passwordHash?: string;  // Make optional for backward compatibility
  createdAt: number;
  genres?: string[];
  games?: string[];
  playerType?: string;
  isAdmin?: boolean;  // Added admin flag
}

interface UserState {
  profiles: UserProfile[];
  activeProfileId: string | null;
  viewingProfileId: string | null;
  authError: string | null;
  isLoading: boolean;
  
  // Authentication actions
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => void;
  
  // Legacy function for backward compatibility
  createProfile: (name: string) => UserProfile;
  setActiveProfile: (id: string) => void;
  setViewingProfile: (id: string | null) => void;
  
  // Profile actions
  updateProfileDetails: (id: string, details: Partial<Omit<UserProfile, "id" | "createdAt" | "passwordHash">>) => void;
  updateProfileName: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;
  isNameUnique: (name: string, excludeId?: string) => boolean;
  resetData: () => void;

  // Add isCurrentUserAdmin helper
  isCurrentUserAdmin: () => boolean;
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Get the active profile ID from localStorage
const getSessionData = () => {
  const sessionData = localStorage.getItem("user-session");
  if (sessionData) {
    try {
      return JSON.parse(sessionData);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Create a stub for locationStore since it doesn't exist
const locationStoreStub = {
  updateUserName: (id: string, name: string) => {
    console.log(`[Stub] Updating user name for ID ${id} to ${name}`);
  },
  resetViewingState: () => {
    console.log("[Stub] Resetting viewing state");
  }
};

// Simplified approach - just use the stub directly
const locationStore = locationStoreStub;

export const useUserStore = create<UserState>(
  sync(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      viewingProfileId: null,
      authError: null,
      isLoading: true,

      // Check for existing session on initialization
      checkSession: () => {
        const session = getSessionData();
        if (session && session.userId) {
          // Verify the user exists
          const userExists = get().profiles.some(profile => profile.id === session.userId);
          if (userExists) {
            set({ activeProfileId: session.userId });
          } else {
            localStorage.removeItem("user-session");
          }
        }
        set({ isLoading: false });
      },
      
      // Legacy createProfile function for backward compatibility
      createProfile: (name) => {
        const id = generateId();
        const newProfile: UserProfile = {
          id,
          name,
          createdAt: Date.now()
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile],
          activeProfileId: id
        }));

        // Update the user name in the location store's map
        locationStore.updateUserName(id, name);

        // Save session
        localStorage.setItem("user-session", JSON.stringify({ 
          userId: id,
          timestamp: Date.now()
        }));

        return newProfile;
      },
      
      // Legacy functions for compatibility
      setActiveProfile: (id) => {
        localStorage.setItem("user-session", JSON.stringify({ 
          userId: id,
          timestamp: Date.now()
        }));

        set({ 
          activeProfileId: id,
          viewingProfileId: null
        });
      },
      
      setViewingProfile: (id) => {
        set({ viewingProfileId: id });
      },
      
      // Login with username and password
      login: async (username, password) => {
        set({ authError: null });
        try {
          // Find the user with matching username
          const normalizedUsername = username.trim().toLowerCase();
          const user = get().profiles.find(
            profile => profile.name.trim().toLowerCase() === normalizedUsername
          );
          
          if (!user) {
            set({ authError: "User not found" });
            return false;
          }
          
          // For now, use simple comparison
          const isMatch = user.passwordHash === password;
          if (!isMatch) {
            set({ authError: "Invalid password" });
            return false;
          }
          
          // Set active profile and save to localStorage
          set({ activeProfileId: user.id });
          localStorage.setItem("user-session", JSON.stringify({ 
            userId: user.id,
            timestamp: Date.now()
          }));
          
          return true;
        } catch (error) {
          console.error("Login error:", error);
          set({ authError: "Login failed" });
          return false;
        }
      },
      
      // Create a new user account
      signup: async (username, password) => {
        set({ authError: null });
        try {
          // Check if username already exists
          const normalizedUsername = username.trim().toLowerCase();
          const isUnique = !get().profiles.some(
            profile => profile.name.trim().toLowerCase() === normalizedUsername
          );
          
          if (!isUnique) {
            set({ authError: "Username already exists" });
            return false;
          }
          
          // Create new user
          const id = generateId();
          const newProfile: UserProfile = {
            id,
            name: username,
            passwordHash: password,
            createdAt: Date.now(),
          };
          
          set(state => ({
            profiles: [...state.profiles, newProfile],
            activeProfileId: id
          }));
          
          // Save to localStorage
          localStorage.setItem("user-session", JSON.stringify({ 
            userId: id,
            timestamp: Date.now()
          }));
          
          // Update user name in location store
          locationStore.updateUserName(id, username);
          
          return true;
        } catch (error) {
          console.error("Signup error:", error);
          set({ authError: "Signup failed" });
          return false;
        }
      },
      
      // Log out current user
      logout: () => {
        localStorage.removeItem("user-session");
        set({ 
          activeProfileId: null,
          viewingProfileId: null,
          authError: null
        });
        
        // Reset location viewing state if needed
        locationStore.resetViewingState();
      },
      
      // Update profile name
      updateProfileName: (id, name) => {
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === id ? { ...profile, name } : profile
          ),
        }));

        // Update the user name in the location store's map
        locationStore.updateUserName(id, name);
      },
      
      // Update profile details
      updateProfileDetails: (id, details) => {
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === id ? { ...profile, ...details } : profile
          ),
        }));
        
        // Update username in location store if name changed
        if (details.name) {
          locationStore.updateUserName(id, details.name);
        }
      },
      
      // Delete account
      deleteProfile: (id) => {
        set((state) => {
          // Filter out the profile to delete
          const updatedProfiles = state.profiles.filter(
            (profile) => profile.id !== id
          );

          // If we're deleting the active profile, log out
          if (state.activeProfileId === id) {
            localStorage.removeItem("user-session");
          }

          return {
            profiles: updatedProfiles,
            activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
            viewingProfileId: state.viewingProfileId === id ? null : state.viewingProfileId,
          };
        });
      },
      
      isNameUnique: (name, excludeId) => {
        const normalized = name.trim().toLowerCase();
        return !get().profiles.some(
          profile => profile.id !== excludeId && profile.name.trim().toLowerCase() === normalized
        );
      },
      
      // Reset data for testing
      resetData: () => {
        localStorage.removeItem("user-session");
        set({ profiles: [], activeProfileId: null, viewingProfileId: null });
      },

      // Check if current user is admin
      isCurrentUserAdmin: () => {
        const { profiles, activeProfileId } = get();
        if (!activeProfileId) return false;
        
        const activeProfile = profiles.find(p => p.id === activeProfileId);
        return activeProfile?.isAdmin === true;
      },

      // Create admin account if it doesn't exist
      onLoad: () => {
        const { profiles } = get();
        const adminExists = profiles.some(profile => 
          profile.name.toLowerCase() === 'admin' && profile.isAdmin === true
        );
        
        if (!adminExists) {
          // Create admin account
          const id = generateId();
          const adminProfile: UserProfile = {
            id,
            name: 'admin',
            passwordHash: 'adminpass',
            createdAt: Date.now(),
            isAdmin: true
          };
          
          set(state => ({
            profiles: [...state.profiles, adminProfile]
          }));
          
          // Update the user name in the location store's map
          locationStore.updateUserName(id, 'admin');
        }
      },
    }),
    {
      docId: "player-finder-users-auth",
      initTimeout: 30000,
      onInitComplete: (store) => {
        // Check for existing session after data is loaded
        store.checkSession();
        // Create admin account if it doesn't exist
        store.onLoad();
      },
      onInitError: (error) => {
        console.error("User sync initialization error:", error);
      }
    },
  ),
);
