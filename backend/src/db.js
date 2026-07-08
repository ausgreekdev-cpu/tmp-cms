import 'dotenv/config';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'data', 'tmpcms.db'));

import fs from 'fs';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'planner' CHECK(role IN ('admin','planner','viewer')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    road_name TEXT,
    suburb TEXT,
    state TEXT,
    postcode TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tmp_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client_id TEXT REFERENCES clients(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','cancelled')),
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS traffic_management_plans (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES tmp_projects(id),
    site_id TEXT REFERENCES sites(id),
    title TEXT NOT NULL,
    reference TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','review','approved','active','completed','cancelled')),
    plan_type TEXT DEFAULT 'temporary' CHECK(plan_type IN ('temporary','permanent','event','emergency')),
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    traffic_notes TEXT,
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    tmp_id TEXT REFERENCES traffic_management_plans(id),
    project_id TEXT REFERENCES tmp_projects(id),
    name TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size INTEGER,
    description TEXT,
    uploaded_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS plan_activities (
    id TEXT PRIMARY KEY,
    tmp_id TEXT REFERENCES traffic_management_plans(id),
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS email_config (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL DEFAULT 'smtp' CHECK(provider IN ('smtp','outlook','gmail')),
    host TEXT,
    port INTEGER,
    username TEXT,
    password TEXT,
    sender_name TEXT,
    sender_email TEXT,
    secure INTEGER DEFAULT 1,
    enabled INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS email_log (
    id TEXT PRIMARY KEY,
    tmp_id TEXT REFERENCES traffic_management_plans(id),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
    error TEXT,
    sent_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
