export const CREATE_TABLES_SQL = {
  USERS: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mobile_number TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `,

  MEMBERS: `
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      membership_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_payment_date TEXT,
      next_payment_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `,

  REMINDERS: `
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      is_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (member_id) REFERENCES members (id)
    )
  `,

  BACKUP_SETTINGS: `
    CREATE TABLE IF NOT EXISTS backup_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frequency TEXT NOT NULL DEFAULT 'weekly',
      is_enabled INTEGER NOT NULL DEFAULT 0,
      last_backup TEXT,
      next_backup TEXT
    )
  `,

  PAYMENT_TRANSACTIONS: `
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_mode TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
    )
  `
};

export const INSERT_DEFAULT_DATA_SQL = {
  BACKUP_SETTINGS: `
    INSERT INTO backup_settings (frequency, is_enabled) 
    VALUES ('weekly', 0)
  `,

  DEFAULT_USER: `
    INSERT INTO users (mobile_number, pin, created_at, updated_at) 
    VALUES (?, ?, ?, ?)
  `
};
