import db from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const hash = bcrypt.hashSync('admin123', 10);
const adminId = uuid();
const clientId = uuid();
const siteId = uuid();
const projectId = uuid();
const tmpId = uuid();

db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?,?,?,?,?)`).run(adminId, 'admin@tmpcms.com', hash, 'Admin User', 'admin');
db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?,?,?,?,?)`).run(uuid(), 'planner@tmpcms.com', bcrypt.hashSync('planner123', 10), 'Jane Planner', 'planner');

db.prepare(`INSERT OR IGNORE INTO clients (id, name, company, email, phone) VALUES (?,?,?,?,?)`).run(clientId, 'John Builder', 'BuilderCorp', 'john@buildercorp.com', '0400 111 222');
db.prepare(`INSERT OR IGNORE INTO clients (id, name, company, email, phone) VALUES (?,?,?,?,?)`).run(uuid(), 'Sarah Roadworks', 'City Roads Pty Ltd', 'sarah@cityroads.com', '0400 333 444');

db.prepare(`INSERT OR IGNORE INTO sites (id, name, road_name, suburb, state) VALUES (?,?,?,?,?)`).run(siteId, 'Main St Intersection', 'Main Street', 'Sydney CBD', 'NSW');
db.prepare(`INSERT OR IGNORE INTO sites (id, name, road_name, suburb, state) VALUES (?,?,?,?,?)`).run(uuid(), 'Highway Overpass', 'Pacific Highway', 'Chatswood', 'NSW');

db.prepare(`INSERT OR IGNORE INTO tmp_projects (id, name, description, client_id, status, start_date, end_date) VALUES (?,?,?,?,?,?,?)`).run(projectId, 'Main St Upgrade', 'Traffic light installation and lane widening', clientId, 'active', '2026-07-01', '2026-09-30');

db.prepare(`INSERT OR IGNORE INTO traffic_management_plans (id, project_id, site_id, title, reference, status, plan_type, description) VALUES (?,?,?,?,?,?,?,?)`).run(tmpId, projectId, siteId, 'Main St Stage 1 Lane Closure', 'TMP-2026-001', 'approved', 'temporary', 'Lane closure for kerb works');

db.prepare(`INSERT OR IGNORE INTO plan_activities (id, tmp_id, user_id, action, description) VALUES (?,?,?,?,?)`).run(uuid(), tmpId, adminId, 'created', 'Plan created and submitted for review');

console.log('Database seeded!');
console.log('Admin: admin@tmpcms.com / admin123');
console.log('Planner: planner@tmpcms.com / planner123');
