import { create } from 'zustand';
import { PlayerProfile, PlayerRole } from '../types/playerProfile';

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

  // Action implementations
  setProfile: (profile) => set({ profile: profile, isLoading: false, error: null }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates, updatedAt: new Date() } : null,
      error: null, // Clear error on successful update attempt
    })),

  clearProfile: () => set({ profile: null, isLoading: false, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error: error, isLoading: false }),

  // Example placeholder for an async fetch action (implementation would involve API calls)
  // fetchProfile: async (playerId) => {
  //   get().setLoading(true);
  //   try {
  //     // const fetchedProfile = await api.fetchPlayerProfile(playerId);
  //     // get().setProfile(fetchedProfile);
  //   } catch (err) {
  //     // get().setError(err.message || 'Failed to fetch profile');
  //   } finally {
  //      // get().setLoading(false); // Ensure loading is turned off
  //   }
  // },
}));
