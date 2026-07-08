import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('admin'), (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, created_at, updated_at FROM users').all();
  res.json(users);
});

router.post('/', requireRole('admin'), validate(schemas.createUser), (req, res) => {
  const { email, password, name, role } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already in use' });
  const id = uuid();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, email, password, name, role) VALUES (?,?,?,?,?)').run(id, email, hash, name, role);
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
  res.status(201).json(user);
});

router.put('/:id', requireRole('admin'), validate(schemas.updateUser), (req, res) => {
  const { name, email, role } = req.body;
  const fields = []; const vals = [];
  if (name !== undefined) { fields.push('name=?'); vals.push(name); }
  if (email !== undefined) { fields.push('email=?'); vals.push(email); }
  if (role !== undefined) { fields.push('role=?'); vals.push(role); }
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  fields.push("updated_at=datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE users SET ${fields.join(',')} WHERE id=?`).run(...vals);
  const user = db.prepare('SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?').get(req.params.id);
  user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  result.changes ? res.json({ success: true }) : res.status(404).json({ error: 'Not found' });
});

export default router;
