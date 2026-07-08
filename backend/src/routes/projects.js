import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, c.name as client_name,
      (SELECT COUNT(*) FROM traffic_management_plans WHERE project_id = p.id) as plan_count
    FROM tmp_projects p LEFT JOIN clients c ON p.client_id = c.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(projects);
});

router.get('/:id', (req, res) => {
  const project = db.prepare(`
    SELECT p.*, c.name as client_name
    FROM tmp_projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = ?
  `).get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  project.plans = db.prepare('SELECT * FROM traffic_management_plans WHERE project_id = ?').all(req.params.id);
  project.documents = db.prepare('SELECT * FROM documents WHERE project_id = ?').all(req.params.id);
  res.json(project);
});

router.post('/', validate(schemas.createProject), (req, res) => {
  const { name, description, client_id, status, start_date, end_date } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO tmp_projects (id, name, description, client_id, status, start_date, end_date) VALUES (?,?,?,?,?,?,?)').run(id, name, description, client_id||null, status, start_date, end_date);
  const project = db.prepare('SELECT * FROM tmp_projects WHERE id = ?').get(id);
  res.status(201).json(project);
});

router.put('/:id', (req, res) => {
  const { name, description, client_id, status, start_date, end_date } = req.body;
  const fields = []; const vals = [];
  if (name !== undefined) { fields.push('name=?'); vals.push(name); }
  if (description !== undefined) { fields.push('description=?'); vals.push(description); }
  if (client_id !== undefined) { fields.push('client_id=?'); vals.push(client_id||null); }
  if (status !== undefined) { fields.push('status=?'); vals.push(status); }
  if (start_date !== undefined) { fields.push('start_date=?'); vals.push(start_date); }
  if (end_date !== undefined) { fields.push('end_date=?'); vals.push(end_date); }
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  fields.push("updated_at=datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE tmp_projects SET ${fields.join(',')} WHERE id=?`).run(...vals);
  const project = db.prepare('SELECT * FROM tmp_projects WHERE id = ?').get(req.params.id);
  project ? res.json(project) : res.status(404).json({ error: 'Not found' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tmp_projects WHERE id = ?').run(req.params.id);
  result.changes ? res.json({ success: true }) : res.status(404).json({ error: 'Not found' });
});

export default router;
