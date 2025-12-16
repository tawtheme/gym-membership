import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DATABASE_CONFIG, TABLE_NAMES } from './database.config';
import { CREATE_TABLES_SQL, INSERT_DEFAULT_DATA_SQL } from './sql-scripts';

@Injectable({
  providedIn: 'root'
})
export class DatabaseInitService {
  private database: SQLiteDBConnection | null = null;

  async initializeDatabase(): Promise<SQLiteDBConnection> {
    try {
      // Initialize web store first (required for web platform)
      if (typeof window !== 'undefined') {
        console.log('Initializing web store...');
        await CapacitorSQLite.initWebStore();
        console.log('Web store initialized successfully');
        
        // Wait a bit for WASM to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('Initializing database connection...');
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      this.database = await sqlite.createConnection(
        DATABASE_CONFIG.name,
        DATABASE_CONFIG.encrypted,
        DATABASE_CONFIG.mode,
        DATABASE_CONFIG.version,
        DATABASE_CONFIG.readonly
      );

      await this.database.open();
      await this.createTables();
      await this.insertDefaultData();
      
      return this.database;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) return;

    // Create all tables
    await this.database.execute(CREATE_TABLES_SQL.USERS);
    await this.database.execute(CREATE_TABLES_SQL.MEMBERS);
    await this.database.execute(CREATE_TABLES_SQL.REMINDERS);
    await this.database.execute(CREATE_TABLES_SQL.BACKUP_SETTINGS);
  }

  private async insertDefaultData(): Promise<void> {
    if (!this.database) return;

    // Insert default backup settings if not exists
    const settings = await this.database.query(`SELECT COUNT(*) as count FROM ${TABLE_NAMES.BACKUP_SETTINGS}`);
    if (settings.values && settings.values[0]['count'] === 0) {
      await this.database.execute(INSERT_DEFAULT_DATA_SQL.BACKUP_SETTINGS);
    }

    // Insert default user if not exists
    const users = await this.database.query(`SELECT COUNT(*) as count FROM ${TABLE_NAMES.USERS}`);
    if (users.values && users.values[0]['count'] === 0) {
      const now = new Date().toISOString();
      await this.database.run(INSERT_DEFAULT_DATA_SQL.DEFAULT_USER, ['9816810805', '4842', now, now]);
    }
  }

  getDatabase(): SQLiteDBConnection | null {
    return this.database;
  }
}
