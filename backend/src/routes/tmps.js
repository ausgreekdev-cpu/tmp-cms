import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  let query = `
    SELECT t.*, s.name as site_name, s.road_name, s.suburb,
      p.name as project_name,
      u.name as created_by_name
    FROM traffic_management_plans t
    LEFT JOIN sites s ON t.site_id = s.id
    LEFT JOIN tmp_projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.created_by = u.id
  `;
  const params = [];
  if (req.query.status) {
    query += ' WHERE t.status = ?';
    params.push(req.query.status);
  }
  query += ' ORDER BY t.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const tmp = db.prepare(`
    SELECT t.*, s.name as site_name, s.road_name, s.suburb, s.state,
      p.name as project_name, p.client_id,
      c.name as client_name,
      u.name as created_by_name
    FROM traffic_management_plans t
    LEFT JOIN sites s ON t.site_id = s.id
    LEFT JOIN tmp_projects p ON t.project_id = p.id
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN users u ON t.created_by = u.id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!tmp) return res.status(404).json({ error: 'Not found' });
  tmp.documents = db.prepare('SELECT * FROM documents WHERE tmp_id = ?').all(req.params.id);
  tmp.activities = db.prepare(`
    SELECT a.*, u.name as user_name FROM plan_activities a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.tmp_id = ? ORDER BY a.created_at DESC
  `).all(req.params.id);
  res.json(tmp);
});

function generateReference() {
  const year = new Date().getFullYear();
  const count = db.prepare('SELECT COUNT(*) as c FROM traffic_management_plans').get().c + 1;
  return `TMP-${year}-${String(count).padStart(3,'0')}`;
}

router.post('/', validate(schemas.createTMP), (req, res) => {
  const { project_id, site_id, title, plan_type, description, start_date, end_date, traffic_notes } = req.body;
  const id = uuid();
  const reference = generateReference();
  db.prepare('INSERT INTO traffic_management_plans (id, project_id, site_id, title, reference, plan_type, description, start_date, end_date, traffic_notes, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(id, project_id, site_id||null, title, reference, plan_type, description, start_date, end_date, traffic_notes, req.user.id);
  db.prepare('INSERT INTO plan_activities (id, tmp_id, user_id, action, description) VALUES (?,?,?,?,?)').run(uuid(), id, req.user.id, 'created', 'Plan created');
  const tmp = db.prepare('SELECT * FROM traffic_management_plans WHERE id = ?').get(id);
  res.status(201).json(tmp);
});

router.put('/:id', validate(schemas.updateTMP), (req, res) => {
  const { title, site_id, status, plan_type, description, start_date, end_date, traffic_notes } = req.body;
  const old = db.prepare('SELECT status FROM traffic_management_plans WHERE id = ?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE traffic_management_plans SET title=?, site_id=?, status=?, plan_type=?, description=?, start_date=?, end_date=?, traffic_notes=?, updated_at=datetime(\'now\') WHERE id=?').run(title, site_id, status, plan_type, description, start_date, end_date, traffic_notes, req.params.id);
  if (status && status !== old.status) {
    db.prepare('INSERT INTO plan_activities (id, tmp_id, user_id, action, description) VALUES (?,?,?,?,?)').run(uuid(), req.params.id, req.user.id, 'status_change', `Status changed from ${old.status} to ${status}`);
  }
  const tmp = db.prepare('SELECT * FROM traffic_management_plans WHERE id = ?').get(req.params.id);
  res.json(tmp);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM plan_activities WHERE tmp_id = ?').run(req.params.id);
  db.prepare('DELETE FROM documents WHERE tmp_id = ?').run(req.params.id);
  const result = db.prepare('DELETE FROM traffic_management_plans WHERE id = ?').run(req.params.id);
  result.changes ? res.json({ success: true }) : res.status(404).json({ error: 'Not found' });
});

export default router;
