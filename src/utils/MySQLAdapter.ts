// MySQL Database Adapter
// This file provides MySQL compatibility layer for the Manga Reader

export interface MySQLConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  insert(table: string, data: Record<string, any>): Promise<string>;
  update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<boolean>;
  delete(table: string, where: Record<string, any>): Promise<boolean>;
  select(table: string, fields?: string[], where?: Record<string, any>, limit?: number): Promise<any[]>;
}

// Mock MySQL Adapter for demonstration
// In production, this would connect to actual MySQL database
export class MySQLAdapter implements DatabaseAdapter {
  private config: MySQLConfig;
  private connected: boolean = false;

  constructor(config: MySQLConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    // In production: implement actual MySQL connection
    if (process.env.NODE_ENV !== 'production') {
      console.log('Connecting to MySQL:', this.config.host);
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    // In production: close MySQL connection
    if (process.env.NODE_ENV !== 'production') {
      console.log('Disconnecting from MySQL');
    }
    this.connected = false;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connected) throw new Error('Not connected to database');
    
    // In production: execute actual MySQL query
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executing query:', sql, params);
    }
    return [];
  }

  async insert(table: string, data: Record<string, any>): Promise<string> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
    await this.query(sql, values);
    
    // Return generated ID (in production, use LAST_INSERT_ID())
    return 'generated-uuid';
  }

  async update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<boolean> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const params = [...Object.values(data), ...Object.values(where)];
    
    await this.query(sql, params);
    return true;
  }

  async delete(table: string, where: Record<string, any>): Promise<boolean> {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    await this.query(sql, Object.values(where));
    return true;
  }

  async select(table: string, fields?: string[], where?: Record<string, any>, limit?: number): Promise<any[]> {
    const fieldList = fields ? fields.join(', ') : '*';
    let sql = `SELECT ${fieldList} FROM ${table}`;
    const params: any[] = [];

    if (where) {
      const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(where));
    }

    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    return await this.query(sql, params);
  }
}

// Database Factory for switching between Supabase and MySQL
export class DatabaseFactory {
  private static adapter: DatabaseAdapter | null = null;
  private static useMySQL: boolean = false;

  static configure(useMySQL: boolean, mysqlConfig?: MySQLConfig) {
    this.useMySQL = useMySQL;
    
    if (useMySQL && mysqlConfig) {
      this.adapter = new MySQLAdapter(mysqlConfig);
    } else {
      // Use Supabase adapter (existing functionality)
      this.adapter = null;
    }
  }

  static getAdapter(): DatabaseAdapter | null {
    return this.adapter;
  }

  static isUsingMySQL(): boolean {
    return this.useMySQL;
  }
}

// Migration utilities
export class MigrationUtils {
  
  // Convert Supabase UUID to MySQL format
  static formatUUID(uuid: string): string {
    return uuid; // MySQL supports UUIDs natively
  }

  // Convert PostgreSQL JSON to MySQL JSON
  static formatJSON(data: any): string {
    return JSON.stringify(data);
  }

  // Convert PostgreSQL timestamps to MySQL format
  static formatTimestamp(timestamp: string | Date): string {
    if (timestamp instanceof Date) {
      return timestamp.toISOString().slice(0, 19).replace('T', ' ');
    }
    return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
  }

  // Convert PostgreSQL arrays to MySQL JSON arrays
  static formatArray(array: any[]): string {
    return JSON.stringify(array);
  }

  // Generate MySQL-compatible license key
  static generateLicenseKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const parts = [];
    
    for (let i = 0; i < 4; i++) {
      let part = '';
      for (let j = 0; j < 4; j++) {
        part += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      parts.push(part);
    }
    
    return parts.join('-');
  }
}

// Configuration validator
export class ConfigValidator {
  
  static validateMySQLConfig(config: MySQLConfig): boolean {
    const required = ['host', 'port', 'database', 'username', 'password'];
    
    for (const field of required) {
      if (!config[field as keyof MySQLConfig]) {
        console.error(`Missing required MySQL config field: ${field}`);
        return false;
      }
    }

    if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
      console.error('Invalid MySQL port number');
      return false;
    }

    return true;
  }

  static sanitizeConfig(config: MySQLConfig): MySQLConfig {
    return {
      host: config.host.trim(),
      port: parseInt(String(config.port), 10),
      database: config.database.trim(),
      username: config.username.trim(),
      password: config.password,
      ssl: config.ssl || false
    };
  }
}

export default {
  MySQLAdapter,
  DatabaseFactory,
  MigrationUtils,
  ConfigValidator
};