export const DATABASE_CONFIG = {
  name: 'gym_membership.db',
  version: 1,
  encrypted: false,
  mode: 'no-encryption',
  readonly: false
};

export const TABLE_NAMES = {
  USERS: 'users',
  MEMBERS: 'members',
  REMINDERS: 'reminders',
  BACKUP_SETTINGS: 'backup_settings'
} as const;
