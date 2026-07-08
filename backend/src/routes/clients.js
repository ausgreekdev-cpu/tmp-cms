import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  res.json(clients);
});

router.get('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Not found' });
  client.projects = db.prepare('SELECT id, name, status, start_date, end_date FROM tmp_projects WHERE client_id = ?').all(req.params.id);
  res.json(client);
});

router.post('/', validate(schemas.createClient), (req, res) => {
  const { name, company, email, phone, address, notes } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO clients (id, name, company, email, phone, address, notes) VALUES (?,?,?,?,?,?,?)').run(id, name, company, email, phone, address, notes);
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  res.status(201).json(client);
});

router.put('/:id', validate(schemas.updateClient), (req, res) => {
  const { name, company, email, phone, address, notes } = req.body;
  const fields = []; const vals = [];
  if (name !== undefined) { fields.push('name=?'); vals.push(name); }
  if (company !== undefined) { fields.push('company=?'); vals.push(company); }
  if (email !== undefined) { fields.push('email=?'); vals.push(email); }
  if (phone !== undefined) { fields.push('phone=?'); vals.push(phone); }
  if (address !== undefined) { fields.push('address=?'); vals.push(address); }
  if (notes !== undefined) { fields.push('notes=?'); vals.push(notes); }
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  fields.push("updated_at=datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE clients SET ${fields.join(',')} WHERE id=?`).run(...vals);
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  client ? res.json(client) : res.status(404).json({ error: 'Not found' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  result.changes ? res.json({ success: true }) : res.status(404).json({ error: 'Not found' });
});

export default router;
