import { create } from 'zustand';
import { PlayerProfile, PlayerRole } from '../types/playerProfile';
// Import the user store directly from the location where it's defined
import { useUserStore } from '../stores/userStore';

/**
 * Interface defining the state structure for the player profile store.
 */
interface PlayerProfileState {
  /**
   * @description The current player's profile data. Null if no user is logged in or profile hasn't been fetched.
   * @type {PlayerProfile | null}
   */
  profile: PlayerProfile | null;
  /**
   * @description Loading state for profile-related operations (e.g., fetching, updating).
   * @type {boolean}
   */
  isLoading: boolean;
  /**
   * @description Stores any error message related to profile operations.
   * @type {string | null}
   */
  error: string | null;
  /**
   * @description Indicates if the player is currently authenticated
   * @type {boolean}
   */
  isAuthenticated: boolean;
  /**
   * @description Contains authentication session data
   * @type {object | null}
   */
  session: { userId: string; timestamp: number } | null;
}

/**
 * Interface defining the actions available to modify the player profile state.
 */
interface PlayerProfileActions {
  /**
   * @description Sets the player profile data, typically after login or fetching.
   * @param {PlayerProfile | null} profile - The profile data to set, or null to clear.
   */
  setProfile: (profile: PlayerProfile | null) => void;
  /**
   * @description Updates specific fields of the current player profile.
   * @param {Partial<PlayerProfile>} updates - An object containing the fields to update.
   */
  updateProfile: (updates: Partial<PlayerProfile>) => void;
  /**
   * @description Clears the player profile data, typically on logout.
   */
  clearProfile: () => void;
  /**
   * @description Sets the loading state.
   * @param {boolean} loading - The new loading state.
   */
  setLoading: (loading: boolean) => void;
  /**
   * @description Sets an error message.
   * @param {string | null} error - The error message, or null to clear.
   */
  setError: (error: string | null) => void;
  /**
   * @description Logs in a user with username and password
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {Promise<boolean>} - Success status of the login attempt
   */
  login: (username: string, password: string) => Promise<boolean>;
  
  /**
   * @description Creates a new user account
   * @param {string} username - The new user's username
   * @param {string} password - The new user's password
   * @returns {Promise<boolean>} - Success status of the signup attempt
   */
  signup: (username: string, password: string) => Promise<boolean>;
  
  /**
   * @description Logs the current user out
   */
  logout: () => void;
  
  /**
   * @description Checks for an existing user session
   */
  checkSession: () => void;
  
  /**
   * @description Fetches the player profile using the active user ID
   */
  fetchProfileFromUser: () => void;
  // Potentially add async actions here later for fetching/saving profile data
  // e.g., fetchProfile: (playerId: string) => Promise<void>;
  // e.g., saveProfile: () => Promise<void>;
}

/**
 * Combined type for the complete player profile store.
 */
type PlayerProfileStore = PlayerProfileState & PlayerProfileActions;

/**
 * Creates a Zustand store for managing the player profile state.
 *
 * @example
 * const { profile, setProfile, isLoading } = usePlayerProfileStore();
 * if (isLoading) return <LoadingSpinner />;
 * if (profile) return <UserProfile data={profile} />;
 */
export const usePlayerProfileStore = create<PlayerProfileStore>((set, get) => ({
  // Initial state values
  profile: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  session: null,

  // Action implementations
  setProfile: (profile) => set({ profile: profile, isLoading: false, error: null }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates, updatedAt: new Date() } : null,
      error: null, // Clear error on successful update attempt
    })),

  clearProfile: () => set({ profile: null, isLoading: false, error: null, isAuthenticated: false, session: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error: error, isLoading: false }),

  // Authentication methods that integrate with userStore
  login: async (username, password) => {
    get().setLoading(true);
    try {
      const success = await useUserStore.getState().login(username, password);
      if (success) {
        const session = JSON.parse(localStorage.getItem("user-session") || "null");
        set({ 
          isAuthenticated: true, 
          session,
          error: null
        });
        get().fetchProfileFromUser();
        return true;
      } else {
        set({ 
          error: useUserStore.getState().authError || "Login failed", 
          isAuthenticated: false 
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      set({ error: errorMessage, isAuthenticated: false });
      return false;
    } finally {
      get().setLoading(false);
    }
  },

  signup: async (username, password) => {
    get().setLoading(true);
    try {
      const success = await useUserStore.getState().signup(username, password);
      if (success) {
        const session = JSON.parse(localStorage.getItem("user-session") || "null");
        set({ 
          isAuthenticated: true, 
          session,
          error: null
        });
        // Initialize a new player profile for the user
        const userId = useUserStore.getState().activeProfileId;
        if (userId) {
          const newProfile: PlayerProfile = {
            id: userId,
            username,
            displayName: username,
            email: '',
            role: PlayerRole.REGULAR,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          get().setProfile(newProfile);
        }
        return true;
      } else {
        set({ 
          error: useUserStore.getState().authError || "Signup failed", 
          isAuthenticated: false 
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      set({ error: errorMessage, isAuthenticated: false });
      return false;
    } finally {
      get().setLoading(false);
    }
  },

  logout: () => {
    useUserStore.getState().logout();
    get().clearProfile();
  },

  checkSession: () => {
    const session = JSON.parse(localStorage.getItem("user-session") || "null");
    if (session && session.userId) {
      set({ 
        isAuthenticated: true, 
        session 
      });
      get().fetchProfileFromUser();
    } else {
      set({ 
        isAuthenticated: false, 
        session: null 
      });
    }
  },

  fetchProfileFromUser: () => {
    get().setLoading(true);
    try {
      const userState = useUserStore.getState();
      const userId = userState.activeProfileId;
      
      if (!userId) {
        get().setError("No active user found");
        return;
      }
      
      const userProfile = userState.profiles.find(p => p.id === userId);
      if (!userProfile) {
        get().setError("User profile not found");
        return;
      }
      
      // Map user profile data to player profile
      const playerProfile: PlayerProfile = {
        id: userProfile.id,
        username: userProfile.name,
        displayName: userProfile.name,
        email: '',
        role: userProfile.isAdmin ? PlayerRole.ADMIN : PlayerRole.REGULAR,
        createdAt: new Date(userProfile.createdAt),
        updatedAt: new Date(),
        // Map other fields as needed
        genres: userProfile.genres,
        games: userProfile.games,
        playerType: userProfile.playerType
      };
      
      get().setProfile(playerProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile";
      get().setError(errorMessage);
    } finally {
      get().setLoading(false);
    }
  }
}));
