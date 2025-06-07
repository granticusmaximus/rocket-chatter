/**
 * Generate a consistent conversation ID for two users.
 * Ensures the same ID is produced regardless of the order of the user IDs.
 *
 * @param {string} uid1 - First user ID
 * @param {string} uid2 - Second user ID
 * @returns {string} - A unique conversation ID
 */
export function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}
