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
    // Add overall timeout to prevent infinite loading - increased to 30 seconds for WASM
    return Promise.race([
      this.initializeDatabaseInternal(),
      new Promise<SQLiteDBConnection>((_, reject) => {
        const timeoutError = new Error('Database initialization timeout after 30 seconds. This is likely due to WebAssembly (WASM) compatibility issues. Please try: 1) Refreshing the page, 2) Using a different browser (Chrome/Firefox), or 3) Checking browser console for WASM errors.');
        setTimeout(() => reject(timeoutError), 30000);
      })
    ]);
  }

  private async initializeDatabaseInternal(): Promise<SQLiteDBConnection> {
    try {
      // Initialize web store first (required for web platform)
      if (typeof window !== 'undefined') {
        console.log('Initializing web store...');
        
        // Wait for jeep-sqlite custom element to be defined and connected (with timeout)
        await Promise.race([
          this.waitForJeepSqlite(),
          new Promise<void>((resolve) => setTimeout(() => {
            console.warn('jeep-sqlite wait timeout, proceeding...');
            resolve();
          }, 3000))
        ]);
        
        // Skip WASM readiness check - WASM errors are expected and handled internally by jeep-sqlite
        // The database might work despite WASM errors
        console.log('Skipping WASM readiness check - proceeding with database initialization');
        
        try {
          await CapacitorSQLite.initWebStore();
          console.log('Web store initialized successfully');
        } catch (initError) {
          console.warn('initWebStore error (may be expected):', initError);
          // Continue anyway - sometimes this throws but still works
        }
        
        // Reduced wait time
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('Initializing database connection...');
      
      // Single attempt with longer timeouts for WASM initialization
      try {
        const sqlite = new SQLiteConnection(CapacitorSQLite);
        
        // Create connection with longer timeout
        this.database = await Promise.race([
          sqlite.createConnection(
            DATABASE_CONFIG.name,
            DATABASE_CONFIG.encrypted,
            DATABASE_CONFIG.mode,
            DATABASE_CONFIG.version,
            DATABASE_CONFIG.readonly
          ),
          new Promise<SQLiteDBConnection>((_, reject) =>
            setTimeout(() => reject(new Error('Connection creation timeout')), 10000)
          )
        ]);

        // Open database with longer timeout - WASM errors are expected but database might still work
        try {
          await Promise.race([
            this.database.open(),
            new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error('Database open timeout')), 15000)
            )
          ]);
        } catch (openError: any) {
          // Check if database is actually open despite the error
          // Sometimes WASM errors occur but database still opens
          try {
            const isOpenCheck = await this.database.isDBOpen();
            if (isOpenCheck.result) {
              console.log('Database is open despite error - continuing...');
            } else {
              throw openError;
            }
          } catch {
            throw openError;
          }
        }
        
        // Verify database is actually open before proceeding
        const isOpen = await this.database.isDBOpen();
        if (!isOpen.result) {
          throw new Error('Database failed to open');
        }
        
        await this.createTables();
        await this.insertDefaultData();
        
        console.log('Database initialized successfully');
        return this.database;
      } catch (error: any) {
        console.error('Database connection failed:', error);
        
        // If it's a WASM-related timeout, provide more helpful error
        const errorMessage = error?.message || error?.toString() || '';
        if (errorMessage.includes('timeout') || errorMessage.includes('WASM')) {
          console.error('WASM initialization appears to have failed. The database may not work properly.');
          console.error('This is often caused by WebAssembly compatibility issues.');
        }
        
        // Don't retry - fail fast to avoid infinite loading
        throw error;
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async waitForJeepSqlite(): Promise<void> {
    return new Promise((resolve) => {
      const jeepElement = document.querySelector('jeep-sqlite') as any;
      const isDefined = customElements.get('jeep-sqlite');
      
      if (jeepElement && isDefined && jeepElement.isConnected) {
        console.log('jeep-sqlite is already ready and connected');
        resolve();
        return;
      }

      console.log('Waiting for jeep-sqlite to be ready...');
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max
      
      const checkInterval = setInterval(() => {
        attempts++;
        const element = document.querySelector('jeep-sqlite') as any;
        const defined = customElements.get('jeep-sqlite');
        
        if (element && defined && element.isConnected) {
          console.log('jeep-sqlite is ready and connected after', attempts * 100, 'ms');
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('jeep-sqlite not ready after timeout, proceeding anyway...');
          resolve();
        }
      }, 100);
    });
  }

  private async waitForJeepSqliteWasmReady(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Waiting for jeep-sqlite WASM to be ready...');
      
      // Reduced wait time - don't wait too long
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds max
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        // Check if WebAssembly is available
        const hasWebAssembly = typeof WebAssembly !== 'undefined';
        
        // Don't wait for SQL - just check WebAssembly and proceed quickly
        if (hasWebAssembly && attempts > 5) {
          console.log('WASM appears ready after', attempts * 100, 'ms');
          clearInterval(checkInterval);
          // Minimal wait - WASM errors are expected and handled internally
          setTimeout(resolve, 500);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('WASM readiness check timeout, proceeding...');
          resolve();
        }
      }, 100);
    });
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
