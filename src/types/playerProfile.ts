/**
 * Enum defining the possible roles a player can have in the marketplace.
 * Supports multiple roles using bitwise operations if needed, or simple string values.
 */
export enum PlayerRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  SERVICE_PROVIDER = 'service_provider',
  ADMIN = 'admin', // Example of an additional role
  REGULAR = 'regular', // Default role for most users
}

/**
 * Interface defining the structure for a Player Profile in the database.
 * Stores user details, account data, contact information, and marketplace involvement.
 */
export interface PlayerProfile {
  /**
   * @description Unique identifier for the player account.
   * @type {string} - Typically a UUID or database-generated ID.
   */
  player_id: string;

  /**
   * @description The name visible to other users in the application.
   * @type {string}
   */
  username: string;

  /**
   * @description Email address used for login and primary contact.
   * @type {string}
   */
  email: string;

  /**
   * @description Securely hashed password for authentication.
   * @type {string}
   */
  passwordHash: string;

  /**
   * @description Primary method for contacting the user (e.g., email, phone, Discord).
   * @type {string}
   * @optional
   */
  primaryContact?: string;

  /**
   * @description Optional additional contact methods.
   * @type {string[]}
   * @optional
   */
  additionalContacts?: string[];

  /**
   * @description City where the player is located.
   * @type {string}
   * @optional
   */
  city?: string;

  /**
   * @description State or province where the player is located.
   * @type {string}
   * @optional
   */
  stateProvince?: string;

  /**
   * @description Country where the player is located.
   * @type {string}
   * @optional
   */
  country?: string;

  /**
   * @description Latitude coordinate for location-based features.
   * @type {number}
   * @optional
   */
  latitude?: number;

  /**
   * @description Longitude coordinate for location-based features.
   * @type {number}
   * @optional
   */
  longitude?: number;

  /**
   * @description URL or path to the player's profile image or avatar.
   * @type {string}
   * @optional
   */
  profileImageUrl?: string;

  /**
   * @description Roles assigned to the player, indicating their capabilities (e.g., buyer, seller).
   * Can be an array to support multiple roles.
   * @type {PlayerRole[]}
   */
  roles: PlayerRole[];

  /**
   * @description A short biography or description provided by the user.
   * @type {string}
   * @optional
   */
  bio?: string;

  /**
   * @description Timestamp indicating when the player account was created.
   * @type {Date}
   */
  createdAt: Date;

  /**
   * @description Timestamp indicating the last time the player's profile was updated or they logged in.
   * @type {Date}
   */
  updatedAt: Date;

  /**
   * @description Flag indicating if the user is currently an active seller.
   * Useful for quick filtering, though primarily driven by active listings.
   * @type {boolean}
   * @optional
   */
  isActiveSeller?: boolean;

  /**
   * @description Flag indicating if the user is currently an active service provider.
   * Useful for quick filtering, though primarily driven by active service listings.
   * @type {boolean}
   * @optional
   */
  isServiceProvider?: boolean;
}
