/**
 * Database Adapter
 *
 * This module provides a unified interface for database operations that works
 * with both SQLite (local development) and Cloudflare D1 (production).
 *
 * Usage:
 * - Local: Uses better-sqlite3 with ./data/kredo.db
 * - Production: Uses Cloudflare D1 via bindings
 */

import type Database from "better-sqlite3";

// Type definitions for D1
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// Environment detection
export const isCloudflare =
  typeof process === "undefined" ||
  process.env.CF_PAGES === "1" ||
  process.env.CLOUDFLARE_ENV !== undefined;

/**
 * Database Adapter Interface
 * Provides a consistent API across SQLite and D1
 */
export interface DatabaseAdapter {
  // Execute a query that returns a single row
  get<T = unknown>(query: string, ...params: unknown[]): Promise<T | undefined>;

  // Execute a query that returns multiple rows
  all<T = unknown>(query: string, ...params: unknown[]): Promise<T[]>;

  // Execute a query that modifies data (INSERT, UPDATE, DELETE)
  run(
    query: string,
    ...params: unknown[]
  ): Promise<{ changes: number; lastInsertRowid: number | string }>;

  // Execute multiple statements (for schema creation)
  exec(sql: string): Promise<void>;

  // Transaction support
  transaction<T>(fn: () => T | Promise<T>): Promise<T>;
}

/**
 * SQLite Adapter (for local development)
 */
export class SQLiteAdapter implements DatabaseAdapter {
  constructor(private db: Database.Database) {}

  async get<T = unknown>(
    query: string,
    ...params: unknown[]
  ): Promise<T | undefined> {
    return this.db.prepare(query).get(...params) as T | undefined;
  }

  async all<T = unknown>(query: string, ...params: unknown[]): Promise<T[]> {
    return this.db.prepare(query).all(...params) as T[];
  }

  async run(
    query: string,
    ...params: unknown[]
  ): Promise<{ changes: number; lastInsertRowid: number | string }> {
    const result = this.db.prepare(query).run(...params);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid as number,
    };
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async transaction<T>(fn: () => T | Promise<T>): Promise<T> {
    const txn = this.db.transaction(fn as () => T);
    return txn() as T;
  }
}

/**
 * D1 Adapter (for Cloudflare Pages/Workers)
 */
export class D1Adapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}

  async get<T = unknown>(
    query: string,
    ...params: unknown[]
  ): Promise<T | undefined> {
    const stmt = this.db.prepare(query).bind(...params);
    const result = await stmt.first<T>();
    return result ?? undefined;
  }

  async all<T = unknown>(query: string, ...params: unknown[]): Promise<T[]> {
    const stmt = this.db.prepare(query).bind(...params);
    const result = await stmt.all<T>();
    return result.results ?? [];
  }

  async run(
    query: string,
    ...params: unknown[]
  ): Promise<{ changes: number; lastInsertRowid: number | string }> {
    const stmt = this.db.prepare(query).bind(...params);
    const result = await stmt.run();
    return {
      changes: result.meta.rows_written,
      lastInsertRowid: 0, // D1 doesn't provide this directly
    };
  }

  async exec(sql: string): Promise<void> {
    // D1 exec doesn't support multiple statements well, so we split them
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await this.db.prepare(statement).run();
    }
  }

  async transaction<T>(fn: () => T | Promise<T>): Promise<T> {
    // D1 doesn't support explicit transactions yet, so we just execute the function
    // In the future, this could use D1's batch API for better atomicity
    return await fn();
  }
}

/**
 * Get database adapter based on environment
 */
export function getDbAdapter(
  db: Database.Database | D1Database
): DatabaseAdapter {
  // Check if it's a D1 database (has prepare method that returns a D1PreparedStatement)
  if ("dump" in db || "batch" in db) {
    return new D1Adapter(db as D1Database);
  }
  return new SQLiteAdapter(db as Database.Database);
}
